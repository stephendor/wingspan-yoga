import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis client - fallback to memory for development
let redis: Redis;
try {
  redis = Redis.fromEnv();
} catch {
  console.warn('Redis not configured, using in-memory rate limiting for development');
  // Use Map for in-memory rate limiting during development
  const memory = new Map<string, { value: unknown; expiry: number | null }>();
  redis = {
    set: async (key: string, value: unknown, options?: { ex?: number }) => {
      memory.set(key, { value, expiry: options?.ex ? Date.now() + (options.ex * 1000) : null });
      return 'OK';
    },
    get: async (key: string) => {
      const item = memory.get(key);
      if (!item) return null;
      if (item.expiry && Date.now() > item.expiry) {
        memory.delete(key);
        return null;
      }
      return item.value;
    },
    del: async (key: string) => {
      memory.delete(key);
      return 1;
    },
    eval: async () => null // Simplified for development
  } as unknown as Redis;
}

// Rate limiting configurations
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts per minute
  analytics: true,
  prefix: 'auth',
})

export const paymentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 payment requests per minute
  analytics: true,
  prefix: 'payment',
})

export const registrationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 registrations per hour
  analytics: true,
  prefix: 'registration',
})

export const generalAPIRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute for general APIs
  analytics: true,
  prefix: 'api',
})

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  // Fallback to connection remote address (not available in edge runtime)
  return 'unknown'
}

// Rate limiting middleware function
export async function applyRateLimit(
  request: Request,
  rateLimit: Ratelimit,
  identifier?: string
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  try {
    const ip = identifier || getClientIP(request)
    const { success, reset, remaining } = await rateLimit.limit(ip)
    
    if (!success) {
      const resetTime = Math.round((reset - Date.now()) / 1000)
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
        remaining: 0
      }
    }
    
    return {
      success: true,
      remaining
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // If rate limiting fails, allow the request to proceed
    return { success: true }
  }
}