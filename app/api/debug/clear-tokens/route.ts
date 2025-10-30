// app/api/debug/clear-tokens/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug/clear-tokens
 * Clear all authentication data to force fresh re-authentication
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Delete all sessions for this user
    const sessionsDeleted = await prisma.session.deleteMany({
      where: { userId },
    });

    // Delete all accounts for this user
    const accountsDeleted = await prisma.account.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: 'All authentication data cleared',
      sessionsDeleted: sessionsDeleted.count,
      accountsDeleted: accountsDeleted.count,
      nextSteps: [
        '1. Close this browser tab',
        '2. Clear your browser cookies for localhost:3000',
        '3. Open a new tab and go to http://localhost:3000',
        '4. Sign in with Google (grant all permissions)',
        '5. Try calendar sync again'
      ],
    });
  } catch (error: any) {
    console.error('Failed to clear tokens:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
