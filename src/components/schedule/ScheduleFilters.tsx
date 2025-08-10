'use client'

import { useState, useEffect } from 'react'
import { VideoCategory, DifficultyLevel, ClassLocation } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface ScheduleFiltersProps {
  onFiltersChange: (filters: ScheduleFilters) => void
  initialFilters?: Partial<ScheduleFilters>
  className?: string
}

export interface ScheduleFilters {
  category: VideoCategory | 'ALL'
  difficulty: DifficultyLevel | 'ALL'
  location: ClassLocation | 'ALL'
  instructorId: string | 'ALL'
  dateRange: {
    start: string | null
    end: string | null
  }
}

export interface InstructorOption {
  id: string
  name: string
  avatar: string | null
}

const defaultFilters: ScheduleFilters = {
  category: 'ALL',
  difficulty: 'ALL',
  location: 'ALL',
  instructorId: 'ALL',
  dateRange: {
    start: null,
    end: null
  }
}

const categories = [
  { value: 'ALL', label: 'All Styles' },
  { value: VideoCategory.VINYASA, label: 'Vinyasa' },
  { value: VideoCategory.HATHA, label: 'Hatha' },
  { value: VideoCategory.YIN, label: 'Yin' },
  { value: VideoCategory.RESTORATIVE, label: 'Restorative' },
  { value: VideoCategory.MEDITATION, label: 'Meditation' },
  { value: VideoCategory.BREATHWORK, label: 'Breathwork' },
  { value: VideoCategory.POWER, label: 'Power' },
  { value: VideoCategory.GENTLE, label: 'Gentle' },
]

const difficulties = [
  { value: 'ALL', label: 'All Levels' },
  { value: DifficultyLevel.BEGINNER, label: 'Beginner' },
  { value: DifficultyLevel.INTERMEDIATE, label: 'Intermediate' },
  { value: DifficultyLevel.ADVANCED, label: 'Advanced' },
  { value: DifficultyLevel.ALL_LEVELS, label: 'Mixed Levels' },
]

const locations = [
  { value: 'ALL', label: 'All Locations' },
  { value: ClassLocation.STUDIO, label: 'In Studio' },
  { value: ClassLocation.ONLINE, label: 'Online' },
  { value: ClassLocation.HYBRID, label: 'Hybrid' },
]

export function ScheduleFilters({ 
  onFiltersChange, 
  initialFilters = {}, 
  className = '' 
}: ScheduleFiltersProps) {
  const [filters, setFilters] = useState<ScheduleFilters>({
    ...defaultFilters,
    ...initialFilters
  })
  const [instructors, setInstructors] = useState<InstructorOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch instructors on mount
  useEffect(() => {
    async function fetchInstructors() {
      try {
        const response = await fetch('/api/instructors')
        const data = await response.json()
        if (data.success) {
          setInstructors(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch instructors:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = (key: keyof ScheduleFilters, value: ScheduleFilters[keyof ScheduleFilters]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: value || null
      }
    }))
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'dateRange') {
      return value.start || value.end
    }
    return value !== 'ALL'
  })

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-sage-800">Filter Classes</h3>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="text-sage-600 hover:text-sage-800"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-sage-700">Style</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={filters.category === category.value ? "primary" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('category', category.value)}
                className="text-xs"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-sage-700">Level</label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty.value}
                variant={filters.difficulty === difficulty.value ? "primary" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('difficulty', difficulty.value)}
                className="text-xs"
              >
                {difficulty.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-sage-700">Location</label>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => (
              <Button
                key={location.value}
                variant={filters.location === location.value ? "primary" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('location', location.value)}
                className="text-xs"
              >
                {location.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Instructor Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-sage-700">Instructor</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.instructorId === 'ALL' ? "primary" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('instructorId', 'ALL')}
              className="text-xs"
            >
              All Instructors
            </Button>
            {!isLoading && instructors.map((instructor) => (
              <Button
                key={instructor.id}
                variant={filters.instructorId === instructor.id ? "primary" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('instructorId', instructor.id)}
                className="text-xs"
              >
                {instructor.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-sage-700">Date Range</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-sage-600 block mb-1">From</label>
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-xs text-sage-600 block mb-1">To</label>
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                min={filters.dateRange.start || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}