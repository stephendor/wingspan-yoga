import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export interface JWTPayload {
  userId: string;
  email: string;
  membershipType: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  membershipType: string;
  membershipStatus: string;
}

/**
 * Verifies a JWT token and returns the decoded payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return null;
    }

    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'wingspan-yoga',
      audience: 'wingspan-yoga-users',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extracts the token from the Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Gets user information from a JWT token and validates the session
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    // Verify the JWT token
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            membershipType: true,
            membershipStatus: true,
          },
        },
      },
    });

    // Check if session exists and is not expired
    if (!session || session.expires < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({
          where: { sessionToken: token },
        });
      }
      return null;
    }

    // Check if user account is still active
    if (session.user.membershipStatus !== 'ACTIVE') {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      membershipType: session.user.membershipType,
      membershipStatus: session.user.membershipStatus,
    };
  } catch (error) {
    console.error('Get user from token failed:', error);
    return null;
  }
}

/**
 * Invalidates a session by removing it from the database
 */
export async function invalidateSession(token: string): Promise<boolean> {
  try {
    await prisma.session.delete({
      where: { sessionToken: token },
    });
    return true;
  } catch (error) {
    console.error('Failed to invalidate session:', error);
    return false;
  }
}

/**
 * Cleans up expired sessions from the database
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return 0;
  }
}
