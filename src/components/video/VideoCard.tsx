'use client'

import { Play, Lock, Clock, User } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

// Types
interface VideoData {
  id: string
  title: string
  description: string | null
  duration: number
  thumbnailUrl: string | null
  category: VideoCategory
  difficulty: DifficultyLevel
  tags: string[]
  membershipRequired: MembershipType
  isPublic: boolean
  hasAccess: boolean
  instructor: {
    id: string
    name: string
    avatar: string | null
  }
}

type VideoCategory = 'VINYASA' | 'HATHA' | 'YIN' | 'RESTORATIVE' | 'MEDITATION' | 'BREATHWORK' | 'POWER' | 'GENTLE'
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS'
type MembershipType = 'FREE' | 'BASIC' | 'PREMIUM' | 'UNLIMITED' | 'ADMIN'

const VIDEO_CATEGORIES: { value: VideoCategory; label: string }[] = [
  { value: 'VINYASA', label: 'Vinyasa' },
  { value: 'HATHA', label: 'Hatha' },
  { value: 'YIN', label: 'Yin' },
  { value: 'RESTORATIVE', label: 'Restorative' },
  { value: 'MEDITATION', label: 'Meditation' },
  { value: 'BREATHWORK', label: 'Breathwork' },
  { value: 'POWER', label: 'Power' },
  { value: 'GENTLE', label: 'Gentle' },
]

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ALL_LEVELS', label: 'All Levels' },
]

// Helper functions
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes === 0) {
    return `${remainingSeconds}s`
  }
  return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`
}

function getCategoryColor(category: VideoCategory): string {
  const colors = {
    VINYASA: 'bg-ocean-100 text-ocean-700',
    HATHA: 'bg-sage-100 text-sage-700',
    YIN: 'bg-terracotta-100 text-terracotta-700',
    RESTORATIVE: 'bg-purple-100 text-purple-700',
    MEDITATION: 'bg-indigo-100 text-indigo-700',
    BREATHWORK: 'bg-teal-100 text-teal-700',
    POWER: 'bg-red-100 text-red-700',
    GENTLE: 'bg-green-100 text-green-700',
  }
  return colors[category] || 'bg-gray-100 text-gray-700'
}

function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors = {
    BEGINNER: 'bg-green-100 text-green-700',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
    ADVANCED: 'bg-red-100 text-red-700',
    ALL_LEVELS: 'bg-blue-100 text-blue-700',
  }
  return colors[difficulty] || 'bg-gray-100 text-gray-700'
}

interface VideoCardProps {
  video: VideoData
}

export function VideoCard({ video }: VideoCardProps) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (video.hasAccess) {
      return (
        <Link href={`/videos/${video.id}`} className="block">
          {children}
        </Link>
      )
    }
    return (
      <Link href="/membership" className="block">
        {children}
      </Link>
    )
  }

  return (
    <CardWrapper>
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
    </CardWrapper>
  )
}