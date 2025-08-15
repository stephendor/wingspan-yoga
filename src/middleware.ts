import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isAllowlistedEmail } from '@/lib/auth/allowlist';

// Define protected routes and their required roles
const ADMIN_ROUTES = [
  '/admin',
];

const INSTRUCTOR_ROUTES = [
  '/instructor',
];

function getRequiredRole(pathname: string): 'ADMIN' | 'INSTRUCTOR' | null {
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return 'ADMIN';
  }
  if (INSTRUCTOR_ROUTES.some(route => pathname.startsWith(route))) {
    return 'INSTRUCTOR';
  }
  return null;
}

function hasPermission(userRole: string, requiredRole: 'ADMIN' | 'INSTRUCTOR'): boolean {
  // Admin can access everything
  if (userRole.toLowerCase() === 'admin') {
    return true;
  }
  
  // Instructor can access instructor routes
  if (requiredRole === 'INSTRUCTOR' && userRole.toLowerCase() === 'instructor') {
    return true;
  }
  
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a protected route
  const requiredRole = getRequiredRole(pathname);
  
  if (!requiredRole) {
    return NextResponse.next();
  }

  // Get the session token using NextAuth
  // Validate NEXTAUTH_SECRET before using
  if (!process.env.NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not defined in environment variables.');
    const errorUrl = new URL('/', request.url);
    errorUrl.searchParams.set('error', 'server_misconfiguration');
    return NextResponse.redirect(errorUrl);
  }

  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log('Middleware: Checking access for:', pathname, 'Required role:', requiredRole);

    if (!token || !token.sub) {
      // Not authenticated - redirect to sign in
      console.log('Middleware: No token found, redirecting to sign in');
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user has the required role
    const userRole = token.role || token.membershipType || 'member';
    const userEmail = (token.email as string | undefined) || '';
    if (isAllowlistedEmail(userEmail)) {
      console.log('Middleware: Allowlist bypass for', userEmail);
      return NextResponse.next();
    }
    if (!hasPermission(userRole, requiredRole)) {
      // Not authorized - redirect to home with error
      console.log('Middleware: Access denied - insufficient role. User role:', userRole, 'Required:', requiredRole);
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(homeUrl);
    }

    // User is authenticated and has sufficient role - allow access
    console.log('Middleware: Access granted to:', pathname, 'User role:', userRole);
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware authentication error:', error);
    
    // Fallback to sign in page
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match admin and instructor routes
     */
    '/admin/:path*',
    '/instructor/:path*',
  ],
};
