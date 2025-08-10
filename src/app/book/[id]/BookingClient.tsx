'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from 'next-auth'
import { ClassDetails, BookingForm } from '@/components/booking'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, LogIn } from 'lucide-react'

interface BookingClientProps {
  classData: {
    id: string
    title: string
    description: string | null
    startTime: Date
    endTime: Date
    capacity: number
    price: number
    difficulty: any
    category: string
    location: any
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
  session: Session | null
}

export function BookingClient({ classData, session }: BookingClientProps) {
  const router = useRouter()
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBookingSuccess = (bookingId: string) => {
    setBookingError(null)
    // Navigation is handled in the BookingForm component
  }

  const handleBookingError = (error: string) => {
    setBookingError(error)
    setIsProcessing(false)
  }

  const handleSignIn = () => {
    const currentUrl = window.location.href
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`)
  }

  const handleBackToSchedule = () => {
    router.push('/schedule')
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={handleBackToSchedule}
          className="flex items-center space-x-2 text-sage-600 hover:text-sage-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Schedule</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Class Details */}
        <div className="order-2 lg:order-1">
          <ClassDetails classData={classData} />
        </div>

        {/* Booking Form */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-8">
            {!session ? (
              // Authentication Required
              <Card className="border-sage-200">
                <CardContent className="pt-6 text-center space-y-6">
                  <div className="space-y-3">
                    <LogIn className="h-12 w-12 text-sage-600 mx-auto" />
                    <h3 className="text-xl font-semibold text-sage-800">
                      Sign In Required
                    </h3>
                    <p className="text-sage-600">
                      Please sign in to book this class and manage your bookings.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleSignIn}
                      className="w-full"
                      size="lg"
                    >
                      Sign In to Book
                    </Button>
                    
                    <div className="text-center">
                      <span className="text-sm text-gray-600">Don't have an account? </span>
                      <a
                        href="/auth/register"
                        className="text-sm text-sage-600 hover:text-sage-800 font-medium underline"
                      >
                        Create one here
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Booking Form
              <div className="space-y-4">
                {bookingError && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">
                            Booking Failed
                          </h4>
                          <p className="text-sm text-red-700 mt-1">
                            {bookingError}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <BookingForm
                  classId={classData.id}
                  price={classData.price}
                  className={classData.title}
                  onSuccess={handleBookingSuccess}
                  onError={handleBookingError}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              What to Expect
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div className="space-y-2">
                <h4 className="font-medium">Before Your Class</h4>
                <ul className="space-y-1 list-disc list-inside text-blue-700">
                  <li>Arrive 10-15 minutes early</li>
                  <li>Bring a yoga mat and water bottle</li>
                  <li>Wear comfortable, stretchy clothing</li>
                  <li>Let the instructor know about any injuries</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Cancellation Policy</h4>
                <ul className="space-y-1 list-disc list-inside text-blue-700">
                  <li>Cancel up to 12 hours before class</li>
                  <li>Late cancellations forfeit class credit</li>
                  <li>No-shows are charged full price</li>
                  <li>Reschedule anytime up to 2 hours before</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}