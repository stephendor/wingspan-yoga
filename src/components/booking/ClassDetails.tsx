'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users, Video, User, Award, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/stripe'
import { ClassLocation, DifficultyLevel } from '@prisma/client'
import Image from 'next/image'

export interface ClassDetailsProps {
  classData: {
    id: string
    title: string
    description: string | null
    startTime: Date
    endTime: Date
    capacity: number
    price: number
    difficulty: DifficultyLevel
    category: string
    location: ClassLocation
    meetingUrl?: string | null
    notes?: string | null
    instructor: {
      id: string
      name: string
      avatar: string | null
      bio?: string | null
      specialties?: string[]
      yearsExp?: number | null
      certification?: string | null
    }
    _count: {
      bookings: number
    }
  }
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

export function ClassDetails({ classData }: ClassDetailsProps) {
  const {
    title,
    description,
    startTime,
    endTime,
    capacity,
    price,
    difficulty,
    category,
    location,
    meetingUrl,
    notes,
    instructor,
    _count
  } = classData

  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  const availableSpots = capacity - _count.bookings
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDuration = () => {
    const durationMs = endDate.getTime() - startDate.getTime()
    const minutes = Math.round(durationMs / (1000 * 60))
    return `${minutes} min`
  }

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-sage-800">{title}</h1>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${difficultyColors[difficulty]}`}>
                    {difficulty.replace('_', ' ')}
                  </span>
                  <span className={`text-lg font-semibold ${categoryColors[category as keyof typeof categoryColors] || 'text-sage-600'}`}>
                    {category.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-sage-800">{formatCurrency(price)}</div>
                <div className="text-sm text-sage-600">per class</div>
              </div>
            </div>

            {description && (
              <p className="text-gray-700 leading-relaxed">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Class Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Class Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date and Time */}
          <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-sage-600" />
              <div>
                <div className="font-medium text-sage-800">{formatDate(startDate)}</div>
                <div className="text-sm text-sage-600">
                  {formatTime(startDate)} - {formatTime(endDate)} ({getDuration()})
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <LocationIcon className="h-5 w-5 text-sage-600" />
              <div>
                <div className="font-medium text-gray-800 capitalize">{location.toLowerCase()}</div>
                {location === 'ONLINE' && meetingUrl && (
                  <div className="text-sm text-gray-600">
                    Meeting link will be provided after booking
                  </div>
                )}
                {location === 'STUDIO' && (
                  <div className="text-sm text-gray-600">
                    123 Wellness Way, Mindful City
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-sage-600" />
              <div>
                <div className={`font-medium ${
                  availableSpots === 0 
                    ? 'text-red-600' 
                    : isAlmostFull 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                }`}>
                  {availableSpots === 0 
                    ? 'Fully Booked' 
                    : `${availableSpots} spot${availableSpots !== 1 ? 's' : ''} available`
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {_count.bookings} of {capacity} spots booked
                </div>
              </div>
            </div>
            {isAlmostFull && availableSpots > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                Almost Full
              </span>
            )}
          </div>

          {/* Special Notes */}
          {notes && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">Special Instructions</div>
              <div className="text-sm text-blue-700">{notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructor Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Your Instructor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            {instructor.avatar ? (
              <Image
                src={instructor.avatar}
                alt={instructor.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-sage-200 flex items-center justify-center">
                <span className="text-xl font-semibold text-sage-700">
                  {instructor.name.charAt(0)}
                </span>
              </div>
            )}
            
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{instructor.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {instructor.certification && (
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4" />
                      <span>{instructor.certification}</span>
                    </div>
                  )}
                  {instructor.yearsExp && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{instructor.yearsExp} years experience</span>
                    </div>
                  )}
                </div>
              </div>
              
              {instructor.bio && (
                <p className="text-sm text-gray-700 leading-relaxed">{instructor.bio}</p>
              )}
              
              {instructor.specialties && instructor.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}