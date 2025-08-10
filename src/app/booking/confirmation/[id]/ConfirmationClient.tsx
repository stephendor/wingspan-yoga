'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/stripe'
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail,
  Download,
  Share2,
  ArrowRight
} from 'lucide-react'

interface ConfirmationClientProps {
  booking: {
    id: string
    status: string
    bookedAt: Date
    notes: string | null
    class: {
      id: string
      title: string
      description: string | null
      startTime: Date
      endTime: Date
      price: number
      location: string
      meetingUrl: string | null
      notes: string | null
      instructor: {
        id: string
        name: string
        email: string
        avatar: string | null
      }
    }
    user: {
      id: string
      name: string
      email: string
    }
  }
}

export function ConfirmationClient({ booking }: ConfirmationClientProps) {
  const router = useRouter()
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)

  const { class: classData } = booking
  const startDate = new Date(classData.startTime)
  const endDate = new Date(classData.endTime)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const generateCalendarLink = () => {
    const startISOString = startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const endISOString = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Yoga Class: ${classData.title}`,
      dates: `${startISOString}/${endISOString}`,
      details: `${classData.description || ''}\n\nInstructor: ${classData.instructor.name}\nLocation: ${classData.location}${classData.meetingUrl ? `\nMeeting URL: ${classData.meetingUrl}` : ''}`,
      location: classData.location === 'ONLINE' ? 'Online Class' : '123 Wellness Way, Mindful City, CA',
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const handleAddToCalendar = () => {
    setIsAddingToCalendar(true)
    const calendarUrl = generateCalendarLink()
    window.open(calendarUrl, '_blank')
    setTimeout(() => setIsAddingToCalendar(false), 1000)
  }

  const handleShare = async () => {
    const shareData = {
      title: `Booked: ${classData.title}`,
      text: `I just booked a yoga class: ${classData.title} with ${classData.instructor.name} on ${formatDate(startDate)}`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your spot is reserved. We can't wait to see you in class!
          </p>
        </div>
      </div>

      {/* Booking Details */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-green-800">Class Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{classData.title}</h3>
                <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(classData.price)}
                </div>
                <div className="text-sm text-green-600 font-medium">Paid</div>
              </div>
            </div>

            {classData.description && (
              <p className="text-gray-700">{classData.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>When & Where</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-sage-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">{formatDate(startDate)}</div>
                <div className="text-sm text-gray-600">
                  {formatTime(startDate)} - {formatTime(endDate)}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-sage-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900 capitalize">
                  {classData.location.toLowerCase()}
                </div>
                <div className="text-sm text-gray-600">
                  {classData.location === 'ONLINE' ? (
                    <span>Meeting link will be emailed before class</span>
                  ) : (
                    <span>123 Wellness Way, Mindful City, CA</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {classData.notes && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-1">Class Notes</div>
              <div className="text-sm text-blue-800">{classData.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Your Instructor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {classData.instructor.avatar ? (
              <img
                src={classData.instructor.avatar}
                alt={classData.instructor.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-sage-200 flex items-center justify-center">
                <span className="text-lg font-medium text-sage-700">
                  {classData.instructor.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">{classData.instructor.name}</div>
              <div className="text-sm text-gray-600">{classData.instructor.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={handleAddToCalendar}
          variant="outline"
          disabled={isAddingToCalendar}
          className="flex items-center space-x-2"
        >
          <Calendar className="h-4 w-4" />
          <span>Add to Calendar</span>
        </Button>

        <Button
          onClick={handleShare}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>

        <Button
          onClick={() => window.print()}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Print</span>
        </Button>
      </div>

      {/* Next Steps */}
      <Card className="bg-sage-50 border-sage-200">
        <CardHeader>
          <CardTitle className="text-sage-800">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-sage-700">
            <div className="flex items-start space-x-3">
              <Mail className="h-4 w-4 text-sage-600 mt-0.5" />
              <div>
                <div className="font-medium">Confirmation Email</div>
                <div>Check your email for booking details and any special instructions.</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="h-4 w-4 text-sage-600 mt-0.5" />
              <div>
                <div className="font-medium">Class Reminder</div>
                <div>We'll send you a reminder 24 hours and 1 hour before class.</div>
              </div>
            </div>
            
            {classData.location === 'ONLINE' && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-sage-600 mt-0.5" />
                <div>
                  <div className="font-medium">Online Access</div>
                  <div>Meeting link will be emailed 30 minutes before class starts.</div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-sage-200">
            <Button
              onClick={() => router.push('/schedule')}
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>Browse More Classes</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <div className="text-center text-sm text-gray-600">
        <p>
          Questions about your booking?{' '}
          <a href="mailto:support@wingspanyoga.com" className="text-sage-600 hover:text-sage-800 underline">
            Contact us
          </a>{' '}
          or call{' '}
          <a href="tel:+15551234567" className="text-sage-600 hover:text-sage-800 underline">
            (555) 123-YOGA
          </a>
        </p>
      </div>
    </div>
  )
}