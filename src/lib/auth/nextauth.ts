import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
// OAuth provider imports commented out - can be enabled later when needed
// import GoogleProvider from 'next-auth/providers/google'
// import FacebookProvider from 'next-auth/providers/facebook'
// import TwitterProvider from 'next-auth/providers/twitter'
import { prisma } from '@/lib/prisma'
// Instagram doesn't have a built-in NextAuth provider, but we can create a custom OAuth provider

// Note: Basic credentials flow below is simplified for development/demo.

interface AugmentedToken {
  membershipType?: string
  role?: string
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
        console.log('=== AUTHORIZE FUNCTION CALLED ===')
        console.log('Received credentials:', JSON.stringify(credentials, null, 2))
        
        try {
          // Simple validation
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials - returning null')
            return null
          }
          
          // Look up the user in the database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              membershipType: true,
              role: true,
            },
          })
          
          if (!user) {
            console.log('User not found in database - returning null')
            return null
          }
          
          if (!user.password) {
            console.log('User has no password set - returning null')
            return null
          }
          
          // Check password using bcrypt
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            console.log('Invalid password - returning null')
            return null
          }
          
          const returnUser = { 
            id: user.id, // Use the actual database ID
            email: user.email, 
            name: user.name || 'User',
            membershipType: user.membershipType.toLowerCase(),
            role: user.role.toLowerCase()
          }
          
          console.log('Valid credentials - returning user object:', JSON.stringify(returnUser, null, 2))
          console.log('=== END AUTHORIZE ===')
          return returnUser
        } catch (error) {
          console.error('Authorize error:', error)
          return null
        }
      },
    }),
    // OAuth providers temporarily commented out - can be enabled later when needed
    /*
    // Enable Google if env vars are set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    
    // Enable Facebook if env vars are set
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
          }),
        ]
      : []),
    
    // Enable Twitter/X if env vars are set
    ...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET
      ? [
          TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
            version: '2.0', // Use Twitter API v2
          }),
        ]
      : []),
    
    // Custom Instagram provider using OAuth2
    ...(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET
      ? [
          {
            id: 'instagram',
            name: 'Instagram',
            type: 'oauth' as const,
            clientId: process.env.INSTAGRAM_CLIENT_ID!,
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
            authorization: {
              url: 'https://api.instagram.com/oauth/authorize',
              params: {
                scope: 'user_profile,user_media',
                response_type: 'code',
              },
            },
            token: 'https://api.instagram.com/oauth/access_token',
            userinfo: {
              url: 'https://graph.instagram.com/me',
              params: {
                fields: 'id,username,account_type',
              },
            },
            profile(profile: { id: string; username: string; account_type?: string }) {
              return {
                id: profile.id,
                name: profile.username,
                email: null, // Instagram doesn't provide email via Basic Display API
                image: null,
                membershipType: 'member', // Default membership type for OAuth users
              }
            },
          },
        ]
      : []),
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
    async signIn({ user, account, profile }) {
      console.log('=== SIGNIN CALLBACK ===')
      console.log('Account provider:', account?.provider)
      console.log('User from provider:', JSON.stringify(user, null, 2))
      console.log('Profile from provider:', JSON.stringify(profile, null, 2))
      
      // For OAuth providers, ensure user exists in database
      if (account?.provider && account.provider !== 'credentials' && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            console.log('Creating new OAuth user:', user.email)
            await prisma.user.create({
              data: {
                name: user.name || 'OAuth User',
                email: user.email,
                membershipType: 'FREE', // Default membership for OAuth users
                role: 'MEMBER', // Default role for OAuth users
                // No password needed for OAuth users
              }
            })
            console.log('OAuth user created successfully')
          } else {
            console.log('OAuth user already exists:', user.email)
          }
        } catch (error) {
          console.error('Error creating OAuth user:', error)
          return false // Prevent sign in if user creation fails
        }
      }
      
      console.log('=== END SIGNIN CALLBACK ===')
      return true
    },
    async jwt({ token, user, trigger, account }) {
      console.log('=== JWT CALLBACK ===')
      console.log('Trigger:', trigger)
      console.log('Account:', account?.provider)
      console.log('User:', JSON.stringify(user, null, 2))
      console.log('Token before:', JSON.stringify(token, null, 2))
      
      if (user?.membershipType) {
        ;(token as AugmentedToken).membershipType = user.membershipType
        console.log('Added membershipType to token:', user.membershipType)
      } else if (account?.provider && account.provider !== 'credentials') {
        // For OAuth providers (Google, Facebook, Twitter, Instagram), set default membershipType
        ;(token as AugmentedToken).membershipType = 'member'
        console.log('Added default membershipType for OAuth provider:', account.provider)
      }

      if (user?.role) {
        ;(token as AugmentedToken).role = user.role
        console.log('Added role to token:', user.role)
      } else if (account?.provider && account.provider !== 'credentials') {
        // For OAuth providers, set default role
        ;(token as AugmentedToken).role = 'member'
        console.log('Added default role for OAuth provider:', account.provider)
      }
      
      console.log('Token after:', JSON.stringify(token, null, 2))
      console.log('=== END JWT CALLBACK ===')
      return token
    },
    async session({ session, token }) {
      console.log('=== SESSION CALLBACK ===')
      console.log('Session before:', JSON.stringify(session, null, 2))
      console.log('Token:', JSON.stringify(token, null, 2))
      
      if (session.user) {
        const u = session.user as typeof session.user & {
          membershipStatus?: string
          subscriptionPeriodEnd?: string
          role?: string
        }
        const t = token as AugmentedToken & { sub?: string }
        u.id = t.sub || '1'
        u.membershipType = t.membershipType || 'member' // Default to 'member' for OAuth users
        u.role = t.role || 'member' // Default to 'member' role for OAuth users
        u.membershipStatus = 'ACTIVE'
        console.log('Session user after modification:', JSON.stringify(u, null, 2))
      }
      
      console.log('Session after:', JSON.stringify(session, null, 2))
      console.log('=== END SESSION CALLBACK ===')
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('=== REDIRECT CALLBACK ===')
      console.log('URL:', url)
      console.log('BaseURL:', baseUrl)
      
      let finalUrl = baseUrl
      
      // Allow relative callback URLs
      if (url.startsWith('/')) {
        finalUrl = `${baseUrl}${url}`
      }
      // Allow callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        finalUrl = url
      }
      
      console.log('Final redirect URL:', finalUrl)
      console.log('=== END REDIRECT CALLBACK ===')
      return finalUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: true, // Enable debug mode to see more detailed logs
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Set to false for development on localhost
        domain: undefined, // Let it use the default domain
      },
    },
  },
}

// authOptions is already exported above
export { getServerSession } from 'next-auth'
