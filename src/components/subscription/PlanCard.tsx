'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlanDefinition } from '@/lib/stripe/plans'
import { CheckIcon } from 'lucide-react'

interface PlanCardProps {
  plan: PlanDefinition
  isPopular?: boolean
  onSelectPlan: (planKey: string) => Promise<void>
  disabled?: boolean
}

export function PlanCard({ plan, isPopular = false, onSelectPlan, disabled = false }: PlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const formatPrice = (amount: number, interval: string) => {
    const price = (amount / 100).toFixed(0)
    const period = interval === 'MONTHLY' ? 'month' : 'year'
    return { price, period }
  }

  const { price, period } = formatPrice(plan.amount, plan.interval)

  const handleSelectPlan = async () => {
    if (disabled || isLoading) return
    
    setIsLoading(true)
    try {
      await onSelectPlan(plan.key)
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02, y: -4 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-sage-500 to-ocean-500 text-white px-4 py-1 rounded-full text-xs font-medium">
            Most Popular
          </div>
        </div>
      )}
      
      <Card 
        variant={isPopular ? "elevated" : "default"} 
        className={`relative h-full transition-all duration-300 ${
          isPopular 
            ? 'ring-2 ring-sage-200 shadow-zen border-sage-200' 
            : 'hover:border-sage-200'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-heading text-charcoal-800">
            {plan.name}
          </CardTitle>
          <CardDescription className="text-charcoal-600 leading-relaxed">
            {plan.description}
          </CardDescription>
          
          <div className="mt-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-charcoal-900">${price}</span>
              <span className="text-charcoal-600">/{period}</span>
            </div>
            {plan.interval === 'YEARLY' && (
              <div className="mt-1 text-sage-600 text-sm font-medium">
                Save 2 months!
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <CheckIcon className="h-4 w-4 text-sage-500 flex-shrink-0" />
                </div>
                <span className="text-charcoal-700 text-sm leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="pt-6">
          <Button
            onClick={handleSelectPlan}
            disabled={disabled || isLoading}
            variant={isPopular ? "primary" : "outline"}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </div>
            ) : (
              `Choose ${plan.name}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}