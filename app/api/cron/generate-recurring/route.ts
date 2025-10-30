import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status, RecurringPattern } from '@prisma/client';
import { calculateNextRecurringDate } from '@/lib/utils';

/**
 * Cron job to generate recurring task instances
 * This runs periodically to create next instances of completed recurring tasks
 *
 * Vercel cron configuration in vercel.json:
 * "crons": [{ "path": "/api/cron/generate-recurring", "schedule": "0 * * * *" }]
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[CRON] Starting recurring task generation...');

    // Find all completed recurring tasks
    const completedRecurringTasks = await prisma.task.findMany({
      where: {
        status: Status.COMPLETED,
        isRecurring: true,
        recurringPattern: {
          not: null,
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    console.log(`[CRON] Found ${completedRecurringTasks.length} completed recurring tasks`);

    const generatedTasks = [];
    const skippedTasks = [];
    const errors = [];

    for (const task of completedRecurringTasks) {
      try {
        // Calculate what the next due date should be
        const nextDueDate = calculateNextRecurringDate(
          task.dueDate,
          task.recurringPattern as RecurringPattern
        );

        // Check if a pending instance already exists for this recurring task
        // We identify related recurring tasks by matching: userId, title, isRecurring, recurringPattern
        const existingPendingTask = await prisma.task.findFirst({
          where: {
            userId: task.userId,
            title: task.title,
            isRecurring: true,
            recurringPattern: task.recurringPattern,
            status: Status.PENDING,
            dueDate: {
              gte: nextDueDate, // Due date is equal to or after the calculated next date
            },
          },
        });

        if (existingPendingTask) {
          skippedTasks.push({
            taskId: task.id,
            title: task.title,
            reason: 'Pending instance already exists',
            existingTaskId: existingPendingTask.id,
          });
          continue;
        }

        // Check if we should generate the task
        // Only generate if the next due date is in the past or today
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const nextDueDateOnly = new Date(
          nextDueDate.getFullYear(),
          nextDueDate.getMonth(),
          nextDueDate.getDate()
        );

        if (nextDueDateOnly > today) {
          skippedTasks.push({
            taskId: task.id,
            title: task.title,
            reason: 'Next due date is in the future',
            nextDueDate: nextDueDateOnly.toISOString(),
          });
          continue;
        }

        // Generate the next recurring task instance
        const newTask = await prisma.task.create({
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
        });

        generatedTasks.push({
          originalTaskId: task.id,
          newTaskId: newTask.id,
          title: newTask.title,
          dueDate: newTask.dueDate,
          pattern: task.recurringPattern,
        });

        console.log(
          `[CRON] Generated recurring task: ${newTask.id} (${newTask.title}) - Pattern: ${task.recurringPattern}`
        );
      } catch (error: any) {
        console.error(`[CRON] Failed to generate task for ${task.id}:`, error);
        errors.push({
          taskId: task.id,
          title: task.title,
          error: error.message,
        });
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      totalCompleted: completedRecurringTasks.length,
      generated: generatedTasks.length,
      skipped: skippedTasks.length,
      errors: errors.length,
    };

    console.log('[CRON] Recurring task generation completed:', summary);

    return NextResponse.json({
      success: true,
      summary,
      generatedTasks,
      skippedTasks: skippedTasks.slice(0, 10), // Limit details in response
      errors,
    });
  } catch (error: any) {
    console.error('[CRON] Fatal error in recurring task generation:', error);
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
