// app/api/debug/tasks/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug/tasks
 * Debug endpoint to check tasks and user ID matching
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const currentUserId = session.user.id;

    // Get all tasks from database (without userId filter)
    const allTasks = await prisma.task.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to recent 20 tasks
    });

    // Get tasks for the current user
    const userTasks = await prisma.task.findMany({
      where: {
        userId: currentUserId,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // Check if there are tasks with different userIds
    const userIdMismatch = allTasks.some(task => task.userId !== currentUserId);

    return NextResponse.json({
      currentUser: {
        id: currentUserId,
        email: session.user.email,
        name: session.user.name,
      },
      stats: {
        totalTasksInDatabase: allTasks.length,
        tasksForCurrentUser: userTasks.length,
        userIdMismatch,
      },
      allUsers,
      recentTasksInDatabase: allTasks.map(task => ({
        id: task.id,
        title: task.title,
        userId: task.userId,
        matchesCurrentUser: task.userId === currentUserId,
        status: task.status,
        createdAt: task.createdAt,
      })),
      userTasks: userTasks.map(task => ({
        id: task.id,
        title: task.title,
        userId: task.userId,
        status: task.status,
        createdAt: task.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Debug tasks error:', error);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
