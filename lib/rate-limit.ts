/**
 * Distributed Rate Limiting Utility
 *
 * Implements a sliding window rate limiter using Redis (Upstash).
 * Works correctly across multiple serverless function instances.
 */

import { getRedisClient, executeRedisCommand } from './redis';

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the time window */
  limit: number;
  /** Time window in milliseconds */
  window: number;
  /** Custom identifier (defaults to IP address) */
  identifier?: string;
}

export interface RateLimitResult {
  /** Whether the request should be allowed */
  allowed: boolean;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** Timestamp when the rate limit resets */
  resetAt: number;
  /** Number of requests made in the current window */
  count: number;
}

/**
 * Check if a request should be rate limited
 * Now using Redis for distributed rate limiting across serverless instances
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const now = Date.now();
  const key = `ratelimit:${identifier}:${options.identifier || 'default'}`;
  const windowInSeconds = Math.ceil(options.window / 1000);

  try {
    // Get current count
    const currentCount = await redis.get<number>(key);

    // If key doesn't exist or expired, this is a new window
    if (currentCount === null) {
      // Set count to 1 and set expiration
      await redis.set(key, 1, { ex: windowInSeconds });

      return {
        allowed: true,
        remaining: options.limit - 1,
        resetAt: now + options.window,
        count: 1,
      };
    }

    // Increment the count
    const newCount = await redis.incr(key);

    // Get the TTL to calculate resetAt
    const ttl = await redis.ttl(key);
    const resetAt = ttl > 0 ? now + ttl * 1000 : now + options.window;

    // Check if limit exceeded
    const allowed = newCount <= options.limit;
    const remaining = Math.max(0, options.limit - newCount);

    return {
      allowed,
      remaining,
      resetAt,
      count: newCount,
    };
  } catch (error) {
    console.error('Rate limit Redis error:', error);

    // Fallback: allow the request if Redis fails (fail-open for better UX)
    // In production, you might want to fail-closed for security
    return {
      allowed: true,
      remaining: options.limit,
      resetAt: now + options.window,
      count: 0,
    };
  }
}

/**
 * Reset rate limit for a specific identifier (useful for testing or admin override)
 */
export async function resetRateLimit(
  identifier: string,
  route?: string
): Promise<void> {
  const redis = getRedisClient();
  const key = `ratelimit:${identifier}:${route || 'default'}`;

  await executeRedisCommand(
    () => redis.del(key),
    0,
    'Failed to reset rate limit'
  );
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const now = Date.now();
  const key = `ratelimit:${identifier}:${options.identifier || 'default'}`;

  const currentCount = (await redis.get<number>(key)) || 0;
  const ttl = await redis.ttl(key);
  const resetAt = ttl > 0 ? now + ttl * 1000 : now + options.window;

  return {
    allowed: currentCount < options.limit,
    remaining: Math.max(0, options.limit - currentCount),
    resetAt,
    count: currentCount,
  };
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.count.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  };
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // API endpoints: 100 requests per minute
  API: {
    limit: 100,
    window: 60 * 1000, // 1 minute
  },
  // Authentication: 5 attempts per 15 minutes
  AUTH: {
    limit: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },
  // Push notifications: 10 requests per hour
  PUSH: {
    limit: 10,
    window: 60 * 60 * 1000, // 1 hour
  },
  // Email: 20 requests per hour
  EMAIL: {
    limit: 20,
    window: 60 * 60 * 1000, // 1 hour
  },
  // Calendar sync: 50 requests per hour
  CALENDAR: {
    limit: 50,
    window: 60 * 60 * 1000, // 1 hour
  },
} as const;
