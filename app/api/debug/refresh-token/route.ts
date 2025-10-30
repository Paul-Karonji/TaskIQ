// app/api/debug/refresh-token/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

/**
 * GET /api/debug/refresh-token
 * Test endpoint to manually refresh token and see the error
 */
export async function GET() {
  try {
    const session = await requireAuth();

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'No Google account found',
      });
    }

    if (!account.refresh_token) {
      return NextResponse.json({
        success: false,
        error: 'No refresh token found',
        hint: 'You need to revoke access and sign in again',
      });
    }

    // Try to refresh the token
    console.log('=== MANUAL TOKEN REFRESH TEST ===');
    console.log('User ID:', session.user.id);
    console.log('Account ID:', account.id);
    console.log('Has refresh token:', Boolean(account.refresh_token));
    console.log('Refresh token length:', account.refresh_token.length);
    console.log('Current expires_at:', account.expires_at, new Date(account.expires_at! * 1000).toISOString());

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    });

    console.log('Attempting to refresh access token...');

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();

      console.log('✅ Token refreshed successfully!');
      console.log('New access token length:', credentials.access_token?.length);
      console.log('New expiry:', credentials.expiry_date, new Date(credentials.expiry_date || 0).toISOString());

      // Update in database
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully!',
        oldExpiry: new Date(account.expires_at! * 1000).toISOString(),
        newExpiry: new Date(credentials.expiry_date || 0).toISOString(),
      });
    } catch (refreshError: any) {
      console.error('❌ Token refresh failed:', refreshError);
      console.error('Error details:', {
        message: refreshError.message,
        code: refreshError.code,
        status: refreshError.status,
        errors: refreshError.errors,
        response: refreshError.response?.data,
      });

      return NextResponse.json({
        success: false,
        error: 'Token refresh failed',
        details: refreshError.message,
        code: refreshError.code,
        status: refreshError.status,
        errorData: refreshError.response?.data,
        hint: refreshError.message?.includes('invalid_grant')
          ? 'Your refresh token is invalid. Go to https://myaccount.google.com/connections and remove TaskIQ, then sign in again.'
          : 'Check server console for detailed error',
      });
    }
  } catch (error: any) {
    console.error('Outer error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
