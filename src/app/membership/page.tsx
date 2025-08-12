'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { PlanCard } from '@/components/subscription/PlanCard'
import { PLAN_DEFINITIONS, PlanKey } from '@/lib/stripe/plans'
import { redirectToCheckout } from '@/lib/subscription/checkout'
import { useNextAuth } from '@/hooks/useNextAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckIcon, StarIcon } from 'lucide-react'

// Force dynamic rendering since this page uses client-side authentication
export const dynamic = 'force-dynamic'

function MembershipContent() {
  const { isAuthenticated, isLoading } = useNextAuth()
  const searchParams = useSearchParams()
  const [selectedInterval, setSelectedInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [notification, setNotification] = useState<string | null>(null)

  // Check for cancellation notification
  useEffect(() => {
    if (searchParams?.get('cancelled') === '1') {
      setNotification('Checkout was cancelled. You can try again anytime.')
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000)
    }
  }, [searchParams])

  const handleSelectPlan = async (planKey: PlanKey) => {
  if (!isAuthenticated) {
      // Redirect to sign in with return URL
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent('/membership')}`
      return
    }

    try {
      await redirectToCheckout(planKey)
    } catch (error) {
      console.error('Checkout error:', error)
      setNotification(
        error instanceof Error ? error.message : 'Failed to start checkout process'
      )
    }
  }

  // Filter plans by selected interval
  const filteredPlans = PLAN_DEFINITIONS.filter(
    plan => plan.active && plan.interval === selectedInterval
  )

  // Determine which plan is most popular
  const getPopularPlan = () => {
    if (selectedInterval === 'MONTHLY') {
      return 'premium_monthly'
    }
    return 'premium_yearly'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-charcoal-900 mb-4">
            Choose Your Journey
          </h1>
          <p className="text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
            Unlock your practice with our carefully crafted membership plans. 
            Whether you&apos;re beginning or deepening your journey, we have the perfect path for you.
          </p>

          {/* Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-md mx-auto"
            >
              <Card variant="outlined" className="border-terracotta-200 bg-terracotta-50">
                <CardContent className="py-3 px-4">
                  <p className="text-terracotta-700 text-sm">{notification}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white rounded-natural p-1 shadow-soft border border-charcoal-200">
            <div className="flex">
              <button
                onClick={() => setSelectedInterval('MONTHLY')}
                className={`px-6 py-2 rounded-soft text-sm font-medium transition-all duration-200 ${
                  selectedInterval === 'MONTHLY'
                    ? 'bg-sage-100 text-sage-700 shadow-soft'
                    : 'text-charcoal-600 hover:text-charcoal-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedInterval('YEARLY')}
                className={`px-6 py-2 rounded-soft text-sm font-medium transition-all duration-200 relative ${
                  selectedInterval === 'YEARLY'
                    ? 'bg-sage-100 text-sage-700 shadow-soft'
                    : 'text-charcoal-600 hover:text-charcoal-800'
                }`}
              >
                Yearly
                <div className="absolute -top-2 -right-1">
                  <StarIcon className="h-3 w-3 text-terracotta-500 fill-current" />
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16"
        >
          {filteredPlans.map((plan) => (
            <motion.div key={plan.key} variants={itemVariants}>
              <PlanCard
                plan={plan}
                isPopular={plan.key === getPopularPlan()}
                onSelectPlan={handleSelectPlan}
                disabled={isLoading}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Auth State Message */}
  {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Card className="max-w-md mx-auto bg-gradient-to-r from-sage-50 to-ocean-50">
              <CardContent className="py-6">
                <p className="text-charcoal-600 mb-4">
                  New to Wingspan Yoga?
                </p>
                <div className="space-y-2">
                  <Link href="/auth/signin">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="ghost" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-heading font-bold text-charcoal-900 text-center mb-8">
            What&apos;s Included
          </h2>
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y divide-charcoal-100">
                  {[
                    'Access to our complete video library',
                    'Mobile app for practice anywhere',
                    'Progress tracking and insights',
                    'Community support and forums',
                    'Monthly workshops and challenges',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-4 p-4">
                      <CheckIcon className="h-5 w-5 text-sage-500 flex-shrink-0" />
                      <span className="text-charcoal-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function MembershipPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50 flex items-center justify-center">
        <div className="animate-pulse">Loading membership plans...</div>
      </div>
    }>
      <MembershipContent />
    </Suspense>
  )
}