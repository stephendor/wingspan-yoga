'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, Video } from 'lucide-react'
import Image from 'next/image'
import type { ClassWithInstructor } from '@/app/api/classes/route'
import { ClassLocation, DifficultyLevel } from '@prisma/client'

export interface ClassCardProps {
  classData: ClassWithInstructor
  onBookClick?: (classId: string) => void
  className?: string
}

const locationIcons = {
  [ClassLocation.STUDIO]: MapPin,
  [ClassLocation.ONLINE]: Video,
  [ClassLocation.HYBRID]: Users,
}

const difficultyColors = {
  [DifficultyLevel.BEGINNER]: 'text-green-600 bg-green-100',
  [DifficultyLevel.INTERMEDIATE]: 'text-yellow-600 bg-yellow-100',
  [DifficultyLevel.ADVANCED]: 'text-red-600 bg-red-100',
  [DifficultyLevel.ALL_LEVELS]: 'text-blue-600 bg-blue-100',
}

const categoryColors = {
  VINYASA: 'text-purple-600',
  HATHA: 'text-sage-600',
  YIN: 'text-blue-600',
  RESTORATIVE: 'text-pink-600',
  MEDITATION: 'text-indigo-600',
  BREATHWORK: 'text-teal-600',
  POWER: 'text-orange-600',
  GENTLE: 'text-green-600',
}

export function ClassCard({ classData, onBookClick, className = '' }: ClassCardProps) {
  const {
    id,
    title,
    description,
    startTime,
    endTime,
    capacity,
    price,
    difficulty,
    category,
    location,
    instructor,
    _count
  } = classData

  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  const availableSpots = capacity - _count.bookings
  const isFullyBooked = availableSpots <= 0
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0

  const LocationIcon = locationIcons[location]

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const getDuration = () => {
    const durationMs = endDate.getTime() - startDate.getTime()
    const minutes = Math.round(durationMs / (1000 * 60))
    return `${minutes} min`
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardContent className="p-6">
          {/* Header */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-sage-800 leading-tight">
                {title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[difficulty]}`}>
                {difficulty.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${categoryColors[category as keyof typeof categoryColors] || 'text-sage-600'}`}>
                {category.replace('_', ' ')}
              </span>
              <span className="text-lg font-bold text-sage-800">
                {formatPrice(price)}
              </span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {/* Details Grid */}
          <div className="space-y-3 mb-4">
            {/* Date and Time */}
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Calendar className="h-4 w-4 text-sage-600" />
              <span>{formatDate(startDate)}</span>
              <Clock className="h-4 w-4 text-sage-600 ml-2" />
              <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
              <span className="text-xs text-gray-500">({getDuration()})</span>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <LocationIcon className="h-4 w-4 text-sage-600" />
              <span className="capitalize">{location.toLowerCase()}</span>
            </div>

            {/* Instructor */}
            <div className="flex items-center space-x-2">
              {instructor.avatar ? (
                <Image
                  src={instructor.avatar}
                  alt={instructor.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-sage-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-sage-700">
                    {instructor.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-sage-700">
                {instructor.name}
              </span>
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-sage-600" />
              <span className={`text-sm font-medium ${
                isFullyBooked 
                  ? 'text-red-600' 
                  : isAlmostFull 
                    ? 'text-yellow-600' 
                    : 'text-green-600'
              }`}>
                {isFullyBooked 
                  ? 'Fully Booked' 
                  : `${availableSpots} spot${availableSpots !== 1 ? 's' : ''} left`
                }
              </span>
              <span className="text-xs text-gray-500">
                ({_count.bookings}/{capacity} booked)
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            className="w-full"
            variant={isFullyBooked ? "outline" : "primary"}
            disabled={isFullyBooked}
            onClick={() => onBookClick?.(id)}
          >
            {isFullyBooked ? 'Join Waitlist' : 'Book Class'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}