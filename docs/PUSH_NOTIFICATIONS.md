# Push Notifications - Complete Guide

> Comprehensive documentation for DueSync's Web Push Notification system

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup and Configuration](#setup-and-configuration)
4. [API Reference](#api-reference)
5. [Client-Side Usage](#client-side-usage)
6. [Server-Side Implementation](#server-side-implementation)
7. [Cron Jobs](#cron-jobs)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Browser Compatibility](#browser-compatibility)
11. [Security Considerations](#security-considerations)
12. [Production Deployment](#production-deployment)

---

## Overview

DueSync implements **Web Push Notifications** using the Push API and Service Workers to deliver real-time task reminders directly to users' browsers, even when the app is not open.

### Key Features

- **Browser-native notifications**: No third-party service required
- **Offline support**: Notifications work even when the app is closed
- **VAPID authentication**: Secure server identification
- **Customizable reminders**: Users control when to receive notifications
- **Task-specific actions**: Quick actions from notification (View, Mark Complete)
- **Multi-browser support**: Chrome, Firefox, Edge, Safari 16.1+

### Use Cases

1. **Task Reminders**: Notify users before tasks are due
2. **Overdue Alerts**: Alert users about overdue tasks
3. **Due Today**: Morning reminder for tasks due today
4. **Custom Notifications**: Send task-specific push messages

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    DueSync Push System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Browser    │      │  Next.js App │      │ Database  │ │
│  │              │      │              │      │           │ │
│  │ Service      │◄────►│  API Routes  │◄────►│ Prisma    │ │
│  │ Worker       │      │              │      │           │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│        ▲                      ▲                             │
│        │                      │                             │
│        │    Push Delivery     │                             │
│        │                      │                             │
│  ┌─────▼──────────────────────▼──────┐                     │
│  │   Google FCM / Mozilla Push       │                     │
│  │   (Browser Push Services)         │                     │
│  └───────────────────────────────────┘                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Vercel Cron (Every 15 min)                │ │
│  │   Triggers: /api/cron/push-reminders                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Subscription Flow**
   ```
   User → Request Permission → Subscribe to Push → Save to Database
   ```

2. **Notification Delivery Flow**
   ```
   Cron Job → Check Due Tasks → Send via web-push → Browser → Service Worker → Display Notification
   ```

3. **Interaction Flow**
   ```
   User Clicks Notification → Service Worker → Open App / Mark Complete
   ```

---

## Setup and Configuration

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys authenticate your server when sending push notifications.

```bash
# Install web-push globally (if not already installed)
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

Output:
```
Public Key: BDmZ...ThI
Private Key: 4PzB...Ctk
```

### 2. Environment Variables

Add to `.env`:

```env
# ---------- Push Notifications (VAPID Keys) ----------
VAPID_PUBLIC_KEY="your-public-key-here"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key-here"
VAPID_PRIVATE_KEY="your-private-key-here"
VAPID_SUBJECT="mailto:your-email@example.com"

# ---------- Cron Job Security ----------
CRON_SECRET="your-random-secret-here"
```

**Important:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` must be exposed to the browser
- `VAPID_PRIVATE_KEY` must remain secret (server-side only)
- Generate `CRON_SECRET` with: `openssl rand -base64 32`

### 3. Install Dependencies

```bash
npm install web-push
```

Already included in project `package.json`.

### 4. Database Setup

The push subscription is stored in the `NotificationPreference` model:

```prisma
model NotificationPreference {
  id                       String   @id @default(cuid())
  userId                   String   @unique
  pushNotificationsEnabled Boolean  @default(true)
  pushSubscription         Json?
  // ... other fields
}
```

Run migrations if not already applied:
```bash
npx prisma migrate dev
```

---

## API Reference

### Subscribe to Push Notifications

**Endpoint:** `POST /api/notifications/push/subscribe`

**Description:** Save a user's push subscription to the database.

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "expirationTime": null,
  "keys": {
    "p256dh": "BL8...",
    "auth": "16ByteAuthSecret=="
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push subscription saved successfully"
}
```

**Errors:**
- `400`: Invalid subscription data
- `401`: Unauthorized (not logged in)
- `500`: Database error

---

### Unsubscribe from Push Notifications

**Endpoint:** `DELETE /api/notifications/push/unsubscribe`

**Description:** Remove a user's push subscription.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Push subscription removed successfully"
}
```

---

### Send Test Notification

**Endpoint:** `POST /api/notifications/push/test`

**Description:** Send a test push notification to verify setup.

**Request Body (optional):**
```json
{
  "message": "Custom test message"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test notification sent successfully"
}
```

**Errors:**
- `401`: Unauthorized
- `400`: No push subscription found
- `500`: Failed to send notification

---

### Cron Job - Push Reminders

**Endpoint:** `GET /api/cron/push-reminders`

**Description:** Automated job to send task reminders. Called by Vercel Cron every 15 minutes.

**Authorization:** Requires `Authorization: Bearer {CRON_SECRET}` header

**Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-10-30T10:15:00.000Z",
  "stats": {
    "usersProcessed": 25,
    "remindersSent": 12,
    "overdueSent": 3,
    "dueTodaySent": 8,
    "errors": 0,
    "totalSent": 23
  }
}
```

**Schedule:** Every 15 minutes (`*/15 * * * *`)

**Logic:**
1. **Overdue Tasks**: Sent daily at 9:00 AM
2. **Due Today**: Sent daily at 8:00 AM
3. **Custom Reminders**: Based on `reminderMinutesBefore` setting (default: 15 min, 60 min)

---

## Client-Side Usage

### Service Worker Registration

The service worker is automatically registered when the app loads via `ServiceWorkerProvider`.

**File:** `components/ServiceWorkerProvider.tsx`

```typescript
import { registerServiceWorker } from '@/lib/register-sw';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker()
      .then((reg) => {
        if (reg) {
          console.log('Service worker registered');
        }
      })
      .catch((err) => console.error('SW registration failed:', err));
  }, []);

  return <>{children}</>;
}
```

### Push Utilities

**File:** `lib/push.ts`

#### Check Browser Support

```typescript
import { isPushSupported } from '@/lib/push';

if (isPushSupported()) {
  // Push notifications are supported
}
```

#### Request Permission

```typescript
import { requestNotificationPermission } from '@/lib/push';

const permission = await requestNotificationPermission();

if (permission === 'granted') {
  // Permission granted, can subscribe
}
```

#### Subscribe to Push

```typescript
import { subscribeToPush, subscriptionToJSON } from '@/lib/push';

const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const subscription = await subscribeToPush(vapidKey);

// Save to database
await fetch('/api/notifications/push/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(subscriptionToJSON(subscription)),
});
```

#### Unsubscribe

```typescript
import { unsubscribeFromPush } from '@/lib/push';

const success = await unsubscribeFromPush();

if (success) {
  // Remove from database
  await fetch('/api/notifications/push/unsubscribe', {
    method: 'DELETE',
  });
}
```

#### Check Subscription Status

```typescript
import { getSubscription, isSubscribed } from '@/lib/push';

const subscription = await getSubscription();
const subscribed = await isSubscribed();

if (subscribed) {
  console.log('User is subscribed:', subscription);
}
```

---

## Server-Side Implementation

### Push Sender Utility

**File:** `lib/push-sender.ts`

#### Send to Single User

```typescript
import { sendPushToUser } from '@/lib/push-sender';

const result = await sendPushToUser(userId, {
  title: 'Task Reminder',
  body: 'Your task is due in 15 minutes',
  taskId: 'task-123',
  priority: 'HIGH',
  url: '/',
  requireInteraction: true,
});

if (result.success) {
  console.log('Notification sent');
} else {
  console.error('Failed:', result.error);
}
```

#### Send to Multiple Users

```typescript
import { sendPushToMultipleUsers } from '@/lib/push-sender';

const result = await sendPushToMultipleUsers(
  ['user-1', 'user-2', 'user-3'],
  {
    title: 'System Update',
    body: 'DueSync has been updated with new features!',
  }
);

console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
```

#### Task-Specific Helpers

```typescript
import {
  sendTaskReminderPush,
  sendOverdueTaskPush,
  sendTaskDueTodayPush,
} from '@/lib/push-sender';

// Send task reminder
await sendTaskReminderPush(userId, task);

// Send overdue notification
await sendOverdueTaskPush(userId, task);

// Send due today notification
await sendTaskDueTodayPush(userId, task);
```

#### Check User Subscription

```typescript
import {
  hasValidPushSubscription,
  getUsersWithPushEnabled,
} from '@/lib/push-sender';

// Check single user
const hasSubscription = await hasValidPushSubscription(userId);

// Get all users with push enabled
const userIds = await getUsersWithPushEnabled();
```

---

## Cron Jobs

### Vercel Cron Configuration

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/push-reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Schedule:** Every 15 minutes

### Local Testing

Test cron job locally:

```bash
# Without CRON_SECRET (localhost only)
curl http://localhost:3000/api/cron/push-reminders

# With CRON_SECRET
curl -H "Authorization: Bearer your-secret" http://localhost:3000/api/cron/push-reminders
```

### Production Setup

1. **Set CRON_SECRET** in Vercel environment variables
2. **Deploy** to Vercel
3. **Verify** in Vercel Dashboard → Cron Jobs

**Vercel Cron Jobs Dashboard:**
- View execution logs
- See success/failure rates
- Monitor performance

---

## Testing

### Manual Testing

#### 1. Test Page

Navigate to `/test-push` for a complete testing interface.

**Features:**
- Browser support detection
- Permission request
- Subscribe/unsubscribe
- Send test notification
- View subscription details
- Display VAPID key

#### 2. NotificationPreferences Dialog

Open from the main dashboard:
- Click "Notifications" button
- Navigate to "Push Notifications" section
- Follow guided setup

### Automated Testing Checklist

- [ ] Browser support detection works
- [ ] Permission request displays correctly
- [ ] Subscribe saves to database
- [ ] Test notification appears
- [ ] Notification click opens app
- [ ] Unsubscribe removes from database
- [ ] Cron job sends reminders
- [ ] Expired subscriptions are removed
- [ ] Multiple browsers work (Chrome, Firefox, Edge, Safari)

---

## Troubleshooting

### Common Issues

#### 1. Notifications Not Appearing

**Symptoms:** No notification shown after sending

**Possible Causes:**
- Permission denied
- Browser doesn't support push
- Service worker not registered
- Subscription expired

**Solutions:**
1. Check browser console for errors
2. Verify service worker is active: DevTools → Application → Service Workers
3. Check notification permission: Settings → Site Settings → Notifications
4. Re-subscribe to push notifications
5. Check if browser tab is focused (some browsers suppress notifications)

#### 2. "Service Worker Registration Failed"

**Cause:** Service worker file not found or HTTPS required

**Solution:**
- Ensure `public/sw.js` exists
- Use HTTPS in production (localhost is exempt)
- Check browser console for specific error

#### 3. "Push Subscription Failed"

**Cause:** VAPID key not configured or invalid

**Solution:**
1. Verify `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set
2. Check key format (Base64 URL-safe string)
3. Ensure keys match on server and client

#### 4. "Cron Job Not Running"

**Cause:** CRON_SECRET mismatch or Vercel configuration issue

**Solution:**
1. Verify `CRON_SECRET` matches in `.env` and Vercel
2. Check `vercel.json` cron configuration
3. View logs in Vercel Dashboard
4. Test endpoint manually with correct Authorization header

#### 5. "410 Gone" Error

**Cause:** Push subscription expired or was unsubscribed by browser

**Solution:**
- This is handled automatically - expired subscriptions are removed from database
- User needs to re-subscribe

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 50+ | ✅ Full |
| Firefox | 44+ | ✅ Full |
| Edge | 17+ | ✅ Full |
| Safari | 16.1+ | ✅ Full |
| Opera | 37+ | ✅ Full |
| Samsung Internet | 5+ | ✅ Full |

### Unsupported

- Internet Explorer (all versions)
- Safari < 16.1 (iOS < 16.4)
- Opera Mini

### Feature Detection

Always check support before using:

```typescript
if (isPushSupported()) {
  // Show push notification UI
} else {
  // Show fallback or hide feature
}
```

---

## Security Considerations

### 1. VAPID Keys

- **Never expose private key** to the client
- Store private key in environment variables
- Rotate keys periodically (requires re-subscription)

### 2. Cron Job Authorization

- Always use `CRON_SECRET` in production
- Use strong random secret (32+ characters)
- Never commit secrets to version control

### 3. User Privacy

- Only send notifications to subscribed users
- Respect user's `pushNotificationsEnabled` setting
- Remove expired subscriptions automatically

### 4. Rate Limiting

Consider implementing rate limits:
- Max notifications per user per day
- Throttle cron job if too many errors
- Batch notifications to avoid overwhelming users

### 5. Content Security

- Validate notification payloads
- Sanitize user-generated content in notifications
- Don't include sensitive data in notification body

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] VAPID keys generated and configured
- [ ] CRON_SECRET set in production environment
- [ ] Service worker accessible at `/sw.js`
- [ ] Database migrations applied
- [ ] `vercel.json` includes cron configuration
- [ ] Environment variables set in Vercel
- [ ] HTTPS enabled (required for push)

### Vercel Deployment Steps

1. **Set Environment Variables**
   ```
   Vercel Dashboard → Settings → Environment Variables

   Add:
   - VAPID_PUBLIC_KEY
   - NEXT_PUBLIC_VAPID_PUBLIC_KEY
   - VAPID_PRIVATE_KEY
   - VAPID_SUBJECT
   - CRON_SECRET
   ```

2. **Deploy Application**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

3. **Verify Deployment**
   - Visit `/test-push` on production URL
   - Subscribe to notifications
   - Send test notification
   - Verify cron job in Vercel Dashboard

4. **Monitor Cron Jobs**
   - Vercel Dashboard → Cron Jobs
   - Check execution logs
   - Set up alerts for failures (optional)

### Post-Deployment

1. **Test with real users**
2. **Monitor error rates**
3. **Check notification delivery stats**
4. **Gather user feedback**

---

## Performance Optimization

### 1. Batch Notifications

Instead of sending notifications one-by-one:

```typescript
// Good: Batch processing
const users = await getUsersWithPushEnabled();
await sendPushToMultipleUsers(users, payload);

// Avoid: Individual sends in loop
for (const user of users) {
  await sendPushToUser(user.id, payload);
}
```

### 2. Database Queries

Use efficient queries:

```typescript
// Good: Include relations in single query
const preferences = await prisma.notificationPreference.findMany({
  where: { pushNotificationsEnabled: true },
  include: {
    user: {
      include: { tasks: true },
    },
  },
});

// Avoid: N+1 queries
const preferences = await prisma.notificationPreference.findMany();
for (const pref of preferences) {
  const user = await prisma.user.findUnique({ where: { id: pref.userId } });
}
```

### 3. Cron Job Optimization

- Run every 15 minutes (not every minute)
- Process only upcoming tasks (next 24 hours)
- Skip weekends if desired
- Use database indexes on `dueDate`

---

## Future Enhancements

Potential improvements:

1. **Rich Notifications**: Images, action buttons
2. **Notification History**: Track sent notifications
3. **User Analytics**: Notification engagement metrics
4. **Smart Scheduling**: AI-powered reminder timing
5. **Multi-Device Sync**: Coordinate across devices
6. **Custom Notification Sounds**: User-selectable sounds
7. **Notification Groups**: Group similar notifications
8. **Quiet Hours**: Respect user's do-not-disturb settings

---

## Additional Resources

### Documentation
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push library](https://github.com/web-push-libs/web-push)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

### Related Files
- `public/sw.js` - Service worker
- `lib/push.ts` - Client utilities
- `lib/push-sender.ts` - Server utilities
- `lib/register-sw.ts` - SW registration
- `app/api/notifications/push/*` - API endpoints
- `app/api/cron/push-reminders/route.ts` - Cron job
- `components/ServiceWorkerProvider.tsx` - Auto-registration
- `app/test-push/page.tsx` - Test UI

---

**Last Updated:** October 30, 2025
**Version:** 1.0.0
**Status:** Production Ready
