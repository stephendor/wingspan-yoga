'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { Retreat } from '@/types'
import { formatCurrency } from '@/lib/stripe'
import RetreatBookingForm from './RetreatBookingForm'

interface RetreatBookingClientProps {
  retreat: Retreat
}

export default function RetreatBookingClient({ retreat }: RetreatBookingClientProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  const stripePromise = getStripe()

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleCreateBooking = async (data: { notes?: string }) => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setIsCreatingBooking(true)
    setError(null)

    try {
      const response = await fetch(`/api/retreats/${retreat.id}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to create booking')
        return
      }

      setClientSecret(result.data.clientSecret)
      setBookingId(result.data.bookingId)
    } catch (err) {
      console.error('Error creating booking:', err)
      setError('Failed to create booking. Please try again.')
    } finally {
      setIsCreatingBooking(false)
    }
  }

  const handlePaymentSuccess = () => {
    router.push(`/retreat-bookings/${bookingId}/confirmation`)
  }

  const handleBack = () => {
    router.push(`/retreats/${retreat.slug}`)
  }

  if (clientSecret && bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Complete Your Deposit Payment
            </h1>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <RetreatBookingForm
                retreat={retreat}
                clientSecret={clientSecret}
                bookingId={bookingId}
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
            <h1 className="text-3xl font-bold text-gray-900">Book Your Retreat</h1>
            <p className="mt-2 text-gray-600">Secure your spot with a deposit</p>
          </div>

          {/* Retreat Summary */}
          <div className="mb-8 rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{retreat.title}</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">{retreat.location}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-gray-900">
                  {formatDate(retreat.startDate)} - {formatDate(retreat.endDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Total Price</p>
                <p className="text-gray-900">{formatCurrency(retreat.totalPrice)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Deposit Required</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(retreat.depositPrice)}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Payment Schedule:</strong> Pay {formatCurrency(retreat.depositPrice)} today to secure your spot. 
                The remaining balance of {formatCurrency(retreat.totalPrice - retreat.depositPrice)} will be due 30 days before the retreat begins.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Booking Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const notes = formData.get('notes') as string
              await handleCreateBooking({ notes: notes || undefined })
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Any dietary restrictions, special accommodations, or other notes..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Retreat
              </button>
              
              <button
                type="submit"
                disabled={isCreatingBooking}
                className="flex-1 rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isCreatingBooking ? 'Creating Booking...' : 'Continue to Payment'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our terms and conditions. 
              Your deposit payment will be processed securely through Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}