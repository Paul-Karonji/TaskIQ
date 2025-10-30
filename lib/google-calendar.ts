// lib/google-calendar.ts
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

const CALENDAR_API_VERSION = 'v3';

interface TokenData {
  access_token: string;
  refresh_token: string | null;
  expires_at: number | null;
}

/**
 * Get OAuth2 client with user's tokens
 */
export async function getCalendarClient(userId: string) {
  // Fetch user's Google account
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google',
    },
  });

  if (!account || !account.access_token) {
    throw new Error('No Google account connected');
  }

  // Initialize OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Set credentials
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  });

  // Handle token refresh
  oauth2Client.on('tokens', async (tokens) => {
    console.log('Token refreshed for user:', userId);

    // Update tokens in database
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: tokens.access_token,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
        // Only update refresh token if a new one is provided
        ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
      },
    });
  });

  // Return calendar API client
  const calendar = google.calendar({ version: CALENDAR_API_VERSION, auth: oauth2Client });

  return { calendar, oauth2Client };
}

/**
 * Check if token needs refresh and refresh if necessary
 */
export async function ensureValidToken(userId: string): Promise<boolean> {
  console.log('Checking token validity for user:', userId);

  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  });

  if (!account || !account.refresh_token) {
    console.error('No account or refresh token found');
    return false;
  }

  // Check if token is expired or will expire in the next 5 minutes
  const expiresAt = account.expires_at ? account.expires_at * 1000 : 0;
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  console.log('Token expiry check:', {
    expiresAt: new Date(expiresAt).toISOString(),
    now: new Date(now).toISOString(),
    isExpired: expiresAt <= now,
    timeUntilExpiry: expiresAt - now,
  });

  if (expiresAt > now + fiveMinutes) {
    console.log('Token is still valid, no refresh needed');
    return true; // Token is still valid
  }

  // Refresh the token
  console.log('Token expired or expiring soon, refreshing...');
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    });

    console.log('Calling Google API to refresh token...');
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('Token refreshed successfully, new expiry:', new Date(credentials.expiry_date || 0).toISOString());

    // Update tokens in database
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: credentials.access_token,
        expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
      },
    });

    console.log('Token saved to database');
    return true;
  } catch (error: any) {
    console.error('Failed to refresh token:', {
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
    });
    return false;
  }
}

/**
 * Create a calendar event from a task
 */
export async function createCalendarEvent(
  userId: string,
  task: {
    id: string;
    title: string;
    description?: string | null;
    dueDate: Date;
    dueTime?: string | null;
    estimatedTime?: number | null;
  }
) {
  try {
    // Ensure token is valid before making API call
    const tokenValid = await ensureValidToken(userId);
    if (!tokenValid) {
      throw new Error('Failed to refresh access token. Please sign in again.');
    }

    const { calendar } = await getCalendarClient(userId);

    // Parse due time or default to 09:00
    const [hours, minutes] = task.dueTime ? task.dueTime.split(':').map(Number) : [9, 0];

    // Create start datetime
    const startDate = new Date(task.dueDate);
    startDate.setHours(hours, minutes, 0, 0);

    // Calculate end datetime (use estimated time or default 30 minutes)
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + (task.estimatedTime || 30));

    // Create event
    const event = {
      summary: task.title,
      description: task.description || undefined,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    console.log('Creating calendar event:', {
      taskId: task.id,
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
    });

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('Calendar event created successfully:', response.data.id);

    // Update task with Google Event ID
    await prisma.task.update({
      where: { id: task.id },
      data: { googleEventId: response.data.id },
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to create calendar event:', {
      message: error.message,
      code: error.code,
      status: error.status,
      statusText: error.statusText,
      errors: error.errors,
      response: error.response?.data,
    });

    // Re-throw with more details
    throw error;
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  task: {
    title: string;
    description?: string | null;
    dueDate: Date;
    dueTime?: string | null;
    estimatedTime?: number | null;
  }
) {
  try {
    await ensureValidToken(userId);
    const { calendar } = await getCalendarClient(userId);

    // Parse due time or default to 09:00
    const [hours, minutes] = task.dueTime ? task.dueTime.split(':').map(Number) : [9, 0];

    // Create start datetime
    const startDate = new Date(task.dueDate);
    startDate.setHours(hours, minutes, 0, 0);

    // Calculate end datetime
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + (task.estimatedTime || 30));

    const event = {
      summary: task.title,
      description: task.description || undefined,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    throw new Error('Failed to update calendar event');
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(userId: string, eventId: string) {
  try {
    await ensureValidToken(userId);
    const { calendar } = await getCalendarClient(userId);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    return true;
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    // Don't throw error if event doesn't exist
    if ((error as any)?.code === 404) {
      return true;
    }
    throw new Error('Failed to delete calendar event');
  }
}

/**
 * Get calendar events for a date range
 */
export async function getCalendarEvents(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    await ensureValidToken(userId);
    const { calendar } = await getCalendarClient(userId);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Failed to get calendar events:', error);
    throw new Error('Failed to get calendar events');
  }
}

/**
 * Sync task with Google Calendar
 * Creates event if it doesn't exist, updates if it does
 */
export async function syncTaskWithCalendar(
  userId: string,
  task: {
    id: string;
    title: string;
    description?: string | null;
    dueDate: Date;
    dueTime?: string | null;
    estimatedTime?: number | null;
    googleEventId?: string | null;
  }
) {
  try {
    if (task.googleEventId) {
      // Update existing event
      return await updateCalendarEvent(userId, task.googleEventId, task);
    } else {
      // Create new event
      return await createCalendarEvent(userId, task);
    }
  } catch (error) {
    console.error('Failed to sync task with calendar:', error);
    throw error;
  }
}

/**
 * Remove task sync from Google Calendar
 */
export async function unsyncTaskFromCalendar(
  userId: string,
  googleEventId: string,
  taskId: string
) {
  try {
    // Delete from Google Calendar
    await deleteCalendarEvent(userId, googleEventId);

    // Remove googleEventId from task
    await prisma.task.update({
      where: { id: taskId },
      data: { googleEventId: null },
    });

    return true;
  } catch (error) {
    console.error('Failed to unsync task from calendar:', error);
    throw error;
  }
}
