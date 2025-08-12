import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Secret key for E2E testing - in real app, this should be in env vars
const TEST_KEY = process.env.E2E_TEST_KEY || 'wingspan-yoga-e2e-test-key'
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-please-change-in-production'

// This handler creates a test session for E2E testing
export async function POST(req: NextRequest) {
  // Only allow in dev/test environments
  const isDev = process.env.NODE_ENV === 'development'
  const isTest = process.env.NODE_ENV === 'test' || process.env.E2E_TEST === 'true'

  if (!isDev && !isTest) {
    return NextResponse.json(
      { success: false, error: 'Only available in test or development environment' },
      { status: 403 }
    )
  }

  try {
    const { key } = await req.json()

    // Validate test key
    if (key !== TEST_KEY) {
      return NextResponse.json(
        { success: false, error: 'Invalid test key' },
        { status: 401 }
      )
    }

    // Find or create a test user account
    let testUser
    try {
      testUser = await prisma.user.findUnique({
        where: { email: 'e2e-test@example.com' }
      })
      
      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            email: 'e2e-test@example.com',
            name: 'E2E Test User',
            // Using a pre-hashed password for test user only
            password: 'wingspan-yoga-e2e-test-password-hash', 
            membershipType: 'PREMIUM' // Give full access for testing
          }
        })
      }
    } catch (createError) {
      // If user creation fails due to race condition, try to find existing user
      testUser = await prisma.user.findUnique({
        where: { email: 'e2e-test@example.com' }
      })
      if (!testUser) {
        throw createError // Re-throw if user still doesn't exist
      }
    }

    // Create NextAuth.js session JWT token
    const expiresIn = 60 * 60 * 24 * 7 // 1 week
    const token = await new SignJWT({
      name: testUser.name,
      email: testUser.email,
      sub: testUser.id,
      membershipType: testUser.membershipType
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
      .sign(new TextEncoder().encode(NEXTAUTH_SECRET))

    // Create a response with the cookie
    const response = NextResponse.json({ success: true })
    
    // Set the cookie
    response.cookies.set({
      name: 'next-auth.session-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV !== 'development',
      maxAge: expiresIn
    })

    return response
  } catch (error) {
    console.error('E2E auth bypass error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create test session' },
      { status: 500 }
    )
  } finally {
    // Close Prisma client to prevent open handles
    await prisma.$disconnect()
  }
}
