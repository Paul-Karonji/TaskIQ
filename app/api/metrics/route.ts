import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * Metrics Endpoint
 * Returns application metrics (requires authentication)
 *
 * GET /api/metrics
 */
export async function GET() {
  try {
    const session = await auth()

    // Only admin/authenticated users can view metrics
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Collect metrics
    const [
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      archivedTasks,
      recurringTasks,
      syncedTasks,
      totalCategories,
      totalTags,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.task.count({ where: { status: 'PENDING' } }),
      prisma.task.count({ where: { status: 'ARCHIVED' } }),
      prisma.task.count({ where: { isRecurring: true } }),
      prisma.task.count({ where: { googleEventId: { not: null } } }),
      prisma.category.count(),
      prisma.tag.count(),
    ])

    // Recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [recentTasks, recentCompletions] = await Promise.all([
      prisma.task.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.task.count({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: yesterday },
        },
      }),
    ])

    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round(
          (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
        ),
      },
      nodeVersion: process.version,
      platform: process.platform,
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      application: {
        totalUsers,
        totalTasks,
        tasksByStatus: {
          completed: completedTasks,
          pending: pendingTasks,
          archived: archivedTasks,
        },
        recurringTasks,
        syncedToCalendar: syncedTasks,
        totalCategories,
        totalTags,
      },
      recentActivity: {
        period: '24h',
        tasksCreated: recentTasks,
        tasksCompleted: recentCompletions,
      },
      system: systemMetrics,
    })
  } catch (error: any) {
    console.error('[Metrics] Error:', error)
    return NextResponse.json(
      { error: 'Failed to collect metrics', details: error.message },
      { status: 500 }
    )
  }
}
