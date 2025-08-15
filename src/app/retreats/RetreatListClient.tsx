'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Retreat } from '@/types'
import { formatCurrency } from '@/lib/stripe'
import { Card } from '@/components/ui/card'

interface RetreatListClientProps {
  retreats: Retreat[]
}

export default function RetreatListClient({ retreats }: RetreatListClientProps) {
  const [filteredRetreats, setFilteredRetreats] = useState(retreats)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date)
    // Use UTC to ensure consistent rendering between server and client
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  const formatDateRange = (startDate: Date | string, endDate: Date | string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })} - ${end.toLocaleDateString('en-US', {
        day: 'numeric',
        year: 'numeric',
      })}`
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  if (retreats.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No retreats available</h3>
          <p className="mt-2 text-sm text-gray-500">
            Check back soon for upcoming retreat opportunities.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredRetreats.map((retreat) => (
          <div
            key={retreat.id}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-softyellow-50 via-white to-softblue-100 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            {/* Image */}
            <div className="aspect-w-16 aspect-h-9 relative h-48 w-full">
              {retreat.images && retreat.images.length > 0 ? (
                <img
                  src={retreat.images[0]}
                  alt={retreat.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              
              {/* Availability badge */}
              <div className="absolute top-4 right-4">
                {retreat.isFull ? (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
                    Full
                  </span>
                ) : retreat.availableSpots <= 3 ? (
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-medium text-white">
                    {retreat.availableSpots} spots left
                  </span>
                ) : (
                  <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                    Available
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                {retreat.title}
              </h3>
              
              <p className="mt-2 text-sm text-gray-600">{retreat.location}</p>
              
              <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                {retreat.description}
              </p>
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {formatDateRange(retreat.startDate, retreat.endDate)}
                  </p>
                  <div className="mt-1">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(retreat.totalPrice)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      (${formatCurrency(retreat.depositPrice)} deposit)
                    </span>
                  </div>
                </div>
                
                <Link
                  href={`/retreats/${retreat.slug}`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}