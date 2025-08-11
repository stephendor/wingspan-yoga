import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getActiveUserSubscription } from '@/lib/auth/subscription'

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
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              avatar: true,
              membershipType: true,
            },
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar,
            membershipType: user.membershipType,
          }
        } catch {
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
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
      if (user?.membershipType) {
        ;(token as AugmentedToken).membershipType = user.membershipType
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as typeof session.user & {
          membershipStatus?: string
          subscriptionPeriodEnd?: string
        }
        const t = token as AugmentedToken & { sub?: string }
        u.id = t.sub!
        u.membershipType = t.membershipType || 'FREE'
        try {
          const active = await getActiveUserSubscription(u.id)
          if (active) {
            u.membershipType = active.membershipType
            u.membershipStatus = active.membershipStatus
            u.subscriptionPeriodEnd = active.currentPeriodEnd.toISOString()
          } else {
            u.membershipStatus = 'ACTIVE'
            u.subscriptionPeriodEnd = undefined
          }
        } catch {
          u.membershipStatus = u.membershipStatus || 'ACTIVE'
        }
      }
      return session
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

export default NextAuth(authOptions)
export { getServerSession } from 'next-auth'
