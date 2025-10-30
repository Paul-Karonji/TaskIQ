// app/api/debug/auth/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug/auth
 * Debug endpoint to check authentication status
 */
export async function GET() {
  try {
    const session = await requireAuth();

    // Fetch user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        access_token: true,
        refresh_token: true,
        expires_at: true,
        scope: true,
        token_type: true,
      },
    });

    if (!account) {
      return NextResponse.json({
        authenticated: false,
        message: 'No Google account connected',
        userId: session.user.id,
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = account.expires_at ? account.expires_at < now : true;
    const hasCalendarScope = account.scope?.includes('calendar') || false;

    return NextResponse.json({
      authenticated: true,
      userId: session.user.id,
      account: {
        id: account.id,
        provider: account.provider,
        hasAccessToken: Boolean(account.access_token),
        accessTokenLength: account.access_token?.length || 0,
        hasRefreshToken: Boolean(account.refresh_token),
        refreshTokenLength: account.refresh_token?.length || 0,
        tokenType: account.token_type,
        expiresAt: account.expires_at,
        isExpired,
        timeUntilExpiry: account.expires_at ? account.expires_at - now : null,
        scope: account.scope,
        hasCalendarScope,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        authenticated: false,
      },
      { status: 500 }
    );
  }
}
