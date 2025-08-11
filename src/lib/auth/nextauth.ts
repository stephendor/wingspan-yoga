import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

interface AugmentedToken {
  membershipType?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('=== AUTHORIZE CALLED ===', credentials)
        
        try {
          // Simple validation
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }
          
          console.log('Returning user object...')
          return { 
            id: '1', 
            email: 'test@test.com', 
            name: 'Test User',
            membershipType: 'admin'
          }
        } catch (error) {
          console.error('Authorize error:', error)
          return null
        }
      },
    }),
    /*
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    */
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback - token:', token, 'user:', user)
      if (user?.membershipType) {
        ;(token as AugmentedToken).membershipType = user.membershipType
        console.log('Added membershipType to token:', user.membershipType)
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - session:', session, 'token:', token)
      if (session.user) {
        const u = session.user as typeof session.user & {
          membershipStatus?: string
          subscriptionPeriodEnd?: string
        }
        const t = token as AugmentedToken & { sub?: string }
        u.id = t.sub || '1'
        u.membershipType = t.membershipType || 'admin'
        u.membershipStatus = 'ACTIVE'
        console.log('Simplified session user:', u)
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl)
      // Allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allow callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}

// authOptions is already exported above
export { getServerSession } from 'next-auth'
