'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid, List, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClassCard } from './ClassCard'
import type { ClassWithInstructor } from '@/app/api/classes/route'
import type { ScheduleFilters } from './ScheduleFilters'

export interface ScheduleViewProps {
  classes: ClassWithInstructor[]
  filters: ScheduleFilters
  isLoading?: boolean
  onBookClass?: (classId: string) => void
  className?: string
}

type ViewMode = 'grid' | 'list' | 'calendar'

interface GroupedClasses {
  [date: string]: ClassWithInstructor[]
}

export function ScheduleView({ 
  classes, 
  filters, 
  isLoading = false, 
  onBookClass,
  className = '' 
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filter classes based on current filters
  const filteredClasses = useMemo(() => {
    return classes.filter(classItem => {
      // Category filter
      if (filters.category !== 'ALL' && classItem.category !== filters.category) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty !== 'ALL' && classItem.difficulty !== filters.difficulty) {
        return false
      }

      // Location filter
      if (filters.location !== 'ALL' && classItem.location !== filters.location) {
        return false
      }

      // Instructor filter
      if (filters.instructorId !== 'ALL' && classItem.instructor.id !== filters.instructorId) {
        return false
      }

      // Date range filter
      const classDate = new Date(classItem.startTime)
      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start)
        if (classDate < startDate) {
          return false
        }
      }
      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end)
        endDate.setHours(23, 59, 59, 999) // End of day
        if (classDate > endDate) {
          return false
        }
      }

      return true
    })
  }, [classes, filters])

  // Group classes by date for calendar view
  const groupedClasses = useMemo<GroupedClasses>(() => {
    return filteredClasses.reduce((acc, classItem) => {
      const date = new Date(classItem.startTime).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(classItem)
      return acc
    }, {} as GroupedClasses)
  }, [filteredClasses])

  const viewModes = [
    { mode: 'grid' as ViewMode, icon: Grid, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'calendar' as ViewMode, icon: Calendar, label: 'Calendar' },
  ]

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const renderGridView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {filteredClasses.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            layout
          >
            <ClassCard
              classData={classItem}
              onBookClick={onBookClass}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )

  const renderListView = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {filteredClasses.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            layout
          >
            <ClassCard
              classData={classItem}
              onBookClick={onBookClass}
              className="max-w-none"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )

  const renderCalendarView = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      {Object.entries(groupedClasses)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([date, dayClasses]) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-2">
              <h3 className="text-lg font-semibold text-sage-800 border-b-2 border-sage-200 pb-2">
                {new Date(date).toLocaleDateString([], {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dayClasses
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((classItem) => (
                  <ClassCard
                    key={classItem.id}
                    classData={classItem}
                    onBookClick={onBookClass}
                  />
                ))}
            </div>
          </div>
        ))}
    </motion.div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with view controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-sage-800">
            {filteredClasses.length === 0 && !isLoading ? 'No Classes Found' : 'Class Schedule'}
          </h2>
          <p className="text-sm text-sage-600">
            {filteredClasses.length} classe{filteredClasses.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="flex space-x-1 bg-sage-100 p-1 rounded-lg">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="flex items-center space-x-2 px-3"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filteredClasses.length === 0 && !isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 mx-auto bg-sage-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-sage-600" />
            </div>
            <h3 className="text-lg font-medium text-sage-800">No classes match your filters</h3>
            <p className="text-sm text-sage-600">
              Try adjusting your filters or check back later for new classes.
            </p>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'calendar' && renderCalendarView()}
        </AnimatePresence>
      )}
    </div>
  )
}