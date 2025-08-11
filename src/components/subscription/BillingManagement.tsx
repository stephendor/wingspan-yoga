'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirectToBillingPortal } from '@/lib/subscription/billing-portal'
import { useNextAuth } from '@/hooks/useNextAuth'
import { CreditCardIcon, SettingsIcon, XCircleIcon, AlertCircleIcon } from 'lucide-react'

interface BillingManagementProps {
  subscription?: {
    status: string
    planName: string
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
    amount: number
    currency: string
    interval: string
  }
  className?: string
}

export function BillingManagement({ subscription, className }: BillingManagementProps) {
  const { status } = useNextAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleManageBilling = async () => {
    if (status !== 'authenticated') {
      setError('Please sign in to manage your billing')
      return
    }

    if (!subscription) {
      setError('No active subscription found')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await redirectToBillingPortal('/membership')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access billing portal')
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const getStatusColor = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) return 'text-terracotta-600'
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-sage-600'
      case 'trialing':
        return 'text-ocean-600'
      case 'past_due':
      case 'unpaid':
        return 'text-terracotta-600'
      case 'cancelled':
        return 'text-charcoal-500'
      default:
        return 'text-charcoal-600'
    }
  }

  const getStatusText = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return 'Cancelling at period end'
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active'
      case 'trialing':
        return 'Trial'
      case 'past_due':
        return 'Past Due'
      case 'unpaid':
        return 'Payment Failed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    }
  }

  if (!subscription) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-charcoal-600" />
            Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-charcoal-600 mb-4">
            You don&apos;t have an active subscription.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/membership'}
            className="w-full sm:w-auto"
          >
            View Plans
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-charcoal-600" />
            Billing &amp; Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-charcoal-800">Current Plan</h3>
                <p className="text-lg font-heading text-charcoal-900">{subscription.planName}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-charcoal-900">
                  {formatAmount(subscription.amount, subscription.currency)}
                  <span className="text-sm font-normal text-charcoal-600">
                    /{subscription.interval}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`font-medium ${getStatusColor(subscription.status, subscription.cancelAtPeriodEnd)}`}>
                {getStatusText(subscription.status, subscription.cancelAtPeriodEnd)}
              </div>
              {subscription.cancelAtPeriodEnd && (
                <XCircleIcon className="h-4 w-4 text-terracotta-500" />
              )}
              {subscription.status === 'past_due' && (
                <AlertCircleIcon className="h-4 w-4 text-terracotta-500" />
              )}
            </div>

            {/* Next Billing Date */}
            <div className="text-sm text-charcoal-600">
              {subscription.cancelAtPeriodEnd ? (
                <>Access expires on {formatDate(subscription.currentPeriodEnd)}</>
              ) : (
                <>Next billing date: {formatDate(subscription.currentPeriodEnd)}</>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-charcoal-100">
            <Button
              onClick={handleManageBilling}
              disabled={isLoading || status !== 'authenticated'}
              className="w-full sm:w-auto"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Manage Billing
                </>
              )}
            </Button>

            <div className="text-xs text-charcoal-500">
              Update payment methods, download invoices, or cancel your subscription
            </div>
          </div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-terracotta-50 border border-terracotta-200 rounded-natural"
            >
              <div className="flex items-start gap-2">
                <AlertCircleIcon className="h-4 w-4 text-terracotta-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-terracotta-700">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Cancellation Notice */}
          {subscription.cancelAtPeriodEnd && (
            <div className="p-4 bg-gradient-to-r from-terracotta-50 to-orange-50 border border-terracotta-200 rounded-natural">
              <div className="flex items-start gap-3">
                <XCircleIcon className="h-5 w-5 text-terracotta-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-terracotta-800 mb-1">
                    Subscription Cancelling
                  </h4>
                  <p className="text-sm text-terracotta-700 mb-3">
                    Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                    You&apos;ll retain access until then.
                  </p>
                  <p className="text-xs text-terracotta-600">
                    You can reactivate your subscription anytime before the end date.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}