import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GDPR Compliance: Account Deletion Endpoint
 * Allows users to permanently delete their account and all associated data
 *
 * DELETE /api/user/delete
 */
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    console.log(`[Account Deletion] Starting deletion for user ${userId}`)

    // Delete all user data in the correct order (respecting foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // 1. Delete task tags (junction table)
      await tx.taskTag.deleteMany({
        where: {
          task: {
            userId,
          },
        },
      })

      // 2. Delete tasks
      await tx.task.deleteMany({
        where: { userId },
      })

      // 3. Delete categories
      await tx.category.deleteMany({
        where: { userId },
      })

      // 4. Delete tags
      await tx.tag.deleteMany({
        where: { userId },
      })

      // 5. Delete notification preferences
      await tx.notificationPreference.deleteMany({
        where: { userId },
      })

      // 6. Delete sessions
      await tx.session.deleteMany({
        where: { userId },
      })

      // 7. Delete accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId },
      })

      // 8. Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      })
    })

    console.log(`[Account Deletion] Successfully deleted user ${userId}`)

    return NextResponse.json({
      message: 'Account and all associated data have been permanently deleted',
      deletedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Account Deletion] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete account',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
