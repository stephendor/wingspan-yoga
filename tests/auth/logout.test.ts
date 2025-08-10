/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/logout/route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock NextAuth config
jest.mock('@/lib/auth/nextauth', () => ({
  authOptions: {},
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      deleteMany: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockDeleteMany = jest.mocked(prisma.session.deleteMany)

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully logout an authenticated user', async () => {
    // Mock authenticated session
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock successful session deletion
    mockDeleteMany.mockResolvedValue({ count: 1 })

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      message: 'Successfully logged out',
    })

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
      },
    })
  })

  it('should return 401 for unauthenticated requests', async () => {
    // Mock no session
    mockGetServerSession.mockResolvedValue(null)

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({
      success: false,
      message: 'Not authenticated',
    })

    expect(mockDeleteMany).not.toHaveBeenCalled()
  })

  it('should return 401 for session without user id', async () => {
    // Mock session without user
    mockGetServerSession.mockResolvedValue({
      user: null,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({
      success: false,
      message: 'Not authenticated',
    })

    expect(mockDeleteMany).not.toHaveBeenCalled()
  })

  it('should handle database errors gracefully', async () => {
    // Mock authenticated session
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock database error
    mockDeleteMany.mockRejectedValue(new Error('Database error'))

    const response = await POST()
    const data = await response.json()

    // Should still return success since client-side logout should proceed
    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      message: 'Successfully logged out',
    })
  })

  it('should handle auth function errors', async () => {
    // Mock auth function error
    mockGetServerSession.mockRejectedValue(new Error('Auth error'))

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      success: false,
      message: 'An unexpected error occurred',
    })
  })
})
