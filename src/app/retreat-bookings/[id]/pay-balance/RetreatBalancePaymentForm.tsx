'use client'

import { useState, FormEvent } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { formatCurrency } from '@/lib/stripe'

interface BookingWithDetails {
  id: string
  totalPrice: number
  amountPaid: number
  retreat: {
    title: string
    location: string
    startDate: Date
    endDate: Date
  }
}

interface RetreatBalancePaymentFormProps {
  booking: BookingWithDetails
  clientSecret: string
  remainingBalance: number
  onSuccess: () => void
  onBack: () => void
}

export default function RetreatBalancePaymentForm({
  booking,
  clientSecret,
  remainingBalance,
  onSuccess,
  onBack,
}: RetreatBalancePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm booking completion with our API
        const response = await fetch('/api/retreat-bookings/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId: booking.id,
          }),
        })

        const result = await response.json()

        if (!result.success) {
          setError(result.error || 'Failed to confirm payment')
          return
        }

        onSuccess()
      }
    } catch (err) {
      console.error('Balance payment error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="rounded-lg border p-4 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">Final Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Retreat: {booking.retreat.title}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Total Retreat Price:</span>
            <span>{formatCurrency(booking.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Previously Paid (Deposit):</span>
            <span>-{formatCurrency(booking.amountPaid)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium text-gray-900">
              <span>Final Balance Due:</span>
              <span>{formatCurrency(remainingBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Payment Element */}
      <div className="rounded-lg border p-4">
        <h3 className="font-medium text-gray-900 mb-4">Payment Information</h3>
        <PaymentElement />
      </div>

      {/* Important Notice */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Final Payment:</strong> This payment will complete your retreat booking. 
              After successful payment, your retreat will be fully paid and confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 rounded-md bg-green-600 px-6 py-3 text-base font-medium text-white hover:bg-green-700 disabled:bg-green-400 transition-colors"
        >
          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(remainingBalance)}`}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your payment is secured by Stripe. You will receive a final confirmation email once payment is complete.
        </p>
      </div>
    </form>
  )
}