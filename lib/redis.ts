/**
 * Redis Client for Distributed Rate Limiting and Cron Job Locks
 * Uses Upstash Redis for serverless-friendly Redis operations
 */

import { Redis } from '@upstash/redis';

// Singleton pattern to reuse Redis connection across serverless invocations
let redisInstance: Redis | null = null;

/**
 * Get or create Redis client instance
 * Falls back to mock implementation if Redis is not configured (development)
 */
export function getRedisClient(): Redis {
  // Return existing instance if available
  if (redisInstance) {
    return redisInstance;
  }

  // Check if Redis is configured
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '⚠️  Redis not configured. Rate limiting and distributed locks will not work correctly in production.'
    );
    console.warn('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env');

    // Return a mock Redis client for development
    // This allows the app to run without Redis but won't provide distributed functionality
    return {
      get: async () => null,
      set: async () => 'OK',
      incr: async () => 1,
      expire: async () => 1,
      del: async () => 1,
      setnx: async () => 1,
      ttl: async () => -1,
    } as any;
  }

  // Create new Redis instance
  redisInstance = new Redis({
    url,
    token,
    // Automatic retries for transient failures
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 3000),
    },
  });

  return redisInstance;
}

/**
 * Helper function to safely execute Redis operations with error handling
 */
export async function executeRedisCommand<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return fallback;
  }
}
