declare module '@stripe/react-stripe-js' {
  import * as React from 'react'
  import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js'

  export interface ElementsProps {
    stripe: Promise<Stripe | null> | Stripe | null
    children?: React.ReactNode
  options?: Record<string, unknown>
  }
  export const Elements: React.FC<ElementsProps>

  export interface CardElementProps {
    options?: Record<string, unknown>
    onChange?: (event: { complete: boolean; error?: { message?: string } }) => void
  }
  export const CardElement: React.FC<CardElementProps>

  export function useStripe(): Stripe | null
  export function useElements(): StripeElements | null

  // Helper type so calling code can narrow the element
  export type CardElementType = StripeCardElement
}
