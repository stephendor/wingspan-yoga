/**
 * Manual Test Script for Login API Endpoint
 *
 * NOTE: Added a lightweight placeholder test so that Jest does not fail this
 * file for containing zero tests. Full integration tests can be implemented
 * later following the scenarios below.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { importPost } from '../utils/importPost'

process.env.JWT_SECRET = 'test_jwt_secret'

import { prismaMock, resetPrismaMock } from '../utils/prismaMock'

// Define typed mock functions first so we can reference in jest.mock factories
const mockCompare = jest.fn<(plain: string, hash: string) => Promise<boolean>>()
interface JwtPayloadShape { [key: string]: unknown }
// Keep loose typing but avoid 'any'
const mockJwtSign = jest
  .fn<(payload: JwtPayloadShape, secret: string, options?: Record<string, unknown>) => string>()
  .mockReturnValue('mock.jwt.token')

jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
jest.mock('bcryptjs', () => ({ compare: mockCompare }))
jest.mock('jsonwebtoken', () => ({ sign: mockJwtSign }))

import 'bcryptjs'
import 'jsonwebtoken'

// Type-safe mocked functions
// Use the already defined typed mocks (module mocks return these instances)

interface LoginBody { email?: string; password?: string }
function buildRequest(body: LoginBody) {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/auth/login', () => {
  beforeEach(() => {
    resetPrismaMock()
    jest.clearAllMocks()
    mockJwtSign.mockReturnValue('mock.jwt.token')
  })

  it('logs in successfully with valid credentials', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_pw',
      membershipType: 'FREE',
      membershipStatus: 'ACTIVE',
    })
    mockCompare.mockResolvedValue(true as unknown as boolean)
    prismaMock.session.create.mockResolvedValue({ id: 'session-1' })

    const response = await POST(buildRequest({ email: 'test@example.com', password: 'validpassword123' }))
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('test@example.com')
    expect(data.token).toBe('mock.jwt.token')
    expect(prismaMock.session.create).toHaveBeenCalledTimes(1)
    expect(mockJwtSign).toHaveBeenCalled()
  })

  it('rejects invalid email format', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    const response = await POST(buildRequest({ email: 'invalid-email', password: 'password123' }))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })

  it('rejects missing password (empty string)', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    const response = await POST(buildRequest({ email: 'test@example.com', password: '' }))
    const data = await response.json()
    expect(response.status).toBe(400)
  expect(data.error).toBe('Password is required and must be a string')
  })

  it('rejects missing email field', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    const response = await POST(buildRequest({ password: 'password123' }))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Email is required and must be a string')
  })

  it('returns 401 for non-existent user', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    prismaMock.user.findUnique.mockResolvedValue(null)
    const response = await POST(buildRequest({ email: 'unknown@example.com', password: 'password123' }))
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid email or password')
  })

  it('returns 401 for wrong password', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_pw',
      membershipType: 'FREE',
      membershipStatus: 'ACTIVE',
    })
    mockCompare.mockResolvedValue(false as unknown as boolean)
    const response = await POST(buildRequest({ email: 'test@example.com', password: 'wrongpassword' }))
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid email or password')
    expect(prismaMock.session.create).not.toHaveBeenCalled()
  })

  it('returns 401 for OAuth-only user (no password column)', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-2',
      email: 'oauth@example.com',
      name: 'OAuth User',
      password: null,
      membershipType: 'FREE',
      membershipStatus: 'ACTIVE',
    })
    const response = await POST(buildRequest({ email: 'oauth@example.com', password: 'anything' }))
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.error).toBe('Please use social login for this account')
  })

  it('returns 403 for inactive user', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-3',
      email: 'inactive@example.com',
      name: 'Inactive User',
      password: 'hashed_pw',
      membershipType: 'FREE',
      membershipStatus: 'INACTIVE',
    })
    mockCompare.mockResolvedValue(true as unknown as boolean)
    const response = await POST(buildRequest({ email: 'inactive@example.com', password: 'password123' }))
    const data = await response.json()
    expect(response.status).toBe(403)
    expect(data.error).toBe('Account is not active. Please contact support.')
    expect(prismaMock.session.create).not.toHaveBeenCalled()
  })

  it('handles internal server error (missing JWT secret)', async () => {
    const POST = (await importPost('@/app/api/auth/login/route')) as (req: NextRequest) => Promise<Response>
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const original = process.env.JWT_SECRET
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete process.env.JWT_SECRET
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-4',
      email: 'test2@example.com',
      name: 'Test User2',
      password: 'hashed_pw',
      membershipType: 'FREE',
      membershipStatus: 'ACTIVE',
    })
    mockCompare.mockResolvedValue(true as unknown as boolean)
    const response = await POST(buildRequest({ email: 'test2@example.com', password: 'password123' }))
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  process.env.JWT_SECRET = original
  errorSpy.mockRestore()
  })
})
