// Server-side Push Notification Sender Utility

import webpush from 'web-push';
import { prisma } from '@/lib/prisma';
import { Task } from '@/types';

// Configure VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:duesync@wiktechnologies.com';

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('[Push Sender] VAPID keys not configured');
} else {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  taskId?: string;
  priority?: string;
  url?: string;
  requireInteraction?: boolean;
}

/**
 * Send push notification to a specific user
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user's notification preference
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      return { success: false, error: 'No notification preference found' };
    }

    if (!preference.pushNotificationsEnabled) {
      return { success: false, error: 'Push notifications disabled for user' };
    }

    if (!preference.pushSubscription) {
      return { success: false, error: 'No push subscription found' };
    }

    // Send push notification
    const pushSubscription = preference.pushSubscription as any;
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log('[Push Sender] Notification sent to user:', userId);
    return { success: true };
  } catch (error: any) {
    console.error('[Push Sender] Error sending notification:', error);

    // Handle expired subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('[Push Sender] Subscription expired, removing from database');
      await prisma.notificationPreference.update({
        where: { userId },
        data: {
          pushSubscription: null,
          pushNotificationsEnabled: false,
        },
      });
      return { success: false, error: 'Subscription expired and removed' };
    }

    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToMultipleUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushToUser(userId, payload))
  );

  const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - sent;
  const errors = results
    .filter((r) => r.status === 'fulfilled' && !r.value.success)
    .map((r) => (r as PromiseFulfilledResult<any>).value.error);

  console.log(`[Push Sender] Bulk send completed: ${sent} sent, ${failed} failed`);

  return { sent, failed, errors };
}

/**
 * Send task reminder notification
 */
export async function sendTaskReminderPush(userId: string, task: Task): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: `Task Reminder: ${task.title}`,
    body: getTaskReminderMessage(task),
    taskId: task.id,
    priority: task.priority,
    url: '/',
    requireInteraction: task.priority === 'HIGH',
  };

  const result = await sendPushToUser(userId, payload);
  return result.success;
}

/**
 * Send overdue task notification
 */
export async function sendOverdueTaskPush(userId: string, task: Task): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: `⚠️ Overdue: ${task.title}`,
    body: `This task was due ${getRelativeTime(task.dueDate)}. Don't forget to complete it!`,
    taskId: task.id,
    priority: task.priority,
    url: '/',
    requireInteraction: true,
  };

  const result = await sendPushToUser(userId, payload);
  return result.success;
}

/**
 * Send task due today notification
 */
export async function sendTaskDueTodayPush(userId: string, task: Task): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: `Due Today: ${task.title}`,
    body: task.dueTime
      ? `This task is due today at ${formatTime12Hour(task.dueTime)}`
      : 'This task is due today',
    taskId: task.id,
    priority: task.priority,
    url: '/',
    requireInteraction: false,
  };

  const result = await sendPushToUser(userId, payload);
  return result.success;
}

/**
 * Generate task reminder message based on task details
 */
function getTaskReminderMessage(task: Task): string {
  const parts: string[] = [];

  if (task.dueTime) {
    parts.push(`Due at ${formatTime12Hour(task.dueTime)}`);
  } else {
    parts.push(`Due ${getRelativeTime(task.dueDate)}`);
  }

  if (task.priority === 'HIGH') {
    parts.push('• High Priority');
  }

  if (task.estimatedTime) {
    const hours = Math.floor(task.estimatedTime / 60);
    const minutes = task.estimatedTime % 60;
    if (hours > 0) {
      parts.push(`• ${hours}h ${minutes}m estimated`);
    } else {
      parts.push(`• ${minutes}m estimated`);
    }
  }

  return parts.join(' ');
}

/**
 * Format time to 12-hour format
 */
function formatTime12Hour(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get relative time description
 */
function getRelativeTime(date: Date | string): string {
  const dueDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 0) {
    const absMins = Math.abs(diffMins);
    if (absMins < 60) return `${absMins} minutes ago`;
    if (absMins < 1440) return `${Math.floor(absMins / 60)} hours ago`;
    return `${Math.floor(absMins / 1440)} days ago`;
  }

  if (diffMins < 60) return `in ${diffMins} minutes`;
  if (diffHours < 24) return `in ${diffHours} hours`;
  if (diffDays === 1) return 'tomorrow';
  if (diffDays < 7) return `in ${diffDays} days`;

  return dueDate.toLocaleDateString();
}

/**
 * Check if user has valid push subscription
 */
export async function hasValidPushSubscription(userId: string): Promise<boolean> {
  const preference = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  return !!(
    preference &&
    preference.pushNotificationsEnabled &&
    preference.pushSubscription
  );
}

/**
 * Get all users with active push subscriptions
 */
export async function getUsersWithPushEnabled(): Promise<string[]> {
  const preferences = await prisma.notificationPreference.findMany({
    where: {
      pushNotificationsEnabled: true,
      pushSubscription: { not: null },
    },
    select: { userId: true },
  });

  return preferences.map((p) => p.userId);
}
