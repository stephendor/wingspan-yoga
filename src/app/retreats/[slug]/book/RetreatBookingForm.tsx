'use client'

import { useState, FormEvent } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Retreat } from '@/types'
import { formatCurrency } from '@/lib/stripe'

interface RetreatBookingFormProps {
  retreat: Retreat
  clientSecret: string
  bookingId: string
  onSuccess: () => void
  onBack: () => void
}

export default function RetreatBookingForm({
  retreat,
  clientSecret,
  bookingId,
  onSuccess,
  onBack,
}: RetreatBookingFormProps) {
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
      // Get card element
      const cardElement = elements.getElement('card')
      if (!cardElement) {
        setError('Card element not found')
        return
      }

      // Confirm payment with Stripe using CardElement
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm booking with our API
        const response = await fetch('/api/retreat-bookings/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId,
          }),
        })

        const result = await response.json()

        if (!result.success) {
          setError(result.error || 'Failed to confirm booking')
          return
        }

        onSuccess()
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFormSubmit = (event: FormEvent) => {
    handleSubmit(event).catch((error) => {
      console.error('Form submission error:', error)
      setError('An unexpected error occurred. Please try again.')
    })
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="rounded-lg border p-4 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">Payment Summary</h3>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Retreat: {retreat.title}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Deposit Amount:</span>
          <span>{formatCurrency(retreat.depositPrice)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Remaining Balance (due later):</span>
          <span>{formatCurrency(retreat.totalPrice - retreat.depositPrice)}</span>
        </div>
        <div className="border-t mt-2 pt-2">
          <div className="flex justify-between font-medium text-gray-900">
            <span>Total Due Today:</span>
            <span>{formatCurrency(retreat.depositPrice)}</span>
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
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        }} />
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
          className="flex-1 rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(retreat.depositPrice)}`}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your payment is secured by Stripe. You will receive a confirmation email once payment is complete.
        </p>
      </div>
    </form>
  )
}