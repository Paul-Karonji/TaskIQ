import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, getRateLimitHeaders, RATE_LIMITS } from './lib/rate-limit'

/**
 * Middleware for security and rate limiting
 * Runs before every request to the application
 * Now uses Redis for distributed rate limiting across serverless instances
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get client IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  // Apply rate limiting based on route
  const pathname = request.nextUrl.pathname

  // API routes rate limiting
  if (pathname.startsWith('/api/')) {
    // Skip rate limiting for:
    // - Health check, metrics
    // - User profile routes (already authenticated)
    // - Auth session checks (frequent but harmless)
    // - NextAuth internal routes
    // - Tasks API (authenticated + protected by RLS, filters trigger many calls)
    if (
      pathname === '/api/health' ||
      pathname === '/api/metrics' ||
      pathname.startsWith('/api/user/') ||
      pathname.startsWith('/api/tasks') ||
      pathname === '/api/auth/session' ||
      pathname === '/api/auth/csrf' ||
      pathname.startsWith('/api/auth/callback/') ||
      pathname.startsWith('/api/auth/providers')
    ) {
      return response
    }

    // Different limits for different API routes
    let limitConfig: { limit: number; window: number } = RATE_LIMITS.API

    // Only rate limit actual authentication attempts (signin/signout)
    if (pathname === '/api/auth/signin' || pathname === '/api/auth/signout') {
      limitConfig = RATE_LIMITS.AUTH
    } else if (pathname.startsWith('/api/notifications/push')) {
      limitConfig = RATE_LIMITS.PUSH
    } else if (pathname.includes('/calendar')) {
      limitConfig = RATE_LIMITS.CALENDAR
    }

    const rateLimitResult = await rateLimit(ip, {
      ...limitConfig,
      identifier: pathname,
    })

    // Add rate limit headers
    const headers = getRateLimitHeaders(rateLimitResult, limitConfig.limit)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Block if rate limit exceeded
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: new Date(rateLimitResult.resetAt).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(
              (rateLimitResult.resetAt - Date.now()) / 1000
            ).toString(),
            ...headers,
          },
        }
      )
    }
  }

  // Add security headers (these are also in next.config.js, but adding here for redundancy)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Add CORS headers for API routes (if needed for external consumption)
  if (pathname.startsWith('/api/')) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
    const origin = request.headers.get('origin')

    if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  return response
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
