// API route for individual tasks - PATCH (update) & DELETE

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { updateTaskSchema, taskIdSchema } from '@/lib/validations/task';
import { calculateNextRecurringDate } from '@/lib/utils';
import { Status } from '@prisma/client';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar';

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { id } = await params;

    // Validate task ID
    taskIdSchema.parse({ id });

    const body = await request.json();

    // Validate request body
    const validatedData = updateTaskSchema.parse(body);

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (existingTask.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Extract tagIds from the validated data
    const { tagIds, ...taskData } = validatedData;

    // Prepare update data
    const updateData: any = {
      ...taskData,
    };

    // Convert date if provided
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }

    if (validatedData.completedAt) {
      updateData.completedAt = new Date(validatedData.completedAt);
    }

    // Handle tags update if provided
    if (tagIds !== undefined) {
      // Delete existing tags and create new ones
      updateData.tags = {
        deleteMany: {},
        create: tagIds.map((tagId) => ({
          tag: {
            connect: { id: tagId },
          },
        })),
      };
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Attempt to automatically update Google Calendar event (async, non-blocking)
    if (task.googleEventId) {
      // If task is completed, delete the calendar event
      if (task.status === Status.COMPLETED) {
        const eventIdToDelete = task.googleEventId;
        console.log('Task completed, deleting calendar event:', eventIdToDelete);

        // Remove googleEventId from task immediately (fast database operation)
        await prisma.task.update({
          where: { id },
          data: { googleEventId: null },
        });

        // Delete from Google Calendar asynchronously (fire-and-forget)
        deleteCalendarEvent(userId, eventIdToDelete)
          .then(() => {
            console.log('Calendar event deleted successfully:', eventIdToDelete);
          })
          .catch((calendarError: any) => {
            console.error('Failed to delete calendar event:', {
              taskId: task.id,
              eventId: eventIdToDelete,
              error: calendarError.message,
            });
          });
      } else {
        // Task still pending, update the calendar event (fire-and-forget)
        console.log('Auto-updating calendar event for task:', task.id);
        updateCalendarEvent(userId, task.googleEventId, task)
          .then(() => {
            console.log('Calendar event updated successfully:', task.id);
          })
          .catch((calendarError: any) => {
            console.error('Failed to auto-update calendar event:', {
              taskId: task.id,
              eventId: task.googleEventId,
              error: calendarError.message,
            });
          });
      }
    }

    // Generate next recurring instance if task was just completed
    let nextTask = null;
    if (
      task.status === Status.COMPLETED &&
      task.isRecurring &&
      task.recurringPattern
    ) {
      try {
        // Calculate next due date
        const nextDueDate = calculateNextRecurringDate(task.dueDate, task.recurringPattern);

        // Create the next recurring task instance
        nextTask = await prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            dueDate: nextDueDate,
            dueTime: task.dueTime,
            priority: task.priority,
            categoryId: task.categoryId,
            estimatedTime: task.estimatedTime,
            isRecurring: true,
            recurringPattern: task.recurringPattern,
            userId: task.userId,
            status: Status.PENDING,
            // Note: Tags are NOT copied per user preference
          },
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });

        console.log(`Generated next recurring task: ${nextTask.id} for pattern: ${task.recurringPattern}`);
      } catch (recurringError) {
        console.error('Failed to generate recurring task:', recurringError);
        // Don't fail the main update if recurring generation fails
      }
    }

    return NextResponse.json({
      success: true,
      task,
      nextTask, // Include the generated next task if any
      message: 'Task updated successfully',
    });
  } catch (error: any) {
    console.error('PATCH /api/tasks/[id] error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { id } = await params;

    // Validate task ID
    taskIdSchema.parse({ id });

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (existingTask.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Delete task first (cascade will handle related records)
    await prisma.task.delete({
      where: { id },
    });

    // Attempt to delete from Google Calendar if synced (async, fire-and-forget)
    if (existingTask.googleEventId) {
      console.log('Deleting calendar event for task:', existingTask.id);
      deleteCalendarEvent(userId, existingTask.googleEventId)
        .then(() => {
          console.log('Calendar event deleted successfully:', existingTask.googleEventId);
        })
        .catch((calendarError: any) => {
          // Log error - task is already deleted
          console.error('Failed to delete calendar event:', {
            taskId: existingTask.id,
            eventId: existingTask.googleEventId,
            error: calendarError.message,
          });
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/tasks/[id] error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}

// GET /api/tasks/[id] - Get a single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { id } = await params;

    // Validate task ID
    taskIdSchema.parse({ id });

    // Fetch task
    const task = await prisma.task.findUnique({
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

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    console.error('GET /api/tasks/[id] error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch task' },
      { status: 500 }
    );
  }
}
