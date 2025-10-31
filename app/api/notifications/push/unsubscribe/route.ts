// API route for push notification unsubscription

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// DELETE /api/notifications/push/unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Find notification preference
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      return NextResponse.json(
        { success: false, error: 'No notification preferences found' },
        { status: 404 }
      );
    }

    // Update preference to disable push and clear subscription
    await prisma.notificationPreference.update({
      where: { userId },
      data: {
        pushNotificationsEnabled: false,
        pushSubscription: null,
      },
    });

    console.log('[Push Unsubscribe] User unsubscribed from push notifications:', userId);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications',
    });
  } catch (error: any) {
    console.error('[Push Unsubscribe] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to unsubscribe from push notifications' },
      { status: 500 }
    );
  }
}
