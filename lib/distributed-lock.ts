/**
 * Distributed Lock Implementation using Redis
 *
 * Prevents multiple instances of cron jobs from running simultaneously
 * across serverless function invocations.
 */

import { getRedisClient } from './redis';

export interface LockOptions {
  /** Lock timeout in seconds (default: 5 minutes) */
  timeout?: number;
  /** Number of retry attempts if lock is already held (default: 0) */
  retries?: number;
  /** Delay between retries in milliseconds (default: 1000ms) */
  retryDelay?: number;
}

export interface LockResult {
  /** Whether the lock was acquired */
  acquired: boolean;
  /** Function to release the lock */
  release: () => Promise<void>;
  /** Lock identifier */
  lockId: string | null;
}

/**
 * Acquire a distributed lock for a given resource
 *
 * @param lockName - Unique name for the lock (e.g., 'cron:push-reminders')
 * @param options - Lock configuration options
 * @returns LockResult with acquired status and release function
 *
 * @example
 * ```typescript
 * const lock = await acquireLock('cron:send-emails', { timeout: 300 });
 * if (!lock.acquired) {
 *   console.log('Job already running');
 *   return;
 * }
 *
 * try {
 *   // Do work here
 *   await sendEmails();
 * } finally {
 *   await lock.release();
 * }
 * ```
 */
export async function acquireLock(
  lockName: string,
  options: LockOptions = {}
): Promise<LockResult> {
  const {
    timeout = 300, // 5 minutes default
    retries = 0,
    retryDelay = 1000,
  } = options;

  const redis = getRedisClient();
  const lockKey = `lock:${lockName}`;
  const lockId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  let attempts = 0;
  let acquired = false;

  while (attempts <= retries && !acquired) {
    try {
      // Try to set the lock with NX (only if not exists) and EX (expiration)
      // Returns 1 if lock was set, 0 if key already exists
      const result = await redis.setnx(lockKey, lockId);

      if (result === 1) {
        // Lock acquired! Set expiration
        await redis.expire(lockKey, timeout);
        acquired = true;

        console.log(`✅ Lock acquired: ${lockName} (ID: ${lockId}, timeout: ${timeout}s)`);
      } else {
        // Lock already held by another process
        if (attempts < retries) {
          console.log(`⏳ Lock held: ${lockName}, retrying in ${retryDelay}ms (attempt ${attempts + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    } catch (error) {
      console.error(`Failed to acquire lock ${lockName}:`, error);
      break;
    }

    attempts++;
  }

  if (!acquired) {
    console.log(`❌ Failed to acquire lock: ${lockName} after ${attempts} attempts`);
  }

  // Return lock result with release function
  return {
    acquired,
    lockId: acquired ? lockId : null,
    release: async () => {
      if (!acquired) return;

      try {
        // Only release if we still own the lock (check lockId matches)
        const currentLockId = await redis.get(lockKey);

        if (currentLockId === lockId) {
          await redis.del(lockKey);
          console.log(`🔓 Lock released: ${lockName} (ID: ${lockId})`);
        } else {
          console.warn(`⚠️  Lock ${lockName} was already released or expired`);
        }
      } catch (error) {
        console.error(`Failed to release lock ${lockName}:`, error);
      }
    },
  };
}

/**
 * Check if a lock is currently held
 *
 * @param lockName - Name of the lock to check
 * @returns Boolean indicating if lock is held, or null if Redis fails
 */
export async function isLocked(lockName: string): Promise<boolean | null> {
  try {
    const redis = getRedisClient();
    const lockKey = `lock:${lockName}`;
    const value = await redis.get(lockKey);
    return value !== null;
  } catch (error) {
    console.error(`Failed to check lock status for ${lockName}:`, error);
    return null;
  }
}

/**
 * Force release a lock (use with caution!)
 *
 * This should only be used in emergency situations or by admin tools.
 *
 * @param lockName - Name of the lock to release
 */
export async function forceReleaseLock(lockName: string): Promise<void> {
  try {
    const redis = getRedisClient();
    const lockKey = `lock:${lockName}`;
    await redis.del(lockKey);
    console.log(`🔓 Force released lock: ${lockName}`);
  } catch (error) {
    console.error(`Failed to force release lock ${lockName}:`, error);
  }
}

/**
 * Get lock TTL (time remaining before expiration)
 *
 * @param lockName - Name of the lock
 * @returns Seconds remaining, or -1 if lock doesn't exist, or null on error
 */
export async function getLockTTL(lockName: string): Promise<number | null> {
  try {
    const redis = getRedisClient();
    const lockKey = `lock:${lockName}`;
    const ttl = await redis.ttl(lockKey);
    return ttl;
  } catch (error) {
    console.error(`Failed to get lock TTL for ${lockName}:`, error);
    return null;
  }
}

/**
 * Execute a function with a distributed lock
 *
 * Automatically acquires lock, executes function, and releases lock.
 * If lock cannot be acquired, returns without executing.
 *
 * @param lockName - Unique name for the lock
 * @param fn - Async function to execute
 * @param options - Lock configuration options
 * @returns Result of the function, or null if lock not acquired
 *
 * @example
 * ```typescript
 * await withLock('cron:generate-tasks', async () => {
 *   await generateRecurringTasks();
 * }, { timeout: 600 }); // 10 minute timeout
 * ```
 */
export async function withLock<T>(
  lockName: string,
  fn: () => Promise<T>,
  options: LockOptions = {}
): Promise<T | null> {
  const lock = await acquireLock(lockName, options);

  if (!lock.acquired) {
    console.log(`Skipping execution: lock not acquired for ${lockName}`);
    return null;
  }

  try {
    const result = await fn();
    return result;
  } catch (error) {
    console.error(`Error in locked execution of ${lockName}:`, error);
    throw error;
  } finally {
    await lock.release();
  }
}
