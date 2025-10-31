// API Route: Cron job for sending push notification reminders
// This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
// Recommended schedule: Every 15 minutes

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sendTaskReminderPush,
  sendOverdueTaskPush,
  sendTaskDueTodayPush,
} from '@/lib/push-sender';
import { Status } from '@prisma/client';

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

    let remindersSent = 0;
    let overdueSent = 0;
    let dueTodaySent = 0;
    let errors = 0;

    // Process each user
    for (const pref of preferences) {
      const { user, reminderMinutesBefore } = pref;

      for (const task of user.tasks) {
        const taskDueTime = task.dueTime
          ? new Date(`${task.dueDate.toISOString().split('T')[0]}T${task.dueTime}:00`)
          : new Date(task.dueDate);
        taskDueTime.setSeconds(0, 0);

        const timeDiffMs = taskDueTime.getTime() - now.getTime();
        const timeDiffMinutes = Math.floor(timeDiffMs / 60000);

        try {
          // Check if task is overdue
          if (timeDiffMs < 0) {
            // Only send overdue notification once per day (at 9 AM)
            const currentHour = now.getHours();
            if (currentHour === 9) {
              const sent = await sendOverdueTaskPush(user.id, task);
              if (sent) overdueSent++;
            }
            continue;
          }

          // Check if task is due today (send morning reminder at 8 AM)
          const isToday =
            task.dueDate >= todayStart && task.dueDate <= todayEnd;
          if (isToday && now.getHours() === 8) {
            const sent = await sendTaskDueTodayPush(user.id, task);
            if (sent) dueTodaySent++;
            continue;
          }

          // Check if we should send a reminder based on user preferences
          for (const minutesBefore of reminderMinutesBefore) {
            // Check if current time matches reminder time (with 15-minute window)
            const shouldRemind =
              timeDiffMinutes <= minutesBefore &&
              timeDiffMinutes > minutesBefore - 15;

            if (shouldRemind) {
              const sent = await sendTaskReminderPush(user.id, task);
              if (sent) {
                remindersSent++;
                console.log(
                  `[Cron] Reminder sent: ${task.title} (${minutesBefore} min before)`
                );
              }
              break; // Only send one reminder per task per run
            }
          }
        } catch (error) {
          console.error(`[Cron] Error processing task ${task.id}:`, error);
          errors++;
        }
      }
    }

    console.log(
      `[Cron] Push reminders sent: ${remindersSent} reminders, ${overdueSent} overdue, ${dueTodaySent} due today`
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      stats: {
        usersProcessed: preferences.length,
        remindersSent,
        overdueSent,
        dueTodaySent,
        errors,
        totalSent: remindersSent + overdueSent + dueTodaySent,
      },
    });
  } catch (error: any) {
    console.error('[Cron] Push reminders error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process push reminders',
      },
      { status: 500 }
    );
  }
}

// Support POST as well (some cron services use POST)
export async function POST(request: NextRequest) {
  return GET(request);
}
