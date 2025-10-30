import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { WeekDay } from '@prisma/client';
import { sendTestEmail } from '@/lib/email';

/**
 * GET /api/notifications/preferences
 * Fetch user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Find or create notification preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: session.user.id,
          dailyEmailEnabled: true,
          dailyEmailTime: '08:00',
          weeklyEmailEnabled: true,
          weeklyEmailDay: WeekDay.MONDAY,
          weeklyEmailTime: '09:00',
          pushNotificationsEnabled: false,
          reminderMinutesBefore: [15, 60],
        },
      });
    }

    return NextResponse.json({ preferences });
  } catch (error: any) {
    console.error('Failed to fetch notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate inputs
    const allowedFields = [
      'dailyEmailEnabled',
      'dailyEmailTime',
      'weeklyEmailEnabled',
      'weeklyEmailDay',
      'weeklyEmailTime',
      'pushNotificationsEnabled',
      'reminderMinutesBefore',
    ];

    const updates: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Validate email time format (HH:MM)
    if (updates.dailyEmailTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(updates.dailyEmailTime)) {
      return NextResponse.json(
        { error: 'Invalid dailyEmailTime format. Use HH:MM (e.g., 08:00)' },
        { status: 400 }
      );
    }

    if (updates.weeklyEmailTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(updates.weeklyEmailTime)) {
      return NextResponse.json(
        { error: 'Invalid weeklyEmailTime format. Use HH:MM (e.g., 09:00)' },
        { status: 400 }
      );
    }

    // Validate weeklyEmailDay
    if (
      updates.weeklyEmailDay &&
      !Object.values(WeekDay).includes(updates.weeklyEmailDay as WeekDay)
    ) {
      return NextResponse.json({ error: 'Invalid weeklyEmailDay' }, { status: 400 });
    }

    // Update or create preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      update: updates,
      create: {
        userId: session.user.id,
        dailyEmailEnabled: updates.dailyEmailEnabled ?? true,
        dailyEmailTime: updates.dailyEmailTime ?? '08:00',
        weeklyEmailEnabled: updates.weeklyEmailEnabled ?? true,
        weeklyEmailDay: updates.weeklyEmailDay ?? WeekDay.MONDAY,
        weeklyEmailTime: updates.weeklyEmailTime ?? '09:00',
        pushNotificationsEnabled: updates.pushNotificationsEnabled ?? false,
        reminderMinutesBefore: updates.reminderMinutesBefore ?? [15, 60],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error: any) {
    console.error('Failed to update notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/preferences/test
 * Send a test email to verify configuration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    await sendTestEmail(user.email, user.name || undefined);

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${user.email}`,
    });
  } catch (error: any) {
    console.error('Failed to send test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error.message },
      { status: 500 }
    );
  }
}
