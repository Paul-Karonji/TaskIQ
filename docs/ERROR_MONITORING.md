# Error Monitoring with Sentry

## Overview

This guide explains how to set up Sentry error monitoring for DueSync. Sentry provides real-time error tracking, performance monitoring, and alerting for production applications.

## Why Use Sentry?

**Benefits:**
- Real-time error notifications
- Stack traces with source maps
- User impact tracking (how many users affected)
- Performance monitoring (slow API endpoints)
- Release tracking (correlate errors with deployments)
- Integration with Slack, email, and more
- Free tier: 5,000 errors/month

**Critical for Production:**
- Catch errors users don't report
- Debug production issues without access to logs
- Track error trends over time
- Identify recurring issues
- Monitor API performance degradation

## Setup Steps

### 1. Create Sentry Account

1. Visit [sentry.io](https://sentry.io/signup/)
2. Sign up for free account
3. Create new project:
   - Platform: **Next.js**
   - Alert me on: **Every new issue**
   - Name: DueSync

### 2. Install Sentry SDK

```bash
npm install @sentry/nextjs
```

### 3. Configure Sentry

Run the Sentry wizard to automatically configure:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Add Sentry to `next.config.js`
- Prompt for your DSN

### 4. Environment Variables

Add to `.env` (get DSN from Sentry dashboard):

```env
# Sentry Error Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-key@o123456.ingest.us.sentry.io/123456"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
SENTRY_ORG="your-org-name"
SENTRY_PROJECT="duesync"
```

**Production**: Add these to Vercel/Railway environment variables

### 5. Basic Configuration

**`sentry.client.config.ts`:**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate for performance monitoring
  tracesSampleRate: 1.0, // 100% in development
  // tracesSampleRate: 0.1, // 10% in production (to stay within quota)

  // Capture replay for debugging
  replaysOnErrorSampleRate: 1.0, // 100% of errors
  replaysSessionSampleRate: 0.1, // 10% of sessions

  // Filter out non-critical errors
  beforeSend(event, hint) {
    // Ignore localhost errors in production
    if (event.request?.url?.includes('localhost')) {
      return null;
    }
    return event;
  },

  // Set environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
```

**`sentry.server.config.ts`:**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,

  // Server-specific configuration
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },

  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
```

### 6. Error Boundary for React Components

Create `app/error.tsx` (Next.js 13+ App Router):

```typescript
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">
          We've been notified and will look into it.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

### 7. Manual Error Capturing

**Capture exceptions:**
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  console.error('Error:', error);
}
```

**Add context:**
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
});

Sentry.setTag('taskId', task.id);
Sentry.setContext('task', {
  id: task.id,
  title: task.title,
  priority: task.priority,
});

Sentry.captureException(error);
```

**Log messages:**
```typescript
Sentry.captureMessage('User completed onboarding', 'info');
```

## Integration with DueSync

### API Routes

Add error capturing to all API routes:

**Example: `app/api/tasks/route.ts`**
```typescript
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    // Your code
  } catch (error: any) {
    // Log to Sentry with context
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/tasks',
        method: 'POST',
      },
      user: {
        id: session.user.id,
      },
    });

    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
```

### Background Jobs

**Cron jobs** (`app/api/cron/*/route.ts`):
```typescript
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  const transaction = Sentry.startTransaction({
    op: 'cron.job',
    name: 'Generate Recurring Tasks',
  });

  try {
    // Your cron job logic
    transaction.setStatus('ok');
  } catch (error) {
    transaction.setStatus('internal_error');
    Sentry.captureException(error);
  } finally {
    transaction.finish();
  }
}
```

### Google Calendar Sync

**Track external API errors:**
```typescript
try {
  await calendar.events.insert(...);
} catch (error: any) {
  Sentry.captureException(error, {
    tags: {
      integration: 'google-calendar',
      operation: 'create_event',
    },
    extra: {
      taskId: task.id,
      statusCode: error.code,
    },
  });
  throw error;
}
```

## Production Best Practices

### 1. Sample Rates

Adjust in production to stay within quota:

```typescript
// Client
tracesSampleRate: 0.1, // 10% of transactions
replaysSessionSampleRate: 0.01, // 1% of sessions

// Server
tracesSampleRate: 0.05, // 5% of server requests
```

### 2. Data Scrubbing

Remove sensitive data automatically:

```typescript
beforeSend(event) {
  // Remove sensitive query params
  if (event.request?.url) {
    event.request.url = event.request.url.replace(/token=[^&]+/, 'token=[REDACTED]');
  }

  // Remove sensitive headers
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['cookie'];
  }

  // Remove email addresses from breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => ({
      ...breadcrumb,
      message: breadcrumb.message?.replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[EMAIL]'),
    }));
  }

  return event;
}
```

### 3. Ignore Non-Critical Errors

```typescript
ignoreErrors: [
  // Browser extensions
  'top.GLOBALS',
  'ResizeObserver loop limit exceeded',

  // Network errors
  'NetworkError',
  'Failed to fetch',

  // Cancelled requests
  'AbortError',
  'The user aborted a request',
],
```

### 4. Release Tracking

Track which deployment introduced errors:

```typescript
// Automatically use git commit SHA in Vercel
release: process.env.VERCEL_GIT_COMMIT_SHA,

// Or manually version
release: 'duesync@1.0.0',
```

### 5. Alerts

Configure in Sentry dashboard:
- **Email**: Immediate for new issues
- **Slack**: Daily digest of errors
- **Threshold alerts**: >10 errors in 1 hour

## Monitoring Checklist

After setup, verify:

- [ ] Errors appear in Sentry dashboard
- [ ] Source maps uploaded (readable stack traces)
- [ ] User context attached to errors
- [ ] Performance monitoring tracks slow API endpoints
- [ ] Alerts configured (email/Slack)
- [ ] Sensitive data filtered out
- [ ] Release tracking enabled
- [ ] Error grouping works correctly

## Useful Sentry Features

### 1. Performance Monitoring

Track slow operations:
```typescript
const span = Sentry.startSpan(
  { name: 'Database Query', op: 'db.query' },
  async () => {
    return await prisma.task.findMany();
  }
);
```

### 2. Session Replay

See what user did before error:
- Enabled via `replaysOnErrorSampleRate: 1.0`
- Video-like replay of user session
- Excludes sensitive inputs automatically

### 3. Issue Filters

Create filters in Sentry:
- Show only unresolved errors
- Group by release
- Filter by environment
- Search by user ID

### 4. Integration with GitHub

Link errors to GitHub issues:
1. Sentry Settings → Integrations → GitHub
2. Connect repository
3. Create GitHub issues directly from Sentry

## Cost Management

**Free Tier Limits:**
- 5,000 errors/month
- 10,000 performance units/month
- 50 replays/month

**Stay Within Limits:**
- Use sampling (10-20% in production)
- Filter localhost errors
- Ignore non-critical errors
- Archive resolved issues monthly

**Upgrade When:**
- Hitting limits regularly
- Need advanced features (custom dashboards, more replays)
- Growing user base (>1,000 users)

## Troubleshooting

### Source Maps Not Uploading

Check `next.config.js`:
```javascript
module.exports = {
  sentry: {
    hideSourceMaps: false,
    widenClientFileUpload: true,
  },
};
```

### Too Many Errors

1. Check `ignoreErrors` configuration
2. Increase sample rate filtering
3. Fix recurring bugs (check dashboard for patterns)

### No Errors Showing

1. Verify DSN is correct
2. Check `beforeSend` isn't filtering everything
3. Trigger test error:
   ```typescript
   throw new Error('Sentry test error');
   ```

## Alternative Solutions

If Sentry doesn't fit your needs:

- **LogRocket**: Session replay focus
- **Bugsnag**: Similar to Sentry
- **Rollbar**: Error monitoring
- **Datadog**: Full observability platform (more expensive)
- **Self-hosted**: Sentry is open-source (can self-host)

## References

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

---

**Recommendation**: Set up Sentry before going to production. It's invaluable for catching bugs users don't report and debugging production issues.

**Last Updated**: November 2, 2025
