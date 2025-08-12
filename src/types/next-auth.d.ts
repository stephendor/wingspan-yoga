import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      membershipType: string
      membershipStatus?: string
      subscriptionPeriodEnd?: string
      role: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    membershipType: string
    membershipStatus?: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    membershipType: string
    membershipStatus?: string
    role: string
  }
}
