import { useSession, signIn, signOut } from 'next-auth/react';
import type { AuthUser } from '@/lib/auth/types';

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();

  // Transform NextAuth session to match AuthUser interface
  const user: AuthUser | null = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    membershipType: session.user.membershipType || 'FREE',
    membershipStatus: session.user.membershipStatus || 'ACTIVE',
    role: session.user.role || 'MEMBER',
  } : null;


  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: 'Invalid email or password' };
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshUser = async () => {
    try {
      await update();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    login,
    logout,
    refreshUser,
  };
}
