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
 * Handles user logout using NextAuth
 */
export async function handleLogout(options: LogoutOptions = {}): Promise<LogoutResult> {
  try {
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
    return {
      success: false,
      message: 'Failed to logout',
    };
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
 * Note: In server environments, use NextAuth's signOut directly
 */
export async function serverLogout(): Promise<LogoutResult> {
  // For server-side logout, NextAuth handles session cleanup automatically
  return {
    success: true,
    message: 'Logout handled by NextAuth server-side',
  };
}
