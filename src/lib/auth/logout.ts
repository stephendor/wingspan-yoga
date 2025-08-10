import { signOut } from 'next-auth/react';

export interface LogoutOptions {
  callbackUrl?: string;
  redirect?: boolean;
}

export interface LogoutResult {
  success: boolean;
  message: string;
  url?: string;
}

/**
 * Handles user logout with server-side cleanup
 */
export async function handleLogout(options: LogoutOptions = {}): Promise<LogoutResult> {
  try {
    // First, call our logout API to clean up any database sessions
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Even if server cleanup fails, we should still sign out the user
    if (!response.ok) {
      console.warn('Server-side logout cleanup failed, proceeding with client logout');
    }

    // Use NextAuth's signOut function
    const result = await signOut({
      redirect: options.redirect ?? true,
      callbackUrl: options.callbackUrl ?? '/',
    });

    return {
      success: true,
      message: 'Successfully logged out',
      url: result?.url,
    };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Fallback: try to sign out anyway
    try {
      const result = await signOut({
        redirect: options.redirect ?? true,
        callbackUrl: options.callbackUrl ?? '/',
      });
      
      return {
        success: true,
        message: 'Logged out (with warnings)',
        url: result?.url,
      };
    } catch (fallbackError) {
      console.error('Fallback logout failed:', fallbackError);
      
      return {
        success: false,
        message: 'Failed to logout completely',
      };
    }
  }
}

/**
 * Quick logout function that redirects to home page
 */
export async function logout(): Promise<void> {
  await handleLogout({ callbackUrl: '/' });
}

/**
 * Logout function for API routes or server components
 */
export async function serverLogout(): Promise<LogoutResult> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Successfully logged out',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to logout',
      };
    }
  } catch (error) {
    console.error('Server logout error:', error);
    return {
      success: false,
      message: 'Network error during logout',
    };
  }
}
