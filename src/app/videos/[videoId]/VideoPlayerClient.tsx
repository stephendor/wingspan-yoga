'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, 
  Play, 
  Clock, 
  User, 
  Share2, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { useAuth } from '@/hooks/useAuth'
import type { VideoLibraryData, VideoDetails } from '@/types/video'
import { 
  formatDuration, 
  getCategoryColor, 
  getDifficultyColor,
  VIDEO_CATEGORIES,
  DIFFICULTY_LEVELS
} from '@/types/video'


interface VideoPlayerClientProps {
  videoId: string
}

export function VideoPlayerClient({ videoId }: VideoPlayerClientProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  // Video states
  const [video, setVideo] = useState<VideoDetails | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<VideoLibraryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Progress tracking
  const [currentProgress, setCurrentProgress] = useState(0)
  const [hasStartedWatching, setHasStartedWatching] = useState(false)
  const progressUpdateRef = useRef<NodeJS.Timeout>()

  // Fetch video details
  const fetchVideoDetails = useCallback(async () => {
    if (!isAuthenticated && !authLoading) {
      setError('Please sign in to watch videos')
      setLoading(false)
      return
    }

    if (authLoading) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/videos/${videoId}`)
      const data = await response.json()

      if (!data.success || !data.video) {
        setError(data.error || 'Video not found')
        setLoading(false)
        return
      }

      setVideo(data.video)
      setCurrentProgress(data.video.progress?.progress || 0)
      
      // Fetch related videos (same category or instructor)
      fetchRelatedVideos(data.video.category, data.video.instructor.id)

    } catch (err) {
      console.error('Error fetching video:', err)
      setError('Failed to load video. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [videoId, isAuthenticated, authLoading])

  // Fetch related videos
  const fetchRelatedVideos = async (category: string, instructorId: string) => {
    try {
      const params = new URLSearchParams({
        category,
        limit: '6'
      })
      
      const response = await fetch(`/api/videos?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.videos) {
        // Filter out current video and limit to 3-6 related videos
        const related = data.videos
          .filter((v: VideoLibraryData) => v.id !== videoId)
          .slice(0, 6)
        setRelatedVideos(related)
      }
    } catch (err) {
      console.error('Error fetching related videos:', err)
      // Don't show error for related videos - it's not critical
    }
  }

  // Update progress in database
  const updateProgress = useCallback(async (progress: number, completed = false) => {
    if (!video || !hasStartedWatching) return

    try {
      await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress, completed }),
      })
    } catch (err) {
      console.error('Error updating progress:', err)
      // Don't show error to user - progress updates are background operations
    }
  }, [videoId, video, hasStartedWatching])

  // Handle progress updates from video player
  const handleProgressUpdate = useCallback((progress: number) => {
    setCurrentProgress(progress)
    
    if (!hasStartedWatching && progress > 1) {
      setHasStartedWatching(true)
    }

    // Debounce progress updates (every 10 seconds or on major milestones)
    if (progressUpdateRef.current) {
      clearTimeout(progressUpdateRef.current)
    }

    progressUpdateRef.current = setTimeout(() => {
      const completed = progress >= 90
      updateProgress(progress, completed)
    }, 10000) // Update every 10 seconds

    // Immediate update for completion
    if (progress >= 90 && hasStartedWatching) {
      updateProgress(progress, true)
    }
  }, [updateProgress, hasStartedWatching])

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    updateProgress(100, true)
  }, [updateProgress])

  // Share functionality
  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title || 'Yoga Video',
          text: `Watch "${video?.title}" on Wingspan Yoga`,
          url,
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        // You could add a toast notification here
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }

  useEffect(() => {
    fetchVideoDetails()
    
    // Cleanup progress update timeout on unmount
    return () => {
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current)
      }
    }
  }, [fetchVideoDetails])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-sage-500 mx-auto" />
          <p className="text-charcoal-600">Loading video...</p>
        </div>
      </div>
    )
  }

  // Authentication required
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto" variant="elevated">
          <CardContent className="p-8">
            <Lock className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
              Sign In Required
            </h3>
            <p className="text-charcoal-600 mb-6">
              Please sign in to watch our yoga videos and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signin">
                <Button variant="primary">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto" variant="elevated">
          <CardContent className="p-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
              Unable to Load Video
            </h3>
            <p className="text-charcoal-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={fetchVideoDetails} variant="primary">
                Try Again
              </Button>
              <Link href="/videos">
                <Button variant="outline">Back to Library</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No access to video
  if (video && !video.hasAccess) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto" variant="elevated">
          <CardContent className="p-8">
            <Lock className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
              Membership Required
            </h3>
            <p className="text-charcoal-600 mb-6">
              This video requires a {video.membershipRequired.toLowerCase()} membership or higher to watch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/membership">
                <Button variant="primary">
                  Upgrade Membership
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/videos">
                <Button variant="outline">Back to Library</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!video) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-charcoal-600">
        <Link 
          href="/videos" 
          className="hover:text-sage-600 flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Video Library</span>
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium truncate">
          {video.title}
        </span>
      </nav>

      {/* Video Player */}
      <div className="space-y-6">
        <VideoPlayer
          videoId={video.id}
          title={video.title}
          posterUrl={video.thumbnailUrl}
          startTime={video.progress ? Math.floor((video.progress.progress / 100) * video.duration) : 0}
          onProgress={handleProgressUpdate}
          onEnd={handleVideoEnd}
        />

        {/* Video Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Meta */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal-900">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(video.duration)}</span>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category as any)}`}>
                  {VIDEO_CATEGORIES.find(cat => cat.value === video.category)?.label}
                </span>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty as any)}`}>
                  {DIFFICULTY_LEVELS.find(diff => diff.value === video.difficulty)?.label}
                </span>

                <div className="flex items-center space-x-1">
                  <span>{video.viewCount} views</span>
                </div>
              </div>

              {/* Progress */}
              {video.progress && (
                <div className="flex items-center space-x-3 bg-sage-50 p-3 rounded-soft">
                  <CheckCircle className="h-5 w-5 text-sage-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-sage-700 font-medium">
                        {video.progress.completed ? 'Completed' : 'In Progress'}
                      </span>
                      <span className="text-sage-600">
                        {Math.round(currentProgress)}%
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-sage-200 rounded-full h-2">
                      <div 
                        className="bg-sage-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {video.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-charcoal-900">Description</h3>
                <div className="prose prose-charcoal max-w-none">
                  <p className="text-charcoal-700 leading-relaxed whitespace-pre-line">
                    {video.description}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-charcoal-900">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-charcoal-100 text-charcoal-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  {video.instructor.avatar ? (
                    <img
                      src={video.instructor.avatar}
                      alt={video.instructor.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-sage-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-charcoal-900">
                      {video.instructor.name}
                    </h4>
                    {video.instructor.bio && (
                      <p className="text-sm text-charcoal-600 mt-1 line-clamp-3">
                        {video.instructor.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Video
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-charcoal-900">Related Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedVideos.map((relatedVideo) => (
              <Link 
                key={relatedVideo.id} 
                href={relatedVideo.hasAccess ? `/videos/${relatedVideo.id}` : '/membership'}
                className="block group"
              >
                <Card className="overflow-hidden hover:shadow-natural transition-shadow duration-300" variant="elevated">
                  <div className="relative aspect-video bg-charcoal-100 overflow-hidden">
                    {relatedVideo.thumbnailUrl ? (
                      <img
                        src={relatedVideo.thumbnailUrl}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage-100 to-sage-200">
                        <Play className="h-8 w-8 text-sage-400" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      {relatedVideo.hasAccess ? (
                        <div className="bg-white/90 rounded-full p-2">
                          <Play className="h-4 w-4 text-sage-600" fill="currentColor" />
                        </div>
                      ) : (
                        <div className="bg-white/90 rounded-full p-2">
                          <Lock className="h-4 w-4 text-charcoal-600" />
                        </div>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-soft flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(relatedVideo.duration)}
                    </div>

                    {/* Premium badge */}
                    {!relatedVideo.hasAccess && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-soft flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Premium
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h4 className="font-semibold text-charcoal-900 line-clamp-2 group-hover:text-sage-700 transition-colors">
                      {relatedVideo.title}
                    </h4>
                    <p className="text-sm text-charcoal-600 mt-1">
                      {relatedVideo.instructor.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}