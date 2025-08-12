'use client'

import { useSession } from 'next-auth/react'

export function useNextAuth() {
  const sessionResult = useSession()
  const { data: session, status } = sessionResult || { data: null, status: 'loading' }

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    membershipType: session?.user?.membershipType || 'FREE',
    membershipStatus: session?.user?.membershipStatus || 'ACTIVE',
    subscriptionPeriodEnd: session?.user?.subscriptionPeriodEnd,
  }
}
