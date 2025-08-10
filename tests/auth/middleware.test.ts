/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { getAuthenticatedUser, isAdmin, hasPremiumAccess, canAccessUserResource } from '@/lib/auth/middleware';
import { AuthUser } from '@/lib/auth/types';

// Mock NextRequest
const createMockRequest = (headers: Record<string, string> = {}) => {
  return {
    headers: {
      get: jest.fn().mockImplementation((name: string) => headers[name] || null),
    },
  } as unknown as NextRequest;
};

describe('Auth Middleware Helpers', () => {
  const mockUser: AuthUser = {
    id: 'user123',
    email: 'user@example.com',
    name: 'Test User',
    membershipType: 'PREMIUM',
    membershipStatus: 'ACTIVE',
  };

  const mockAdminUser: AuthUser = {
    id: 'admin123',
    email: 'admin@example.com',
    name: 'Admin User',
    membershipType: 'ADMIN',
    membershipStatus: 'ACTIVE',
  };

  describe('getAuthenticatedUser', () => {
    it('should return user when valid user data is in headers', () => {
      const request = createMockRequest({
        'x-user-id': mockUser.id,
        'x-user-email': mockUser.email,
        'x-user-membership': mockUser.membershipType,
        'x-user-status': mockUser.membershipStatus,
      });

      const result = getAuthenticatedUser(request);
      
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: '', // Name is not passed in headers
        membershipType: mockUser.membershipType,
        membershipStatus: mockUser.membershipStatus,
      });
    });

    it('should return null when user ID is missing', () => {
      const request = createMockRequest({
        'x-user-email': mockUser.email,
        'x-user-membership': mockUser.membershipType,
        'x-user-status': mockUser.membershipStatus,
      });

      const result = getAuthenticatedUser(request);
      
      expect(result).toBeNull();
    });

    it('should return null when no user headers are present', () => {
      const request = createMockRequest();

      const result = getAuthenticatedUser(request);
      
      expect(result).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const request = createMockRequest({
        'x-user-id': mockAdminUser.id,
        'x-user-email': mockAdminUser.email,
        'x-user-membership': mockAdminUser.membershipType,
        'x-user-status': mockAdminUser.membershipStatus,
      });

      const result = isAdmin(request);
      
      expect(result).toBe(true);
    });

    it('should return false for non-admin user', () => {
      const request = createMockRequest({
        'x-user-id': mockUser.id,
        'x-user-email': mockUser.email,
        'x-user-membership': mockUser.membershipType,
        'x-user-status': mockUser.membershipStatus,
      });

      const result = isAdmin(request);
      
      expect(result).toBe(false);
    });

    it('should return false when no user is authenticated', () => {
      const request = createMockRequest();

      const result = isAdmin(request);
      
      expect(result).toBe(false);
    });
  });

  describe('hasPremiumAccess', () => {
    it('should return true for premium user', () => {
      const request = createMockRequest({
        'x-user-id': mockUser.id,
        'x-user-email': mockUser.email,
        'x-user-membership': 'PREMIUM',
        'x-user-status': 'ACTIVE',
      });

      const result = hasPremiumAccess(request);
      
      expect(result).toBe(true);
    });

    it('should return true for admin user', () => {
      const request = createMockRequest({
        'x-user-id': mockAdminUser.id,
        'x-user-email': mockAdminUser.email,
        'x-user-membership': 'ADMIN',
        'x-user-status': 'ACTIVE',
      });

      const result = hasPremiumAccess(request);
      
      expect(result).toBe(true);
    });

    it('should return false for basic user', () => {
      const request = createMockRequest({
        'x-user-id': mockUser.id,
        'x-user-email': mockUser.email,
        'x-user-membership': 'BASIC',
        'x-user-status': 'ACTIVE',
      });

      const result = hasPremiumAccess(request);
      
      expect(result).toBe(false);
    });

    it('should return false when no user is authenticated', () => {
      const request = createMockRequest();

      const result = hasPremiumAccess(request);
      
      expect(result).toBe(false);
    });
  });

  describe('canAccessUserResource', () => {
    it('should return true when user accesses their own resource', () => {
      const request = createMockRequest({
        'x-user-id': mockUser.id,
        'x-user-email': mockUser.email,
        'x-user-membership': mockUser.membershipType,
        'x-user-status': mockUser.membershipStatus,
      });

      const result = canAccessUserResource(request, mockUser.id);
      
      expect(result).toBe(true);
    });

    it('should return true when admin accesses any user resource', () => {
      const request = createMockRequest({
        'x-user-id': mockAdminUser.id,
        'x-user-email': mockAdminUser.email,
        'x-user-membership': mockAdminUser.membershipType,
        'x-user-status': mockAdminUser.membershipStatus,
      });

      const result = canAccessUserResource(request, mockUser.id);
      
      expect(result).toBe(true);
    });

    it('should return false when user tries to access another user resource', () => {
      const request = createMockRequest({
        'x-user-id': mockUser.id,
        'x-user-email': mockUser.email,
        'x-user-membership': 'BASIC',
        'x-user-status': 'ACTIVE',
      });

      const result = canAccessUserResource(request, 'different-user-id');
      
      expect(result).toBe(false);
    });

    it('should return false when no user is authenticated', () => {
      const request = createMockRequest();

      const result = canAccessUserResource(request, mockUser.id);
      
      expect(result).toBe(false);
    });
  });
});
