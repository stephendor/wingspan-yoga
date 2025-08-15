'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/stripe'

interface BookingWithDetails {
  id: string
  totalPrice: number
  amountPaid: number
  paymentStatus: string
  depositPaidAt: Date | null
  balanceDueDate: Date
  finalPaidAt: Date | null
  notes: string | null
  createdAt: Date
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
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    createdAt: Date
  }>
}

interface RetreatBookingConfirmationProps {
  booking: BookingWithDetails
}

export default function RetreatBookingConfirmation({ booking }: RetreatBookingConfirmationProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const remainingBalance = booking.totalPrice - booking.amountPaid
  const isFullyPaid = booking.paymentStatus === 'PAID_IN_FULL'
  const isDepositPaid = booking.paymentStatus === 'DEPOSIT_PAID'

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isFullyPaid ? 'Payment Complete!' : 'Booking Confirmed!'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {isFullyPaid
              ? 'Your retreat is fully paid and confirmed.'
              : 'Your deposit has been received and your spot is secured.'}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="rounded-lg bg-white p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Booking Details</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Retreat Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Retreat</p>
                  <p className="text-gray-900">{booking.retreat.title}</p>
                </div>
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
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Booking ID</p>
                  <p className="text-gray-900 font-mono text-sm">{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Booked On</p>
                  <p className="text-gray-900">{formatDateTime(booking.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${
                    isFullyPaid ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {isFullyPaid ? 'Fully Paid' : 'Deposit Paid'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Notes</h3>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="rounded-lg bg-white p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-gray-700">
              <span>Total Retreat Price:</span>
              <span>{formatCurrency(booking.totalPrice)}</span>
            </div>
            
            <div className="flex justify-between text-gray-700">
              <span>Amount Paid:</span>
              <span className="text-green-600 font-medium">{formatCurrency(booking.amountPaid)}</span>
            </div>
            
            {!isFullyPaid && (
              <>
                <div className="flex justify-between text-gray-700">
                  <span>Remaining Balance:</span>
                  <span className="font-medium">{formatCurrency(remainingBalance)}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span>Balance Due Date:</span>
                  <span className="font-medium">{formatDate(booking.balanceDueDate)}</span>
                </div>
              </>
            )}
          </div>

          {/* Payment History */}
          {booking.payments.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-2">
                {booking.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatDateTime(payment.createdAt)}
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="rounded-lg bg-blue-50 p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-3">What&apos;s Next?</h3>
          <div className="space-y-2 text-blue-800">
            {isFullyPaid ? (
              <>
                <p>✅ Your retreat is fully paid and confirmed</p>
                <p>📧 You&apos;ll receive additional details about your retreat via email</p>
                <p>📞 Our team will contact you closer to the retreat date with final instructions</p>
              </>
            ) : (
              <>
                <p>✅ Your spot is secured with your deposit</p>
                <p>💳 Pay the remaining balance by {formatDate(booking.balanceDueDate)}</p>
                <p>📧 You&apos;ll receive a reminder email about the balance payment</p>
                <p>📞 Our team will contact you closer to the retreat date with final instructions</p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/retreats"
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 text-center transition-colors"
          >
            Browse More Retreats
          </Link>
          
          <Link
            href="/account/bookings"
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 text-center transition-colors"
          >
            View My Bookings
          </Link>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Questions about your booking? Contact us at{' '}
            <a href="mailto:support@wingspanyoga.com" className="text-blue-600 hover:text-blue-500">
              support@wingspanyoga.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}