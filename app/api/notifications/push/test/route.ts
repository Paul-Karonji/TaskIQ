// API route for testing push notifications

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:taskiq@example.com';

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

// POST /api/notifications/push/test
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const body = await request.json().catch(() => ({}));
    const customMessage = body.message || 'This is a test push notification from TaskIQ!';

    // Get user's push subscription
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference || !preference.pushSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'No push subscription found. Please subscribe to push notifications first.',
        },
        { status: 404 }
      );
    }

    if (!preference.pushNotificationsEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Push notifications are disabled. Please enable them first.',
        },
        { status: 400 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title: 'TaskIQ Test Notification 🔔',
      body: customMessage,
      taskId: 'test-task-123',
      priority: 'HIGH',
      url: '/',
      requireInteraction: false,
    });

    // Send push notification
    try {
      const pushSubscription = preference.pushSubscription as any;

      await webpush.sendNotification(pushSubscription, payload);

      console.log('[Push Test] Test notification sent successfully to user:', userId);

      return NextResponse.json({
        success: true,
        message: 'Test push notification sent successfully!',
        details: {
          endpoint: pushSubscription.endpoint?.substring(0, 50) + '...',
          payload: JSON.parse(payload),
        },
      });
    } catch (pushError: any) {
      console.error('[Push Test] Error sending push notification:', pushError);

      // Handle specific error codes
      if (pushError.statusCode === 410) {
        // Subscription has expired, remove it
        await prisma.notificationPreference.update({
          where: { userId },
          data: {
            pushSubscription: null,
            pushNotificationsEnabled: false,
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Push subscription has expired. Please re-subscribe to push notifications.',
            details: 'Subscription removed from database.',
          },
          { status: 410 }
        );
      }

      if (pushError.statusCode === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Push subscription not found. Please re-subscribe.',
            details: pushError.body,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send push notification',
          details: pushError.message || 'Unknown error',
          statusCode: pushError.statusCode,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Push Test] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test push notification',
      },
      { status: 500 }
    );
  }
}
