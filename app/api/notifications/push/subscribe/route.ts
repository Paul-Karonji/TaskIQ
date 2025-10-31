// API route for push notification subscription

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { pushSubscriptionSchema } from '@/lib/validations/push';

// POST /api/notifications/push/subscribe
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const body = await request.json();

    // Validate push subscription
    const validatedData = pushSubscriptionSchema.parse(body);

    // Find or create notification preference
    let preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      // Create new preference
      preference = await prisma.notificationPreference.create({
        data: {
          userId,
          pushNotificationsEnabled: true,
          pushSubscription: validatedData,
          dailyEmailEnabled: true,
          dailyEmailTime: '08:00',
          weeklyEmailEnabled: true,
          weeklyEmailDay: 'MONDAY',
          weeklyEmailTime: '09:00',
        },
      });
    } else {
      // Update existing preference
      preference = await prisma.notificationPreference.update({
        where: { userId },
        data: {
          pushNotificationsEnabled: true,
          pushSubscription: validatedData,
        },
      });
    }

    console.log('[Push Subscribe] User subscribed to push notifications:', userId);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
      subscription: preference.pushSubscription,
    });
  } catch (error: any) {
    console.error('[Push Subscribe] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to subscribe to push notifications' },
      { status: 500 }
    );
  }
}
