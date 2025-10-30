// app/api/tasks/[id]/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  syncTaskWithCalendar,
  unsyncTaskFromCalendar,
} from '@/lib/google-calendar';

/**
 * POST /api/tasks/[id]/calendar
 * Sync a task with Google Calendar
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Fetch the task
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Sync with Google Calendar
    const event = await syncTaskWithCalendar(session.user.id, {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      estimatedTime: task.estimatedTime,
      googleEventId: task.googleEventId,
    });

    // Fetch updated task
    const updatedTask = await prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Task synced with Google Calendar',
      task: updatedTask,
      event,
    });
  } catch (error: any) {
    console.error('Calendar sync error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
      response: error.response?.data,
    });

    // Handle specific error cases
    if (error.message === 'No Google account connected') {
      return NextResponse.json(
        { error: 'Please connect your Google account first' },
        { status: 400 }
      );
    }

    if (error.message?.includes('Failed to refresh access token')) {
      return NextResponse.json(
        {
          error: 'Your Google Calendar access has expired',
          details: 'Please sign out and sign back in to reconnect your Google account'
        },
        { status: 401 }
      );
    }

    if (error.code === 401 || error.status === 401) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          details: 'Please sign out and sign back in to reconnect your Google account'
        },
        { status: 401 }
      );
    }

    if (error.code === 403 || error.status === 403) {
      return NextResponse.json(
        {
          error: 'Permission denied',
          details: 'Please make sure you granted Calendar access when signing in'
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to sync with Google Calendar',
        details: error.message || 'An unexpected error occurred',
        code: error.code,
        hint: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]/calendar
 * Remove task sync from Google Calendar
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Fetch the task
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (!task.googleEventId) {
      return NextResponse.json(
        { error: 'Task is not synced with Google Calendar' },
        { status: 400 }
      );
    }

    // Unsync from Google Calendar
    await unsyncTaskFromCalendar(
      session.user.id,
      task.googleEventId,
      task.id
    );

    // Fetch updated task
    const updatedTask = await prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Task unsynced from Google Calendar',
      task: updatedTask,
    });
  } catch (error: any) {
    console.error('Calendar unsync error:', error);
    return NextResponse.json(
      { error: 'Failed to unsync from Google Calendar', details: error.message },
      { status: 500 }
    );
  }
}
