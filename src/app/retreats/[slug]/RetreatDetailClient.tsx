'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Retreat } from '@/types'
import { formatCurrency } from '@/lib/stripe'

interface RetreatDetailClientProps {
  retreat: Retreat
}

export default function RetreatDetailClient({ retreat }: RetreatDetailClientProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isBooking, setIsBooking] = useState(false)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleBookNow = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href))
      return
    }

    if (retreat.isFull) {
      return
    }

    setIsBooking(true)
    router.push(`/retreats/${retreat.slug}/book`)
  }

  const getDuration = () => {
    const start = new Date(retreat.startDate)
    const end = new Date(retreat.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        {retreat.images && retreat.images.length > 0 ? (
          <div className="h-96 w-full">
            <img
              src={retreat.images[0]}
              alt={retreat.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-96 w-full items-center justify-center bg-gray-300">
            <span className="text-2xl text-gray-500">No image available</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold">{retreat.title}</h1>
            <p className="mt-4 text-xl">{retreat.location}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Retreat</h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {retreat.description}
                </p>
              </div>

              {/* Additional Images */}
              {retreat.images && retreat.images.length > 1 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Gallery</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {retreat.images.slice(1).map((image, index) => (
                      <div key={index} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${retreat.title} - Image ${index + 2}`}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Retreat Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-lg text-gray-900">{getDuration()} days</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="text-lg text-gray-900">{formatDate(retreat.startDate)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="text-lg text-gray-900">{formatDate(retreat.endDate)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Capacity</p>
                  <p className="text-lg text-gray-900">
                    {retreat.capacity - retreat.availableSpots} / {retreat.capacity} participants
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Availability</p>
                  {retreat.isFull ? (
                    <p className="text-lg font-medium text-red-600">Fully Booked</p>
                  ) : (
                    <p className="text-lg font-medium text-green-600">
                      {retreat.availableSpots} spots remaining
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(retreat.totalPrice)}
                  </span>
                  <span className="text-sm text-gray-500">total</span>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    Deposit required: <span className="font-medium">{formatCurrency(retreat.depositPrice)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Remaining balance due 30 days before retreat
                  </p>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={retreat.isFull || isBooking}
                  className={`w-full rounded-md px-6 py-3 text-base font-medium transition-colors ${
                    retreat.isFull
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isBooking
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {retreat.isFull
                    ? 'Fully Booked'
                    : isBooking
                    ? 'Processing...'
                    : 'Book Now'}
                </button>

                {!session && (
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    You&apos;ll need to sign in to complete your booking
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}