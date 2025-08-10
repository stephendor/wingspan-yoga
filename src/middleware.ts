import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, getUserFromToken } from '@/lib/auth/utils';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/api/user',
  '/api/admin',
  '/api/classes',
  '/api/bookings',
  '/api/videos',
  '/api/subscription',
  '/api/profile',
  '/dashboard',
  '/admin',
  '/profile',
  '/classes',
  '/videos',
  '/subscription',
];

// Define admin-only routes
const ADMIN_ROUTES = [
  '/api/admin',
  '/admin',
];

// Define routes that require specific membership types
const PREMIUM_ROUTES = [
  '/api/videos/premium',
  '/videos/premium',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes, static files, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/logout' ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Extract token from Authorization header
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    // For API routes, return JSON error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required. Please provide a valid token.' 
        },
        { status: 401 }
      );
    }
    
    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token and get user information
  try {
    const user = await getUserFromToken(token);
    
    if (!user) {
      // Token is invalid or expired
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid or expired token. Please login again.' 
          },
          { status: 401 }
        );
      }
      
      // For page routes, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin-only routes
    const isAdminRoute = ADMIN_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    
    if (isAdminRoute && user.membershipType !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Admin access required.' 
          },
          { status: 403 }
        );
      }
      
      // Redirect non-admin users to dashboard or home
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check premium routes
    const isPremiumRoute = PREMIUM_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    
    if (isPremiumRoute && !['PREMIUM', 'ANNUAL', 'ADMIN'].includes(user.membershipType)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Premium membership required to access this content.' 
          },
          { status: 403 }
        );
      }
      
      // Redirect to subscription page
      return NextResponse.redirect(new URL('/subscription', request.url));
    }

    // Add user information to request headers for downstream handlers
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-user-membership', user.membershipType);
    response.headers.set('x-user-status', user.membershipStatus);
    
    return response;

  } catch (error) {
    console.error('Middleware authentication error:', error);
    
    // Internal server error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication service unavailable. Please try again later.' 
        },
        { status: 500 }
      );
    }
    
    // For page routes, redirect to login as fallback
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
