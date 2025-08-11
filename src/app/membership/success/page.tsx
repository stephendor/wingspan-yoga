'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircleIcon, LoaderIcon } from 'lucide-react'

export default function MembershipSuccessPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const sessionIdParam = searchParams?.get('session_id')
    setSessionId(sessionIdParam)
    
    // Simulate a brief loading state to allow webhooks to process
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchParams])

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <LoaderIcon className="h-8 w-8 animate-spin text-sage-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-charcoal-800 mb-2">
              Processing your subscription...
            </h2>
            <p className="text-charcoal-600">
              Please wait while we set up your account.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50 flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg"
      >
        <Card className="text-center shadow-natural">
          <CardHeader className="pb-6">
            <motion.div
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              className="mx-auto mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-sage-500 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-heading text-charcoal-900 mb-2">
              Welcome to Wingspan Yoga!
            </CardTitle>
            
            <p className="text-charcoal-600 leading-relaxed">
              Your subscription has been successfully activated. 
              You now have access to all the features of your plan.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-sage-50 to-ocean-50 rounded-natural p-4">
              <h3 className="font-semibold text-charcoal-800 mb-2">What&apos;s Next?</h3>
              <ul className="text-sm text-charcoal-600 space-y-1 text-left">
                <li>• Explore our complete video library</li>
                <li>• Join live classes and workshops</li>
                <li>• Track your practice progress</li>
                <li>• Connect with our community</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/schedule">
                <Button className="w-full" size="lg">
                  Explore Classes
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Return Home
                </Button>
              </Link>
            </div>

            {sessionId && (
              <div className="text-xs text-charcoal-500 pt-4 border-t border-charcoal-100">
                <p>Session ID: {sessionId}</p>
                <p className="mt-1">
                  Save this for your records. You&apos;ll receive a confirmation email shortly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}