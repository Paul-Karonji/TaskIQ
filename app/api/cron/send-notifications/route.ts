import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDailyTaskEmail, sendWeeklyTaskEmail } from '@/lib/email';
import { WeekDay } from '@prisma/client';

/**
 * Cron job to send email notifications
 * Runs hourly to check and send daily/weekly task summaries
 *
 * Vercel cron configuration in vercel.json:
 * "crons": [{ "path": "/api/cron/send-notifications", "schedule": "0 * * * *" }]
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[CRON] Starting email notification check...');

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute
      .toString()
      .padStart(2, '0')}`;

    // Get current day of week (convert to our WeekDay enum)
    const daysOfWeek: WeekDay[] = [
      WeekDay.SUNDAY,
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
      WeekDay.SATURDAY,
    ];
    const currentDay = daysOfWeek[now.getDay()];

    // Stats
    const results = {
      dailyEmailsSent: 0,
      dailyEmailsSkipped: 0,
      weeklyEmailsSent: 0,
      weeklyEmailsSkipped: 0,
      errors: [] as Array<{ userId: string; type: string; error: string }>,
    };

    // Find all users with notification preferences enabled
    const preferences = await prisma.notificationPreference.findMany({
      where: {
        OR: [{ dailyEmailEnabled: true }, { weeklyEmailEnabled: true }],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    console.log(`[CRON] Found ${preferences.length} users with notifications enabled`);

    for (const pref of preferences) {
      try {
        // Check if it's time for daily email
        if (pref.dailyEmailEnabled) {
          // Match the hour for daily emails (we run hourly, so check if current hour matches)
          const [prefHour] = pref.dailyEmailTime.split(':');
          if (parseInt(prefHour) === currentHour) {
            try {
              const result = await sendDailyTaskEmail(pref.userId);
              if (result.success) {
                results.dailyEmailsSent++;
                console.log(
                  `[CRON] ✅ Daily email sent to ${pref.user.email} (${result.taskCount} tasks)`
                );
              } else {
                results.dailyEmailsSkipped++;
                console.log(
                  `[CRON] ⏭️ Daily email skipped for ${pref.user.email} (${result.reason})`
                );
              }
            } catch (error: any) {
              results.errors.push({
                userId: pref.userId,
                type: 'daily',
                error: error.message,
              });
              console.error(`[CRON] ❌ Failed to send daily email to ${pref.user.email}:`, error);
            }
          }
        }

        // Check if it's time for weekly email
        if (pref.weeklyEmailEnabled) {
          // Match the day and hour for weekly emails
          const [prefHour] = pref.weeklyEmailTime.split(':');
          if (pref.weeklyEmailDay === currentDay && parseInt(prefHour) === currentHour) {
            try {
              const result = await sendWeeklyTaskEmail(pref.userId);
              if (result.success) {
                results.weeklyEmailsSent++;
                console.log(`[CRON] ✅ Weekly email sent to ${pref.user.email}`);
              } else {
                results.weeklyEmailsSkipped++;
                console.log(
                  `[CRON] ⏭️ Weekly email skipped for ${pref.user.email} (${result.reason})`
                );
              }
            } catch (error: any) {
              results.errors.push({
                userId: pref.userId,
                type: 'weekly',
                error: error.message,
              });
              console.error(`[CRON] ❌ Failed to send weekly email to ${pref.user.email}:`, error);
            }
          }
        }
      } catch (error: any) {
        console.error(`[CRON] ❌ Error processing user ${pref.userId}:`, error);
        results.errors.push({
          userId: pref.userId,
          type: 'processing',
          error: error.message,
        });
      }
    }

    const summary = {
      timestamp: now.toISOString(),
      currentTime,
      currentDay,
      totalUsers: preferences.length,
      dailyEmailsSent: results.dailyEmailsSent,
      dailyEmailsSkipped: results.dailyEmailsSkipped,
      weeklyEmailsSent: results.weeklyEmailsSent,
      weeklyEmailsSkipped: results.weeklyEmailsSkipped,
      errors: results.errors.length,
    };

    console.log('[CRON] Email notification check completed:', summary);

    return NextResponse.json({
      success: true,
      summary,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error: any) {
    console.error('[CRON] Fatal error in email notification cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
