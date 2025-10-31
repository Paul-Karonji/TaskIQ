// API Route: Export user data (GDPR compliance)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        tasks: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
        categories: true,
        tags: true,
        notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format data for export
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tasks: user.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        priority: task.priority,
        status: task.status,
        isRecurring: task.isRecurring,
        recurringPattern: task.recurringPattern,
        estimatedTime: task.estimatedTime,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        category: task.category
          ? {
              name: task.category.name,
              color: task.category.color,
            }
          : null,
        tags: task.tags.map((t) => ({
          name: t.tag.name,
          color: t.tag.color,
        })),
      })),
      categories: user.categories.map((category) => ({
        id: category.id,
        name: category.name,
        color: category.color,
        createdAt: category.createdAt,
      })),
      tags: user.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt,
      })),
      notificationPreferences: user.notifications
        ? {
            dailyEmailEnabled: user.notifications.dailyEmailEnabled,
            dailyEmailTime: user.notifications.dailyEmailTime,
            weeklyEmailEnabled: user.notifications.weeklyEmailEnabled,
            weeklyEmailDay: user.notifications.weeklyEmailDay,
            weeklyEmailTime: user.notifications.weeklyEmailTime,
            pushNotificationsEnabled: user.notifications.pushNotificationsEnabled,
            reminderMinutesBefore: user.notifications.reminderMinutesBefore,
          }
        : null,
      statistics: {
        totalTasks: user.tasks.length,
        completedTasks: user.tasks.filter((t) => t.status === 'COMPLETED').length,
        pendingTasks: user.tasks.filter((t) => t.status === 'PENDING').length,
        archivedTasks: user.tasks.filter((t) => t.status === 'ARCHIVED').length,
        totalCategories: user.categories.length,
        totalTags: user.tags.length,
      },
    };

    console.log(`[Data Export] User ${user.id} exported their data`);

    return NextResponse.json(exportData);
  } catch (error: any) {
    console.error('[Data Export] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export data' },
      { status: 500 }
    );
  }
}
