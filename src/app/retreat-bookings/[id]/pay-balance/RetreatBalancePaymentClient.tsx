'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { formatCurrency } from '@/lib/stripe'
import RetreatBalancePaymentForm from './RetreatBalancePaymentForm'

interface BookingWithDetails {
  id: string
  totalPrice: number
  amountPaid: number
  paymentStatus: string
  balanceDueDate: Date
  retreat: {
    id: string
    title: string
    location: string
    startDate: Date
    endDate: Date
    totalPrice: number
    depositPrice: number
  }
  user: {
    id: string
    name: string
    email: string
  }
}

interface RetreatBalancePaymentClientProps {
  booking: BookingWithDetails
}

export default function RetreatBalancePaymentClient({ booking }: RetreatBalancePaymentClientProps) {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)

  const stripePromise = getStripe()
  const remainingBalance = booking.totalPrice - booking.amountPaid

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getDaysUntilDue = () => {
    const now = new Date()
    const dueDate = new Date(booking.balanceDueDate)
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleCreatePaymentIntent = async () => {
    setIsCreatingIntent(true)
    setError(null)

    try {
      const response = await fetch(`/api/retreat-bookings/${booking.id}/pay-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to create payment intent')
        return
      }

      setClientSecret(result.data.clientSecret)
    } catch (err) {
      console.error('Error creating payment intent:', err)
      setError('Failed to create payment intent. Please try again.')
    } finally {
      setIsCreatingIntent(false)
    }
  }

  const handlePaymentSuccess = () => {
    router.push(`/retreat-bookings/${booking.id}/confirmation?payment=balance`)
  }

  const handleBack = () => {
    router.push(`/retreat-bookings/${booking.id}/confirmation`)
  }

  const daysUntilDue = getDaysUntilDue()
  const isOverdue = daysUntilDue < 0

  if (clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Complete Your Balance Payment
            </h1>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <RetreatBalancePaymentForm
                booking={booking}
                clientSecret={clientSecret}
                remainingBalance={remainingBalance}
                onSuccess={handlePaymentSuccess}
                onBack={handleBack}
              />
            </Elements>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Pay Remaining Balance</h1>
            <p className="mt-2 text-gray-600">Complete your retreat payment</p>
          </div>

          {/* Due Date Warning */}
          {daysUntilDue <= 7 && (
            <div className={`mb-6 rounded-lg p-4 ${
              isOverdue 
                ? 'bg-red-50 border border-red-200' 
                : daysUntilDue <= 3 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {isOverdue ? (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isOverdue ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {isOverdue 
                      ? `Payment is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}`
                      : `Payment due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
                    }
                  </p>
                  <p className={`text-sm ${
                    isOverdue ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    Due date: {formatDate(booking.balanceDueDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Retreat Summary */}
          <div className="mb-8 rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{booking.retreat.title}</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">{booking.retreat.location}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Dates</p>
                <p className="text-gray-900">
                  {formatDate(booking.retreat.startDate)} - {formatDate(booking.retreat.endDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Total Price</p>
                <p className="text-gray-900">{formatCurrency(booking.totalPrice)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Already Paid</p>
                <p className="text-gray-900">{formatCurrency(booking.amountPaid)}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Remaining Balance:</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(remainingBalance)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={isCreatingIntent}
              className="flex-1 rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Back to Booking
            </button>
            
            <button
              type="button"
              onClick={handleCreatePaymentIntent}
              disabled={isCreatingIntent}
              className="flex-1 rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isCreatingIntent ? 'Setting up...' : 'Pay Balance'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your payment will be processed securely through Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}