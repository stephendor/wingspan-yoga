import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { prismaMock, resetPrismaMock } from '../utils/prismaMock'
import { importPost } from '../utils/importPost'

// Mock bcrypt before route import
const mockHash = jest.fn(async () => 'hashed_password')
jest.mock('bcryptjs', () => ({ hash: () => mockHash() }))

// Provide prisma mock
jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

interface UserEntity { id: string; name: string | null; email: string; membershipType?: string; password?: string | null; role?: string | null }

describe('/api/auth/register', () => {
  beforeEach(() => {
    resetPrismaMock()
    jest.clearAllMocks()
    mockHash.mockResolvedValue('hashed_password')
  })

  it('should successfully register a new user', async () => {
  // Arrange
  prismaMock.user.findUnique.mockResolvedValue(null)

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

  prismaMock.user.create.mockResolvedValue(mockUser as never)

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
  const POST = await importPost('@/app/api/auth/register/route') as (req: NextRequest) => Promise<Response>
  const response = await POST(request)
    const data = await response.json()

    // Assert
  expect(response.status).toBe(201)
  expect(data.message).toBe('User registered successfully')
  expect(prismaMock.user.create).toHaveBeenCalled()
  expect(mockHash).toHaveBeenCalled()
  })

  it('should return 409 if user already exists', async () => {
    // Arrange
    const existingUser: UserEntity = {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      password: 'hashed',
      role: 'USER',
    }

    prismaMock.user.findUnique.mockResolvedValue(existingUser as unknown as UserEntity)

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
  const POST = await importPost('@/app/api/auth/register/route') as (req: NextRequest) => Promise<Response>
  const response = await POST(request)
    const data = await response.json()

    // Assert
  expect(response.status).toBe(409)
  expect(data.error).toBe('User with this email already exists')
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
  const POST = await importPost('@/app/api/auth/register/route') as (req: NextRequest) => Promise<Response>
  const response = await POST(request)
    const data = await response.json()

    // Assert
  expect(response.status).toBe(400)
  expect(data.error).toBe('Validation failed')
  })
})
