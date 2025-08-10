'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ScheduleFilters, ScheduleView } from '@/components/schedule'
import type { ScheduleFilters as ScheduleFiltersType } from '@/components/schedule'
import type { ClassWithInstructor } from '@/app/api/classes/route'

interface ScheduleClientProps {
  initialClasses: ClassWithInstructor[]
}

const defaultFilters: ScheduleFiltersType = {
  category: 'ALL',
  difficulty: 'ALL',
  location: 'ALL',
  instructorId: 'ALL',
  dateRange: {
    start: null,
    end: null
  }
}

export function ScheduleClient({ initialClasses }: ScheduleClientProps) {
  const router = useRouter()
  const [classes, setClasses] = useState<ClassWithInstructor[]>(initialClasses)
  const [filters, setFilters] = useState<ScheduleFiltersType>(defaultFilters)
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetchParams, setLastFetchParams] = useState<string>('')

  // Build query parameters from filters
  const buildQueryParams = useCallback((filters: ScheduleFiltersType) => {
    const params = new URLSearchParams()
    
    if (filters.category !== 'ALL') {
      params.set('category', filters.category)
    }
    
    if (filters.difficulty !== 'ALL') {
      params.set('difficulty', filters.difficulty)
    }
    
    if (filters.location !== 'ALL') {
      params.set('location', filters.location)
    }
    
    if (filters.instructorId !== 'ALL') {
      params.set('instructorId', filters.instructorId)
    }
    
    if (filters.dateRange.start) {
      params.set('startDate', filters.dateRange.start)
    }
    
    if (filters.dateRange.end) {
      params.set('endDate', filters.dateRange.end)
    }
    
    return params.toString()
  }, [])

  // Fetch classes from API when filters change
  const fetchClasses = useCallback(async (filters: ScheduleFiltersType) => {
    const queryParams = buildQueryParams(filters)
    
    // Avoid unnecessary API calls
    if (queryParams === lastFetchParams) {
      return
    }
    
    setIsLoading(true)
    setLastFetchParams(queryParams)
    
    try {
      const url = queryParams ? `/api/classes?${queryParams}` : '/api/classes'
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setClasses(data.data)
      } else {
        console.error('Failed to fetch classes:', data.message)
        // Keep current classes on error
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      // Keep current classes on error
    } finally {
      setIsLoading(false)
    }
  }, [buildQueryParams, lastFetchParams])

  // Handle filter changes with debouncing
  const handleFiltersChange = useCallback((newFilters: ScheduleFiltersType) => {
    setFilters(newFilters)
  }, [])

  // Debounce API calls when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClasses(filters)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [filters, fetchClasses])

  // Handle class booking
  const handleBookClass = useCallback((classId: string) => {
    router.push(`/book/${classId}`)
  }, [router])

  // Check if any filters are active (for performance optimization)
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'dateRange') {
        return value.start || value.end
      }
      return value !== 'ALL'
    })
  }, [filters])

  // Performance: Use initial classes if no filters are active and we haven't fetched yet
  const displayClasses = useMemo(() => {
    if (!hasActiveFilters && lastFetchParams === '') {
      return initialClasses
    }
    return classes
  }, [hasActiveFilters, lastFetchParams, initialClasses, classes])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
          <ScheduleFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </div>
      </div>

      {/* Schedule Display */}
      <div className="lg:col-span-3">
        <ScheduleView
          classes={displayClasses}
          filters={filters}
          isLoading={isLoading}
          onBookClass={handleBookClass}
        />
      </div>
    </div>
  )
}