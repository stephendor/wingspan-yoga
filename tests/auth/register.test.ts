import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'

// Mock the dependencies using jest.mocked for proper typing
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

// Import after mocking to get proper types
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Create typed mocks
const mockedPrisma = jest.mocked(prisma)
const mockedBcrypt = jest.mocked(bcrypt)

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully register a new user', async () => {
    // Arrange
    mockedPrisma.user.findUnique.mockResolvedValue(null)
    mockedBcrypt.hash.mockResolvedValue('hashed_password' as never)

    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'USER' as const,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockedPrisma.user.create.mockResolvedValue(mockUser as never)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(data.message).toBe('User created successfully')
    expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12)
  })

  it('should return 409 if user already exists', async () => {
    // Arrange
    const existingUser = {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      password: 'hashed',
      role: 'USER' as const,
    }

    mockedPrisma.user.findUnique.mockResolvedValue(existingUser as never)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(409)
    expect(data.message).toBe('User already exists')
  })

  it('should return 400 for invalid input', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'invalid-email',
        password: '123',
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.message).toBe('Validation error')
  })
})
