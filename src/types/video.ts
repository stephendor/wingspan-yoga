// Video-specific types extending base types from index.ts
export interface VideoLibraryData {
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

export interface VideosListResponse {
  success: boolean
  videos?: VideoLibraryData[]
  error?: string
}

export interface VideoDetailsResponse {
  success: boolean
  video?: VideoDetails
  error?: string
}

export interface VideoDetails {
  id: string
  title: string
  description: string | null
  duration: number
  thumbnailUrl: string | null
  category: string
  difficulty: string
  tags: string[]
  membershipRequired: MembershipType
  isPublic: boolean
  hasAccess: boolean
  viewCount: number
  instructor: {
    id: string
    name: string
    avatar: string | null
    bio: string | null
  }
  progress?: {
    progress: number
    completed: boolean
    lastWatched: string
  }
}

export interface PlaybackInfoResponse {
  success: boolean
  playbackInfo?: {
    playbackUrl: string
    token: string
    expiresAt: number
  }
  error?: string
}

// Enum types matching Prisma schema
export type VideoCategory = 'VINYASA' | 'HATHA' | 'YIN' | 'RESTORATIVE' | 'MEDITATION' | 'BREATHWORK' | 'POWER' | 'GENTLE'
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS'
export type MembershipType = 'FREE' | 'BASIC' | 'PREMIUM' | 'UNLIMITED' | 'ADMIN'

// Constants for UI display
export const VIDEO_CATEGORIES: { value: VideoCategory; label: string }[] = [
  { value: 'VINYASA', label: 'Vinyasa' },
  { value: 'HATHA', label: 'Hatha' },
  { value: 'YIN', label: 'Yin' },
  { value: 'RESTORATIVE', label: 'Restorative' },
  { value: 'MEDITATION', label: 'Meditation' },
  { value: 'BREATHWORK', label: 'Breathwork' },
  { value: 'POWER', label: 'Power' },
  { value: 'GENTLE', label: 'Gentle' },
]

export const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ALL_LEVELS', label: 'All Levels' },
]

// Utility functions
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes === 0) {
    return `${remainingSeconds}s`
  }
  return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`
}

export function getCategoryColor(category: VideoCategory): string {
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

export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors = {
    BEGINNER: 'bg-green-100 text-green-700',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
    ADVANCED: 'bg-red-100 text-red-700',
    ALL_LEVELS: 'bg-blue-100 text-blue-700',
  }
  return colors[difficulty] || 'bg-gray-100 text-gray-700'
}