// API route for today's tasks - GET

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/tasks/today - Fetch today's tasks for Focus Mode
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Get today's date range
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Fetch today's pending tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'PENDING',
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' }, // High priority first
        { dueTime: 'asc' }, // Earliest time first
        { createdAt: 'asc' }, // Oldest first
      ],
    });

    const total = tasks.length;

    // Calculate stats
    const completed = await prisma.task.count({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const highPriority = tasks.filter((task) => task.priority === 'HIGH').length;
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);

    return NextResponse.json({
      success: true,
      tasks,
      total,
      stats: {
        pending: total,
        completed,
        highPriority,
        totalEstimatedTime,
      },
    });
  } catch (error: any) {
    console.error('GET /api/tasks/today error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch today\'s tasks' },
      { status: 500 }
    );
  }
}
