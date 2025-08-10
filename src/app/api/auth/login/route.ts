import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import type { LoginSuccessResponse, LoginErrorResponse } from '@/lib/auth/types';

// Simple validation function
function validateLoginInput(body: unknown): { isValid: boolean; error?: string; data?: { email: string; password: string } } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Invalid request body' };
  }

  const bodyObj = body as Record<string, unknown>;
  const { email, password } = bodyObj;

  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required and must be a string' };
  }

  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required and must be a string' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (password.length < 1) {
    return { isValid: false, error: 'Password is required' };
  }

  return { isValid: true, data: { email, password } };
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = validateLoginInput(body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'Invalid input'
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        membershipType: true,
        membershipStatus: true,
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Check if user has a password (might be OAuth-only user)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please use social login for this account'
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.membershipStatus !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is not active. Please contact support.'
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error'
        },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        membershipType: user.membershipType,
      },
      jwtSecret,
      {
        expiresIn: '7d', // Token expires in 7 days
        issuer: 'wingspan-yoga',
        audience: 'wingspan-yoga-users',
      }
    );

    // Create session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expires: expiresAt,
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membershipType: user.membershipType,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}
