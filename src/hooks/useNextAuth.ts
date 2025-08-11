'use client'

import { useSession } from 'next-auth/react'

export function useNextAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    membershipType: session?.user?.membershipType || 'FREE',
    membershipStatus: session?.user?.membershipStatus || 'ACTIVE',
    subscriptionPeriodEnd: session?.user?.subscriptionPeriodEnd,
  }
}
