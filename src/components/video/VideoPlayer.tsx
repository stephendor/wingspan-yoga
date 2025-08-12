'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  videoId: string
  title?: string
  posterUrl?: string | null
  startTime?: number
  onProgress?: (progress: number) => void
  onEnd?: () => void
  className?: string
}

interface PlaybackInfo {
  playbackUrl: string
  token: string
  expiresAt: number
}

export function VideoPlayer({
  videoId,
  title,
  posterUrl,
  startTime = 0,
  onProgress,
  onEnd,
  className = ''
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  type PlyrInstance = {
    destroy: () => void
    on: (event: string, callback: (event?: unknown) => void) => void
    currentTime: number
    duration: number
  source: unknown
  }
  const playerRef = useRef<PlyrInstance | null>(null)
  
  const [playbackInfo, setPlaybackInfo] = useState<PlaybackInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Progress tracking
  // Removed unused timeout ref to satisfy lint rules
  const lastProgressRef = useRef(0)

  // Fetch playback information
  const fetchPlaybackInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/videos/${videoId}/playback-info`)
      const data = await response.json()

      if (!data.success || !data.playbackInfo) {
        throw new Error(data.error || 'Failed to load video playback information')
      }

      setPlaybackInfo(data.playbackInfo)
    } catch (err) {
      console.error('Error fetching playback info:', err)
      setError(err instanceof Error ? err.message : 'Failed to load video')
    } finally {
      setLoading(false)
    }
  }, [videoId])

  // Initialize Plyr player
  const initializePlayer = useCallback(async () => {
    if (!videoRef.current || !playbackInfo) return

    try {
      // Import Plyr dynamically (client-side only)
      const Plyr = (await import('plyr')).default
      
      // Destroy existing player if it exists
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }

      // Configure Plyr options
      const options = {
        controls: [
          'play-large',
          'play',
          'progress', 
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'pip',
          'fullscreen'
        ],
        settings: ['quality', 'speed'],
        quality: {
          default: 'auto',
          options: ['auto', '1080', '720', '480', '360']
        },
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 2]
        },
        seekTime: 10,
        keyboard: { focused: true, global: false },
        tooltips: { controls: true, seek: true },
        captions: { active: false, update: true },
        poster: posterUrl || undefined,
        preload: 'metadata',
        ratio: '16:9',
        storage: { enabled: true, key: 'plyr' }
      }

      // Initialize Plyr
      const player = new Plyr(videoRef.current, options)
      playerRef.current = player

      // Set up HLS source with token
  const hlsSource = {
        type: 'video',
        title: title || 'Video',
        sources: [
          {
            src: playbackInfo.playbackUrl,
            type: 'application/x-mpegURL',
    // Mux signed playback expects token in query string; headers not required
          }
        ],
        poster: posterUrl || undefined,
      }

      // Load the source
      player.source = hlsSource

      // Set up event listeners
      player.on('ready', () => {
        console.log('Player ready')
        
        // Resume from last position if provided
        if (startTime > 0) {
          player.currentTime = startTime
        }
      })

      player.on('loadedmetadata', () => {
        console.log('Video metadata loaded')
      })

      player.on('timeupdate', () => {
        if (onProgress && player.duration) {
          const progress = (player.currentTime / player.duration) * 100
          
          // Only call onProgress if significant change (avoid excessive calls)
          if (Math.abs(progress - lastProgressRef.current) > 1) {
            lastProgressRef.current = progress
            onProgress(progress)
          }
        }
      })

      player.on('ended', () => {
        console.log('Video ended')
        if (onEnd) {
          onEnd()
        }
      })

  player.on('error', (event: unknown) => {
        console.error('Player error:', event)
        setError('Video playback error. Please try again.')
      })

      // Network error handling
      player.on('canplaythrough', () => {
        setRetryCount(0) // Reset retry count on successful load
      })

    } catch (err) {
      console.error('Error initializing player:', err)
      setError('Failed to initialize video player')
    }
  }, [playbackInfo, title, posterUrl, startTime, onProgress, onEnd])

  // Handle retry
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1)
      fetchPlaybackInfo()
    }
  }, [retryCount, fetchPlaybackInfo])

  // Check token expiration and refresh if needed
  const checkTokenExpiration = useCallback(async () => {
    if (!playbackInfo) return

    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiration = playbackInfo.expiresAt - now

    // Refresh token if expiring within 30 minutes
    if (timeUntilExpiration < 1800) {
      console.log('Refreshing playback token...')
      await fetchPlaybackInfo()
    }
  }, [playbackInfo, fetchPlaybackInfo])

  // Initialize on mount and when playback info changes
  useEffect(() => {
    fetchPlaybackInfo()
  }, [fetchPlaybackInfo])

  useEffect(() => {
    if (playbackInfo) {
      initializePlayer()
    }
  }, [playbackInfo, initializePlayer])

  // Set up token refresh interval
  useEffect(() => {
    if (!playbackInfo) return

    const checkInterval = setInterval(checkTokenExpiration, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(checkInterval)
  }, [playbackInfo, checkTokenExpiration])

  // Cleanup on unmount
  useEffect(() => {
  return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (err) {
          console.error('Error destroying player:', err)
        }
        playerRef.current = null
      }
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className={`relative aspect-video bg-charcoal-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
          <p className="text-white text-sm">Loading video...</p>
        </div>
        {posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`relative aspect-video bg-charcoal-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Unable to Load Video</h3>
            <p className="text-gray-300 text-sm max-w-md">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleRetry} 
              variant="primary"
              size="sm"
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
            </Button>
          </div>
        </div>
        {posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-auto"
        poster={posterUrl || undefined}
        preload="metadata"
        crossOrigin="anonymous"
      >
        <p className="text-center text-charcoal-600 p-8">
          Your browser doesn&apos;t support HTML5 video. 
          <a href={playbackInfo?.playbackUrl} className="text-sage-600 underline ml-1">
            Download the video
          </a> 
          instead.
        </p>
      </video>

      {/* Load Plyr CSS */}
      <style jsx global>{`
        @import url('https://cdn.plyr.io/3.7.8/plyr.css');
        
        /* Custom Plyr styling to match design system */
        .plyr {
          border-radius: 8px;
        }
        
        .plyr--video {
          background: #1a1a1a;
        }
        
        .plyr__control--overlaid {
          background: rgba(139, 170, 136, 0.9);
        }
        
        .plyr__control--overlaid:hover {
          background: rgba(139, 170, 136, 1);
        }
        
        .plyr__progress__buffer,
        .plyr__progress__played {
          color: #8baa88;
        }
        
        .plyr__control:hover,
        .plyr__control[aria-expanded=true] {
          background: #8baa88;
        }
        
        .plyr__menu__container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  )
}