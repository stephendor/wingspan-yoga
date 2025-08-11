'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNextAuth } from '@/hooks/useNextAuth'
import { BillingManagement } from '@/components/subscription/BillingManagement'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeftIcon, LoaderIcon } from 'lucide-react'

interface SubscriptionData {
  status: string
  planName: string
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  amount: number
  currency: string
  interval: string
}

export default function BillingPage() {
  const { data: session, status } = useNextAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (status !== 'authenticated' || !session?.user?.email) {
        setIsLoading(false)
        return
      }

      try {
        // This would typically be an API call to get current user's subscription
        // For now, we'll simulate with a mock response
        setTimeout(() => {
          // Mock subscription data - in real implementation, fetch from API
          const mockSubscription: SubscriptionData = {
            status: 'active',
            planName: 'Premium Monthly',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            cancelAtPeriodEnd: false,
            amount: 1900, // $19.00 in cents
            currency: 'usd',
            interval: 'month'
          }
          
          setSubscription(mockSubscription)
          setIsLoading(false)
        }, 1000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription')
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [session, status])

  // Redirect to sign in if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-heading font-semibold text-charcoal-800 mb-4">
              Sign In Required
            </h2>
            <p className="text-charcoal-600 mb-6">
              Please sign in to view your billing information.
            </p>
            <div className="space-y-3">
              <Link href={`/auth/signin?callbackUrl=${encodeURIComponent('/account/billing')}`}>
                <Button className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/membership">
                <Button variant="outline" className="w-full">
                  View Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <LoaderIcon className="h-8 w-8 animate-spin text-sage-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-charcoal-800 mb-2">
              Loading your billing information...
            </h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-heading font-semibold text-charcoal-800 mb-4">
              Error Loading Billing
            </h2>
            <p className="text-charcoal-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/membership">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Membership
              </Button>
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-charcoal-900 mb-4">
            Billing &amp; Subscription
          </h1>
          <p className="text-xl text-charcoal-600 max-w-3xl leading-relaxed">
            Manage your subscription, update payment methods, and view billing history.
          </p>
        </motion.div>

        {/* Billing Management */}
        <BillingManagement 
          subscription={subscription || undefined}
          className="max-w-2xl"
        />

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12 max-w-2xl"
        >
          <Card>
            <CardContent className="py-6">
              <h3 className="font-semibold text-charcoal-800 mb-3">
                Need Help?
              </h3>
              <div className="text-sm text-charcoal-600 space-y-2">
                <p>
                  • Billing questions: Contact our support team
                </p>
                <p>
                  • Technical issues: Check our help center
                </p>
                <p>
                  • Account changes: Use the billing portal above
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}