'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, Filter, Play, Lock, Clock, User, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import type { 
  VideoLibraryData, 
  VideosListResponse
} from '@/types/video'
import { 
  VIDEO_CATEGORIES, 
  DIFFICULTY_LEVELS, 
  formatDuration, 
  getCategoryColor, 
  getDifficultyColor 
} from '@/types/video'

// Dropdown component
interface DropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}

function Dropdown({ label, value, onChange, options, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-charcoal-700 mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-charcoal-200 rounded-soft text-sm text-charcoal-700 hover:border-charcoal-300 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition-colors"
      >
        <span className={value ? 'text-charcoal-900' : 'text-charcoal-400'}>
          {value ? options.find(opt => opt.value === value)?.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-charcoal-200 rounded-soft shadow-zen z-10">
          <button
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left text-sm text-charcoal-600 hover:bg-charcoal-50 first:rounded-t-soft"
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-charcoal-50 last:rounded-b-soft ${
                value === option.value ? 'text-sage-600 bg-sage-50' : 'text-charcoal-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Video card component - inline for now since we need specific styling
function VideoCard({ video }: { video: VideoLibraryData }) {
  return (
    <Card className="group overflow-hidden hover:shadow-natural transition-shadow duration-300" variant="elevated">
      <div className="relative aspect-video bg-charcoal-100 overflow-hidden">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage-100 to-sage-200">
            <Play className="h-12 w-12 text-sage-400" />
          </div>
        )}
        
        {/* Overlay with play button or lock */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {video.hasAccess ? (
            <div className="bg-white/90 rounded-full p-3">
              <Play className="h-6 w-6 text-sage-600" fill="currentColor" />
            </div>
          ) : (
            <div className="bg-white/90 rounded-full p-3">
              <Lock className="h-6 w-6 text-charcoal-600" />
            </div>
          )}
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-soft flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {formatDuration(video.duration)}
        </div>

        {/* Lock badge for restricted content */}
        {!video.hasAccess && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-soft flex items-center">
            <Lock className="h-3 w-3 mr-1" />
            Premium
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-charcoal-900 line-clamp-2 group-hover:text-sage-700 transition-colors">
              {video.title}
            </h3>
            {video.description && (
              <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">
                {video.description}
              </p>
            )}
          </div>

          {/* Categories & Difficulty */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
              {VIDEO_CATEGORIES.find(cat => cat.value === video.category)?.label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
              {DIFFICULTY_LEVELS.find(diff => diff.value === video.difficulty)?.label}
            </span>
          </div>

          {/* Instructor info */}
          <div className="flex items-center space-x-2 pt-2 border-t border-charcoal-100">
            <div className="flex items-center space-x-2">
              {video.instructor.avatar ? (
                <Image
                  src={video.instructor.avatar}
                  alt={video.instructor.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-sage-200 flex items-center justify-center">
                  <User className="h-3 w-3 text-sage-600" />
                </div>
              )}
              <span className="text-sm text-charcoal-600">{video.instructor.name}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function VideoLibraryClient() {
  const { isAuthenticated, isLoading } = useAuth()
  const [videos, setVideos] = useState<VideoLibraryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')

  // Fetch videos with filters
  const fetchVideos = useCallback(async () => {
    if (!isAuthenticated && !isLoading) {
      setError('Please sign in to access the video library')
      setLoading(false)
      return
    }

    if (isLoading) return // Wait for auth to load

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append('search', searchTerm.trim())
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty)

      const response = await fetch(`/api/videos?${params.toString()}`)
      const data: VideosListResponse = await response.json()

      if (data.success && data.videos) {
        setVideos(data.videos)
      } else {
        setError(data.error || 'Failed to load videos')
      }
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError('Failed to load videos. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedDifficulty, isAuthenticated, isLoading])

  // Fetch videos on mount and when filters change
  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVideos()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, fetchVideos])

  // Filter reset
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedDifficulty('')
  }

  const hasActiveFilters = searchTerm || selectedCategory || selectedDifficulty

  // Show auth error
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-lg p-8 shadow-soft max-w-md mx-auto">
          <Lock className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
            Sign In Required
          </h3>
          <p className="text-charcoal-600 mb-6">
            Please sign in to access our video library and start your yoga practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signin">
              <Button variant="primary">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <Input
              type="text"
              placeholder="Search videos by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <Dropdown
            label="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={VIDEO_CATEGORIES}
            placeholder="All Categories"
          />
        </div>

        {/* Difficulty Filter */}
        <div>
          <Dropdown
            label="Difficulty"
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
            options={DIFFICULTY_LEVELS}
            placeholder="All Levels"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-charcoal-600">
            {loading ? 'Loading...' : `${videos.length} video${videos.length !== 1 ? 's' : ''} found`}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-charcoal-600"
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-soft overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVideos}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Search className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
              No Videos Found
            </h3>
            <p className="text-charcoal-600 mb-4">
              {hasActiveFilters
                ? "We couldn't find any videos matching your filters. Try adjusting your search criteria."
                : "No videos are currently available in the library."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Video Grid */}
      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link 
              key={video.id} 
              href={video.hasAccess ? `/videos/${video.id}` : '/membership'}
              className="block"
            >
              <VideoCard video={video} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}