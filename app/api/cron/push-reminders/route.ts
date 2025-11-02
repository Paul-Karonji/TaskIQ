// API Route: Cron job for sending push notification reminders
// This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
// Recommended schedule: Every 15 minutes
//
// Uses distributed locking to prevent concurrent execution
// Uses Promise.allSettled for parallel notification sending

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sendTaskReminderPush,
  sendOverdueTaskPush,
  sendTaskDueTodayPush,
} from '@/lib/push-sender';
import { Status } from '@prisma/client';
import { withLock } from '@/lib/distributed-lock';

// Authorization check - protect cron endpoint
function isAuthorizedCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, require it in Authorization header
  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`;
  }

  // For development without CRON_SECRET, allow localhost only
  const host = request.headers.get('host');
  return host?.includes('localhost') || host?.includes('127.0.0.1') || false;
}

export async function GET(request: NextRequest) {
  try {
    // Authorization check
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing cron secret' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting push reminder check...');

    // Use distributed lock to prevent concurrent executions
    const result = await withLock('cron:push-reminders', async () => {
      return await sendPushReminders();
    }, { timeout: 600 }); // 10 minute timeout

    // If lock not acquired, another instance is already running
    if (result === null) {
      console.log('[CRON] Push reminders already in progress');
      return NextResponse.json({
        success: true,
        message: 'Job already running in another instance',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[CRON] Push reminders error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process push reminders',
      },
      { status: 500 }
    );
  }
}

/**
 * Main logic for sending push reminders
 * Extracted to be wrapped in distributed lock
 * Uses Promise.allSettled for parallel notification sending
 */
async function sendPushReminders() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Get notification preferences for users with push enabled
  const preferences = await prisma.notificationPreference.findMany({
    where: {
      pushNotificationsEnabled: true,
      pushSubscription: { not: null },
    },
    include: {
      user: {
        include: {
          tasks: {
            where: {
              status: Status.PENDING,
              dueDate: {
                lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
              },
            },
          },
        },
      },
    },
  });

  console.log(`[CRON] Found ${preferences.length} users with push notifications enabled`);

  // Collect all notifications to send
  const notificationsToSend: Array<{
    type: 'reminder' | 'overdue' | 'dueToday';
    promise: Promise<boolean>;
    taskTitle: string;
    minutesBefore?: number;
  }> = [];

  // Process each user and collect notifications
  for (const pref of preferences) {
    const { user, reminderMinutesBefore } = pref;

    for (const task of user.tasks) {
      const taskDueTime = task.dueTime
        ? new Date(`${task.dueDate.toISOString().split('T')[0]}T${task.dueTime}:00`)
        : new Date(task.dueDate);
      taskDueTime.setSeconds(0, 0);

      const timeDiffMs = taskDueTime.getTime() - now.getTime();
      const timeDiffMinutes = Math.floor(timeDiffMs / 60000);

      // Check if task is overdue
      if (timeDiffMs < 0) {
        // Only send overdue notification once per day (at 9 AM)
        const currentHour = now.getHours();
        if (currentHour === 9) {
          notificationsToSend.push({
            type: 'overdue',
            promise: sendOverdueTaskPush(user.id, task),
            taskTitle: task.title,
          });
        }
        continue;
      }

      // Check if task is due today (send morning reminder at 8 AM)
      const isToday = task.dueDate >= todayStart && task.dueDate <= todayEnd;
      if (isToday && now.getHours() === 8) {
        notificationsToSend.push({
          type: 'dueToday',
          promise: sendTaskDueTodayPush(user.id, task),
          taskTitle: task.title,
        });
        continue;
      }

      // Check if we should send a reminder based on user preferences
      for (const minutesBefore of reminderMinutesBefore) {
        // Check if current time matches reminder time (with 15-minute window)
        const shouldRemind =
          timeDiffMinutes <= minutesBefore && timeDiffMinutes > minutesBefore - 15;

        if (shouldRemind) {
          notificationsToSend.push({
            type: 'reminder',
            promise: sendTaskReminderPush(user.id, task),
            taskTitle: task.title,
            minutesBefore,
          });
          break; // Only send one reminder per task per run
        }
      }
    }
  }

  console.log(`[CRON] Collected ${notificationsToSend.length} notifications to send`);

  // Send all notifications in parallel using Promise.allSettled
  const results = await Promise.allSettled(
    notificationsToSend.map((n) => n.promise)
  );

  // Count results by type
  let remindersSent = 0;
  let overdueSent = 0;
  let dueTodaySent = 0;
  let errors = 0;

  results.forEach((result, index) => {
    const notification = notificationsToSend[index];

    if (result.status === 'fulfilled') {
      if (result.value) {
        // Notification was sent successfully
        if (notification.type === 'reminder') {
          remindersSent++;
          console.log(
            `[CRON] ✅ Reminder sent: ${notification.taskTitle} (${notification.minutesBefore} min before)`
          );
        } else if (notification.type === 'overdue') {
          overdueSent++;
          console.log(`[CRON] ✅ Overdue notification sent: ${notification.taskTitle}`);
        } else if (notification.type === 'dueToday') {
          dueTodaySent++;
          console.log(`[CRON] ✅ Due today notification sent: ${notification.taskTitle}`);
        }
      }
    } else {
      // Notification failed
      errors++;
      console.error(
        `[CRON] ❌ Failed to send ${notification.type} for ${notification.taskTitle}:`,
        result.reason
      );
    }
  });

  const summary = {
    timestamp: now.toISOString(),
    stats: {
      usersProcessed: preferences.length,
      notificationsCollected: notificationsToSend.length,
      remindersSent,
      overdueSent,
      dueTodaySent,
      errors,
      totalSent: remindersSent + overdueSent + dueTodaySent,
      successRate: notificationsToSend.length > 0
        ? `${Math.round(((remindersSent + overdueSent + dueTodaySent) / notificationsToSend.length) * 100)}%`
        : 'N/A',
    },
  };

  console.log('[CRON] Push reminders completed:', summary);

  return {
    success: true,
    ...summary,
  };
}

// Support POST as well (some cron services use POST)
export async function POST(request: NextRequest) {
  return GET(request);
}
