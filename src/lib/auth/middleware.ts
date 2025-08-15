import { NextRequest } from 'next/server';
import type { AuthUser } from '@/lib/auth/types';

/**
 * Extracts authenticated user information from request headers
 * This data is set by the authentication middleware
 */
export function getAuthenticatedUser(request: NextRequest): AuthUser | null {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userMembership = request.headers.get('x-user-membership');
  const userStatus = request.headers.get('x-user-status');

  if (!userId || !userEmail || !userMembership || !userStatus) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    name: '', // Name is not passed in headers for security, fetch from DB if needed
    membershipType: userMembership,
    membershipStatus: userStatus,
    role: '', // Role not passed in headers, fetch from DB if needed
  };
}

/**
 * Checks if the authenticated user has admin privileges
 */
export function isAdmin(request: NextRequest): boolean {
  const userMembership = request.headers.get('x-user-membership');
  return userMembership === 'ADMIN';
}

/**
 * Checks if the authenticated user has premium membership
 */
export function hasPremiumAccess(request: NextRequest): boolean {
  const userMembership = request.headers.get('x-user-membership');
  return ['PREMIUM', 'ANNUAL', 'ADMIN'].includes(userMembership || '');
}

/**
 * Gets the user ID from request headers
 */
export function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

/**
 * Validates that a user can access their own resources
 * Useful for endpoints like /api/user/[userId] where users should only access their own data
 */
export function canAccessUserResource(request: NextRequest, resourceUserId: string): boolean {
  const currentUserId = getUserId(request);
  const isUserAdmin = isAdmin(request);
  
  // Allow access if user is accessing their own resource or if they're an admin
  return currentUserId === resourceUserId || isUserAdmin;
}
