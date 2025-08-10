'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Input, TextArea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { bookingFormSchema, type BookingFormData } from '@/lib/validation/booking'
import { formatCurrency } from '@/lib/stripe'
import { AlertCircle, CreditCard, Lock, CheckCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export interface BookingFormProps {
  classId: string
  price: number
  className: string
  onSuccess?: (bookingId: string) => void
  onError?: (error: string) => void
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': {
        color: '#9CA3AF',
      },
      padding: '10px 12px',
    },
    invalid: {
      color: '#EF4444',
    },
  },
  hidePostalCode: false,
}

// Inner form component that uses Stripe hooks
function BookingFormInner({ classId, price, className, onSuccess, onError }: BookingFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      classId,
      email: session?.user?.email || '',
      name: session?.user?.name || '',
      acceptTerms: false,
      marketingConsent: false,
    }
  })

  const acceptTerms = watch('acceptTerms')

  // Step 1: Create payment intent
  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          amount: price,
          currency: 'usd',
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment intent')
      }

      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      }
    } catch (error) {
      throw error
    }
  }

  // Step 2: Confirm payment with Stripe
  const confirmPayment = async (clientSecret: string, formData: BookingFormData) => {
    if (!stripe || !elements) {
      throw new Error('Stripe not loaded')
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      throw new Error('Card element not found')
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: formData.name || session?.user?.name,
          email: formData.email || session?.user?.email,
        },
      },
    })

    if (error) {
      throw new Error(error.message || 'Payment failed')
    }

    return paymentIntent
  }

  // Step 3: Confirm booking on server
  const confirmBooking = async (paymentIntentId: string, formData: BookingFormData) => {
    const response = await fetch('/api/bookings/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        classId,
        notes: formData.notes,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to confirm booking')
    }

    return data.booking
  }

  // Main form submission handler
  const onSubmit = async (formData: BookingFormData) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href))
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Step 1: Create payment intent
      const { clientSecret, paymentIntentId } = await createPaymentIntent()
      setPaymentIntentId(paymentIntentId)

      // Step 2: Confirm payment with Stripe
      await confirmPayment(clientSecret, formData)

      // Step 3: Confirm booking on server
      const booking = await confirmBooking(paymentIntentId, formData)

      // Success!
      onSuccess?.(booking.id)
      router.push(`/booking/confirmation/${booking.id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setPaymentError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Class Summary */}
      <Card className="bg-sage-50 border-sage-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-sage-800">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sage-700">{className}</span>
              <span className="font-semibold text-sage-800">{formatCurrency(price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information (for non-authenticated users or to update) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Contact Information</span>
            {session && <CheckCircle className="h-5 w-5 text-green-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                {...register('name')}
                placeholder="Your full name"
                error={errors.name?.message}
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="your.email@example.com"
                error={errors.email?.message}
                disabled={isProcessing}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <Input
              {...register('phone')}
              type="tel"
              placeholder="(555) 123-4567"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact (Optional)
            </label>
            <Input
              {...register('emergencyContact')}
              placeholder="Emergency contact name and phone"
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Special Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea
            {...register('notes')}
            placeholder="Any special requests, injuries, or dietary restrictions we should know about..."
            rows={3}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
            <Lock className="h-4 w-4 text-gray-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
            <Lock className="h-3 w-3" />
            <span>Your payment information is secure and encrypted</span>
          </p>
        </CardContent>
      </Card>

      {/* Terms and Marketing */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                {...register('acceptTerms')}
                className="mt-1 h-4 w-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                disabled={isProcessing}
              />
              <label className="text-sm text-gray-700">
                I accept the{' '}
                <a href="/terms" className="text-sage-600 hover:text-sage-800 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-sage-600 hover:text-sage-800 underline">
                  Privacy Policy
                </a>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600 ml-7">{errors.acceptTerms.message}</p>
            )}

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                {...register('marketingConsent')}
                className="mt-1 h-4 w-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                disabled={isProcessing}
              />
              <label className="text-sm text-gray-700">
                I'd like to receive updates about classes, workshops, and special offers
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Payment Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{paymentError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!acceptTerms || isProcessing || !stripe || !elements}
        className="w-full py-3 text-base"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing Payment...</span>
          </div>
        ) : (
          `Complete Booking - ${formatCurrency(price)}`
        )}
      </Button>
    </form>
  )
}

// Main component with Stripe Elements provider
export function BookingForm(props: BookingFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <BookingFormInner {...props} />
    </Elements>
  )
}