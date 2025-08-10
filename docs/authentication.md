# Authentication System

This document describes the authentication system implemented for Wingspan Yoga.

## Overview

The authentication system provides secure user login functionality using JWT (JSON Web Tokens) and bcrypt for password hashing.

## Components

### API Endpoints

#### POST /api/auth/login
Authenticates users and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "membershipType": "FREE"
  },
  "token": "jwt-token-here"
}
```

**Error Response (400/401/403/500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

#### POST /api/auth/logout
Invalidates the user's session.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### GET /api/user/me
Retrieves the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "membershipType": "PREMIUM",
    "membershipStatus": "ACTIVE",
    "bio": "Yoga enthusiast",
    "phone": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH /api/user/me
Updates the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "phone": "+1234567890"
}
```

#### GET /api/admin/users
Lists all users (admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10, max: 100)
- `search` - Search term for email/name
- `membershipType` - Filter by membership type
- `membershipStatus` - Filter by membership status

**Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "membershipType": "PREMIUM",
      "membershipStatus": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Authentication Utilities

Located in `src/lib/auth/utils.ts`:

- `verifyToken(token: string)` - Verifies JWT token validity
- `extractTokenFromHeader(authHeader: string)` - Extracts token from Authorization header
- `getUserFromToken(token: string)` - Gets user data from valid token
- `invalidateSession(token: string)` - Removes session from database
- `cleanupExpiredSessions()` - Removes expired sessions (maintenance)

### Middleware System

#### Next.js Middleware (`src/middleware.ts`)

The application uses Next.js middleware to protect routes and validate authentication automatically.

**Protected Routes:**
- `/api/user/*` - User profile management
- `/api/admin/*` - Admin-only endpoints  
- `/api/classes/*` - Class management
- `/api/bookings/*` - Booking management
- `/api/subscriptions/*` - Subscription management
- `/profile` - User profile pages
- `/admin` - Admin dashboard
- `/classes` - Class pages
- `/bookings` - Booking pages

**Middleware Features:**
- Automatic JWT token validation
- Role-based access control
- User information injection into request headers
- Graceful error handling for invalid tokens

#### Middleware Helper Functions (`src/lib/auth/middleware.ts`)

Helper functions for API routes to access user context:

**`getAuthenticatedUser(request: NextRequest): AuthUser | null`**
Extracts authenticated user information from request headers.

```typescript
import { getAuthenticatedUser } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Use user.id, user.email, etc.
}
```

**`isAdmin(request: NextRequest): boolean`**
Checks if the authenticated user has admin privileges.

**`hasPremiumAccess(request: NextRequest): boolean`**
Checks if the authenticated user has premium or admin membership.

**`canAccessUserResource(request: NextRequest, resourceUserId: string): boolean`**
Checks if the authenticated user can access a specific user's resource.

### Types

Located in `src/lib/auth/types.ts`:

- `LoginRequest` / `LoginResponse` - Login endpoint types
- `AuthUser` - Authenticated user data structure
- `JWTPayload` - JWT token payload structure

## Security Features

1. **Password Hashing**: Uses bcryptjs for secure password storage
2. **JWT Tokens**: Stateless authentication with 7-day expiration
3. **Session Management**: Database-backed session tracking
4. **Input Validation**: Email format and required field validation
5. **Error Handling**: Generic error messages to prevent user enumeration
6. **Token Verification**: Validates JWT signature, expiration, issuer, and audience
7. **Account Status**: Checks for active membership status

## Environment Variables

Required environment variables (add to `.env`):

```bash
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
DATABASE_URL="postgresql://username:password@localhost:5432/wingspan_yoga"
```

## Database Schema

The authentication system uses these Prisma models:
- `User` - User account information
- `Session` - Active user sessions
- `Account` - OAuth provider accounts (NextAuth.js compatible)

## Testing

Test scenarios are documented in `tests/auth/login.test.ts`. To implement actual tests:

1. Install testing dependencies (Jest, supertest)
2. Set up test database
3. Create test users with known passwords
4. Run integration tests against the API endpoints

## Usage Example

```typescript
// Frontend login example
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();

if (data.success) {
  // Store token for authenticated requests
  localStorage.setItem('authToken', data.token);
  console.log('Logged in as:', data.user.name);
} else {
  console.error('Login failed:', data.error);
}
```

## Security Considerations

1. **JWT Secret**: Must be strong and kept secure
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: Store tokens securely on client (httpOnly cookies recommended)
4. **Session Cleanup**: Run periodic cleanup of expired sessions
5. **Rate Limiting**: Consider implementing rate limiting for login attempts
6. **Account Lockout**: Consider temporary account lockout after failed attempts

## Next Steps

To complete the authentication system:

1. Implement user registration endpoint
2. Add password reset functionality
3. Implement authentication middleware for protected routes
4. Add OAuth providers (Google, GitHub, etc.)
5. Set up proper error logging and monitoring
6. Add rate limiting and brute force protection
