import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define admin-only routes
const ADMIN_ROUTES = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only process admin routes
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  
  if (!isAdminRoute) {
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

    if (!token || !token.sub) {
      // Not authenticated - redirect to sign in
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user has admin role (case-insensitive)
    if (token.membershipType?.toLowerCase() !== 'admin') {
      // Not an admin - redirect to home with error
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(homeUrl);
    }

    // User is authenticated and has admin role - allow access
    return NextResponse.next();

  } catch (error) {
    console.error('Admin middleware authentication error:', error);
    
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
     * Match admin routes only
     */
    '/admin/:path*',
  ],
};
