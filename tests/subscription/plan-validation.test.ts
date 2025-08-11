import { describe, it, expect } from '@jest/globals'
import { PLAN_DEFINITIONS, getPlanByKey, getPlanByPriceId, type PlanKey } from '@/lib/stripe/plans'

describe('Plan Validation', () => {
  describe('PLAN_DEFINITIONS', () => {
    it('contains valid plan structure', () => {
      expect(PLAN_DEFINITIONS).toBeInstanceOf(Array)
      expect(PLAN_DEFINITIONS.length).toBeGreaterThan(0)

      PLAN_DEFINITIONS.forEach(plan => {
        expect(plan).toMatchObject({
          key: expect.any(String),
          name: expect.any(String),
          interval: expect.stringMatching(/^(MONTHLY|YEARLY)$/),
          amount: expect.any(Number),
          currency: expect.any(String),
          stripePriceId: expect.any(String),
          active: expect.any(Boolean),
          features: expect.any(Array),
          description: expect.any(String),
        })

        // Validate amount is positive
        expect(plan.amount).toBeGreaterThan(0)

        // Validate currency format
        expect(plan.currency).toMatch(/^[a-z]{3}$/)

        // Validate Stripe price ID format
        expect(plan.stripePriceId).toMatch(/^price_/)

        // Validate features array
        plan.features.forEach(feature => {
          expect(typeof feature).toBe('string')
          expect(feature.length).toBeGreaterThan(0)
        })
      })
    })

    it('has both monthly and yearly intervals', () => {
      const intervals = PLAN_DEFINITIONS.map(plan => plan.interval)
      expect(intervals).toContain('MONTHLY')
      expect(intervals).toContain('YEARLY')
    })

    it('has at least one active plan', () => {
      const activePlans = PLAN_DEFINITIONS.filter(plan => plan.active)
      expect(activePlans.length).toBeGreaterThan(0)
    })

    it('has unique plan keys', () => {
      const keys = PLAN_DEFINITIONS.map(plan => plan.key)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })

    it('has unique Stripe price IDs', () => {
      const priceIds = PLAN_DEFINITIONS.map(plan => plan.stripePriceId)
      const uniquePriceIds = new Set(priceIds)
      expect(uniquePriceIds.size).toBe(priceIds.length)
    })
  })

  describe('getPlanByKey', () => {
    it('returns correct plan for valid key', () => {
      const firstPlan = PLAN_DEFINITIONS[0]
      if (firstPlan) {
        const retrievedPlan = getPlanByKey(firstPlan.key as PlanKey)
        expect(retrievedPlan).toEqual(firstPlan)
      }
    })

    it('returns undefined for invalid key', () => {
      const invalidPlan = getPlanByKey('invalid_key' as PlanKey)
      expect(invalidPlan).toBeUndefined()
    })

    it('works with all defined plan keys', () => {
      PLAN_DEFINITIONS.forEach(plan => {
        const retrievedPlan = getPlanByKey(plan.key as PlanKey)
        expect(retrievedPlan).toEqual(plan)
      })
    })
  })

  describe('getPlanByPriceId', () => {
    it('returns correct plan for valid price ID', () => {
      const firstPlan = PLAN_DEFINITIONS[0]
      if (firstPlan) {
        const retrievedPlan = getPlanByPriceId(firstPlan.stripePriceId)
        expect(retrievedPlan).toEqual(firstPlan)
      }
    })

    it('returns undefined for invalid price ID', () => {
      const invalidPlan = getPlanByPriceId('price_invalid')
      expect(invalidPlan).toBeUndefined()
    })

    it('works with all defined price IDs', () => {
      PLAN_DEFINITIONS.forEach(plan => {
        const retrievedPlan = getPlanByPriceId(plan.stripePriceId)
        expect(retrievedPlan).toEqual(plan)
      })
    })
  })

  describe('Plan pricing structure', () => {
    it('yearly plans should offer savings over monthly equivalents', () => {
      const monthlyPlans = PLAN_DEFINITIONS.filter(plan => 
        plan.interval === 'MONTHLY' && plan.active
      )
      const yearlyPlans = PLAN_DEFINITIONS.filter(plan => 
        plan.interval === 'YEARLY' && plan.active
      )

      // For each yearly plan, check if there's a monthly equivalent
      yearlyPlans.forEach(yearlyPlan => {
        // Find similar monthly plan (same tier level)
        const planTier = yearlyPlan.name.toLowerCase().replace(/yearly|annual/i, '').trim()
        const monthlyEquivalent = monthlyPlans.find(monthlyPlan => {
          const monthlyTier = monthlyPlan.name.toLowerCase().replace(/monthly/i, '').trim()
          return monthlyTier === planTier || monthlyPlan.name.toLowerCase().includes(planTier)
        })

        if (monthlyEquivalent) {
          // Yearly plan should cost less than 12 monthly payments
          const yearlyAmount = yearlyPlan.amount
          const monthlyAmount = monthlyEquivalent.amount * 12
          
          expect(yearlyAmount).toBeLessThan(monthlyAmount)
          
          // Calculate savings percentage
          const savingsPercentage = ((monthlyAmount - yearlyAmount) / monthlyAmount) * 100
          expect(savingsPercentage).toBeGreaterThan(0)
          
          // Reasonable savings (e.g., at least 10% but not more than 50%)
          expect(savingsPercentage).toBeGreaterThan(10)
          expect(savingsPercentage).toBeLessThan(50)
        }
      })
    })

    it('has consistent currency across all plans', () => {
      const currencies = PLAN_DEFINITIONS.map(plan => plan.currency)
      const uniqueCurrencies = new Set(currencies)
      expect(uniqueCurrencies.size).toBe(1) // Should all use the same currency
    })

    it('has reasonable price ranges', () => {
      const activePlans = PLAN_DEFINITIONS.filter(plan => plan.active)
      
      activePlans.forEach(plan => {
        // Reasonable price range for yoga subscription (in cents)
        expect(plan.amount).toBeGreaterThanOrEqual(500) // At least $5
        expect(plan.amount).toBeLessThanOrEqual(50000) // No more than $500
      })
    })
  })

  describe('Plan feature validation', () => {
    it('all plans have meaningful features', () => {
      PLAN_DEFINITIONS.forEach(plan => {
        expect(plan.features.length).toBeGreaterThan(0)
        
        plan.features.forEach(feature => {
          expect(feature.trim()).not.toBe('')
          expect(feature.length).toBeGreaterThan(10) // Meaningful feature description
        })
      })
    })

    it('premium plans have more features than basic plans', () => {
      const basicPlans = PLAN_DEFINITIONS.filter(plan => 
        plan.name.toLowerCase().includes('basic') && plan.active
      )
      const premiumPlans = PLAN_DEFINITIONS.filter(plan => 
        plan.name.toLowerCase().includes('premium') && plan.active
      )

      if (basicPlans.length > 0 && premiumPlans.length > 0) {
        const basicFeatureCount = Math.max(...basicPlans.map(p => p.features.length))
        const premiumFeatureCount = Math.min(...premiumPlans.map(p => p.features.length))
        
        expect(premiumFeatureCount).toBeGreaterThanOrEqual(basicFeatureCount)
      }
    })
  })

  describe('Plan descriptions', () => {
    it('all plans have meaningful descriptions', () => {
      PLAN_DEFINITIONS.forEach(plan => {
        expect(plan.description.trim()).not.toBe('')
        expect(plan.description.length).toBeGreaterThan(20) // Meaningful description
        expect(plan.description.length).toBeLessThan(200) // Not too verbose
      })
    })
  })
})