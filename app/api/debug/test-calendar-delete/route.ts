// app/api/debug/test-calendar-delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCalendarClient, ensureValidToken } from '@/lib/google-calendar';

/**
 * GET /api/debug/test-calendar-delete?taskId=xxx
 *
 * Diagnostic endpoint to test calendar event deletion
 * This helps identify why events aren't being deleted from Google Calendar
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Get taskId from query params
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId query parameter' },
        { status: 400 }
      );
    }

    // Fetch the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or does not belong to you' },
        { status: 404 }
      );
    }

    if (!task.googleEventId) {
      return NextResponse.json(
        { error: 'Task is not synced with Google Calendar' },
        { status: 400 }
      );
    }

    const diagnostics: any = {
      taskId: task.id,
      taskTitle: task.title,
      googleEventId: task.googleEventId,
      userId: userId,
      steps: [],
    };

    // Step 1: Check token validity
    diagnostics.steps.push({ step: 1, action: 'Checking token validity...' });
    const tokenValid = await ensureValidToken(userId);
    diagnostics.steps.push({
      step: 1,
      result: tokenValid ? 'Token is valid' : 'Token is invalid or expired',
      tokenValid,
    });

    if (!tokenValid) {
      return NextResponse.json({
        success: false,
        message: 'Token is invalid. Please sign out and sign back in.',
        diagnostics,
      });
    }

    // Step 2: Get calendar client
    diagnostics.steps.push({ step: 2, action: 'Getting calendar client...' });
    const { calendar } = await getCalendarClient(userId);
    diagnostics.steps.push({ step: 2, result: 'Calendar client obtained' });

    // Step 3: Try to retrieve the event first
    diagnostics.steps.push({ step: 3, action: 'Checking if event exists in Google Calendar...' });
    try {
      const eventCheck = await calendar.events.get({
        calendarId: 'primary',
        eventId: task.googleEventId,
      });

      diagnostics.steps.push({
        step: 3,
        result: 'Event found in Google Calendar',
        eventDetails: {
          id: eventCheck.data.id,
          summary: eventCheck.data.summary,
          status: eventCheck.data.status,
          created: eventCheck.data.created,
          updated: eventCheck.data.updated,
        },
      });
    } catch (getError: any) {
      const errorCode = getError.code || getError.response?.status || getError.status;
      diagnostics.steps.push({
        step: 3,
        result: 'Event NOT found in Google Calendar',
        error: {
          code: errorCode,
          message: getError.message,
          details: getError.response?.data,
        },
      });

      if (errorCode === 404) {
        return NextResponse.json({
          success: false,
          message: 'Event does not exist in Google Calendar (already deleted or never created)',
          diagnostics,
          recommendation: 'The task database still has googleEventId. Clear it manually.',
        });
      }

      // Other errors
      return NextResponse.json({
        success: false,
        message: 'Failed to check if event exists',
        diagnostics,
        error: getError.message,
      });
    }

    // Step 4: Try to delete the event
    diagnostics.steps.push({ step: 4, action: 'Attempting to delete event...' });
    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: task.googleEventId,
      });

      diagnostics.steps.push({
        step: 4,
        result: 'Event successfully deleted from Google Calendar',
      });

      // Step 5: Remove googleEventId from database
      diagnostics.steps.push({ step: 5, action: 'Clearing googleEventId from database...' });
      await prisma.task.update({
        where: { id: taskId },
        data: { googleEventId: null },
      });
      diagnostics.steps.push({ step: 5, result: 'Database updated successfully' });

      return NextResponse.json({
        success: true,
        message: 'Event successfully deleted from Google Calendar and database updated',
        diagnostics,
      });
    } catch (deleteError: any) {
      const errorCode = deleteError.code || deleteError.response?.status || deleteError.status;
      diagnostics.steps.push({
        step: 4,
        result: 'Failed to delete event',
        error: {
          code: errorCode,
          message: deleteError.message,
          statusText: deleteError.statusText,
          errors: deleteError.errors,
          response: deleteError.response?.data,
        },
      });

      return NextResponse.json({
        success: false,
        message: 'Failed to delete event from Google Calendar',
        diagnostics,
        error: deleteError.message,
      });
    }
  } catch (error: any) {
    console.error('Test calendar delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Diagnostic test failed',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
