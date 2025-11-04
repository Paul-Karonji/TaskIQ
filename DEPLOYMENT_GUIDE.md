# DueSync Production Deployment Guide

This guide will walk you through deploying DueSync to production on Vercel (recommended) or other hosting platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Deployment to Vercel](#deployment-to-vercel)
5. [Deployment to Railway](#deployment-to-railway)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Cron Jobs Setup](#cron-jobs-setup)
8. [Testing & Verification](#testing--verification)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with repository pushed
- [ ] Vercel/Railway account (or other hosting platform)
- [ ] Supabase database (already configured)
- [ ] Google OAuth credentials (already configured)
- [ ] Resend account with verified domain
- [ ] Upstash Redis production database
- [ ] Domain name (optional but recommended)

---

## Pre-Deployment Checklist

### 1. Code Preparation

```bash
# Ensure all changes are committed
git status

# Run build locally to check for errors
npm run build

# Run type checking
npx tsc --noEmit

# Run linting
npm run lint

# Test production build
npm start
```

### 2. Database Preparation

```bash
# Ensure all migrations are applied
npx prisma migrate deploy

# Verify database connection
npx prisma studio
```

### 3. Environment Variables

Review and prepare all environment variables from `.env.production` template.

---

## Environment Variables Setup

### Required Variables

Copy these from `.env.production` and fill in production values:

#### Database
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

#### Authentication
```env
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="<generate-new-with-openssl>"
```

Generate new secret:
```bash
openssl rand -base64 32
```

#### Google OAuth
```env
GOOGLE_CLIENT_ID="944409108669-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_REDIRECT_URI="https://your-production-domain.com/api/auth/callback/google"
```

#### Email (Resend)
```env
RESEND_API_KEY="re_your_production_key"
RESEND_FROM_EMAIL="noreply@your-verified-domain.com"
```

#### Redis (Upstash)
```env
UPSTASH_REDIS_REST_URL="https://your-production-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-production-token"
```

#### Security
```env
CRON_SECRET="<generate-new-with-openssl>"
```

Generate new secret:
```bash
openssl rand -base64 32
```

#### Push Notifications
```env
VAPID_PUBLIC_KEY="BDmZCfQuRo6coWBUzm0xBjMYQN6yNEUcHRUXK2E0Fk8fW_Ggpdo7Nkbgk66_2YeTjfUjAY29TuDvElRQ0jKhThI"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BDmZCfQuRo6coWBUzm0xBjMYQN6yNEUcHRUXK2E0Fk8fW_Ggpdo7Nkbgk66_2YeTjfUjAY29TuDvElRQ0jKhThI"
VAPID_PRIVATE_KEY="4PzB8tc7T2leGXJKHB9g04W-TTwOapXBxn1ZtgWFCtk"
VAPID_SUBJECT="mailto:duesync@wiktechnologies.com"
```

**Note:** You can keep the same VAPID keys or generate new ones. Generating new keys will invalidate existing push notification subscriptions.

To generate new VAPID keys:
```bash
npx web-push generate-vapid-keys
```

### Optional Variables

#### Error Monitoring (Sentry)
```env
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
SENTRY_ORG="your-organization"
SENTRY_PROJECT="duesync"
```

#### Analytics
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

---

## Deployment to Vercel

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `DueSync`

### Step 2: Configure Project

**Framework Preset:** Next.js

**Root Directory:** `./`

**Build Command:** `npm run build`

**Output Directory:** `.next`

**Install Command:** `npm install`

### Step 3: Add Environment Variables

1. Go to "Environment Variables" section
2. Add all variables from `.env.production`
3. **IMPORTANT:** Add variables for all environments (Production, Preview, Development)

**Quick add:** You can paste all variables at once:
- Click "Add" → "Paste Multiple"
- Copy entire `.env.production` file
- Paste and adjust values

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-5 minutes)
3. Get your deployment URL: `https://your-app.vercel.app`

### Step 5: Add Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain: `duesync.wiktechnologies.com`
3. Configure DNS:
   - **CNAME:** `cname.vercel-dns.com`
4. Wait for DNS propagation (5-10 minutes)

---

## Deployment to Railway

### Step 1: Create New Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository

### Step 2: Configure Environment

1. Go to Variables tab
2. Add all environment variables from `.env.production`
3. Save changes

### Step 3: Configure Build

Railway auto-detects Next.js. If needed, configure:

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm start
```

### Step 4: Deploy

1. Railway automatically deploys
2. Get your deployment URL: `https://your-app.railway.app`

### Step 5: Add Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS with provided CNAME

---

## Post-Deployment Configuration

### 1. Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs:**
   ```
   https://your-production-domain.com/api/auth/callback/google
   ```
4. Add to **Authorized JavaScript origins:**
   ```
   https://your-production-domain.com
   ```
5. Save changes

### 2. Verify Resend Domain

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain: `wiktechnologies.com`
3. Add DNS records to your DNS provider:

   **SPF Record (TXT):**
   ```
   v=spf1 include:_spf.resend.com ~all
   ```

   **DKIM Record (TXT):**
   ```
   [Provided by Resend]
   ```

   **DMARC Record (TXT):**
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@your-domain.com
   ```

4. Wait for verification (24-48 hours)
5. Test email sending

### 3. Create Production Redis Database

1. Go to [Upstash Console](https://upstash.com/console/redis)
2. Click "Create Database"
3. Name: `duesync-production`
4. Region: Choose closest to your app
5. Copy credentials to environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. Run Database Migrations

From your local machine:

```bash
# Set production database URL
DATABASE_URL="your-production-database-url" npx prisma migrate deploy

# Or if using Vercel:
vercel env pull .env.production.local
npx prisma migrate deploy
```

### 5. Verify Row-Level Security (RLS)

1. Go to Supabase Dashboard
2. Navigate to Authentication → Policies
3. Verify all tables have RLS enabled:
   - ✅ User
   - ✅ Account
   - ✅ Session
   - ✅ Task
   - ✅ Category
   - ✅ Tag
   - ✅ TaskTag
   - ✅ NotificationPreference

---

## Cron Jobs Setup

DueSync requires three cron jobs to run:

1. **Generate Recurring Tasks** - Runs hourly
2. **Send Email Notifications** - Runs hourly
3. **Send Push Reminders** - Runs every 15 minutes

### Option A: Vercel Cron (Recommended for Vercel)

1. Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-recurring",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-notifications",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/push-reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

2. Deploy to apply changes:
```bash
git add vercel.json
git commit -m "Add Vercel cron configuration"
git push
```

3. Verify in Vercel Dashboard → Cron Jobs

**Note:** Vercel automatically adds the `CRON_SECRET` to cron requests.

### Option B: Upstash QStash (For any platform)

1. Go to [Upstash QStash](https://upstash.com/console/qstash)
2. Create three schedules:

**Schedule 1: Generate Recurring Tasks**
- **URL:** `https://your-domain.com/api/cron/generate-recurring`
- **Schedule:** `0 * * * *` (every hour)
- **Headers:**
  ```
  Authorization: Bearer YOUR_CRON_SECRET
  Content-Type: application/json
  ```

**Schedule 2: Send Email Notifications**
- **URL:** `https://your-domain.com/api/cron/send-notifications`
- **Schedule:** `0 * * * *` (every hour)
- **Headers:**
  ```
  Authorization: Bearer YOUR_CRON_SECRET
  Content-Type: application/json
  ```

**Schedule 3: Send Push Reminders**
- **URL:** `https://your-domain.com/api/cron/push-reminders`
- **Schedule:** `*/15 * * * *` (every 15 minutes)
- **Headers:**
  ```
  Authorization: Bearer YOUR_CRON_SECRET
  Content-Type: application/json
  ```

### Test Cron Jobs

Test each endpoint manually with curl:

```bash
# Generate recurring tasks
curl -X POST https://your-domain.com/api/cron/generate-recurring \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"

# Send email notifications
curl -X POST https://your-domain.com/api/cron/send-notifications \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"

# Send push reminders
curl -X POST https://your-domain.com/api/cron/push-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

---

## Testing & Verification

### 1. Authentication Flow

- [ ] Navigate to production URL
- [ ] Click "Sign in with Google"
- [ ] Verify redirect to Google OAuth
- [ ] Grant permissions (email, profile, calendar)
- [ ] Verify redirect back to app
- [ ] Check user is logged in
- [ ] Verify session persists on refresh

### 2. Task Management

- [ ] Create a new task
- [ ] Edit task details
- [ ] Mark task as complete
- [ ] Delete task
- [ ] Test all filters (status, priority)
- [ ] Test search functionality

### 3. Google Calendar Sync

- [ ] Create task with due date
- [ ] Click sync to Google Calendar
- [ ] Verify event appears in Google Calendar
- [ ] Update task and re-sync
- [ ] Verify event updated in Google Calendar
- [ ] Unsync task
- [ ] Verify event removed from Google Calendar

### 4. Push Notifications

- [ ] Subscribe to push notifications
- [ ] Send test notification
- [ ] Verify notification received
- [ ] Check notification preferences

### 5. Email Notifications

- [ ] Configure notification preferences
- [ ] Send test email
- [ ] Verify email received
- [ ] Check email formatting

### 6. Categories and Tags

- [ ] Create category
- [ ] Create tag
- [ ] Assign to task
- [ ] Filter by category/tag

### 7. Recurring Tasks

- [ ] Create recurring task
- [ ] Wait for cron to run (or trigger manually)
- [ ] Verify new instance created

### 8. Focus Mode

- [ ] Navigate to Focus Mode
- [ ] Start Pomodoro timer
- [ ] Test timer controls
- [ ] Complete task in Focus Mode

---

## Monitoring & Maintenance

### 1. Set Up Error Monitoring (Sentry)

1. Sign up at [sentry.io](https://sentry.io)
2. Create new project: "DueSync"
3. Get DSN and auth token
4. Add to environment variables
5. Deploy with Sentry configuration
6. Test error tracking:
   ```javascript
   // Trigger test error
   throw new Error("Test error for Sentry");
   ```
7. Verify error appears in Sentry dashboard

### 2. Monitor Application

**Metrics to track:**
- User sign-ups and logins
- Task creation rate
- Calendar sync success rate
- Email delivery rate
- Push notification delivery
- API response times
- Error rates

**Tools:**
- **Vercel Analytics** (auto-enabled)
- **Sentry** (errors and performance)
- **Upstash Console** (Redis usage)
- **Resend Dashboard** (email delivery)
- **Supabase Dashboard** (database performance)

### 3. Set Up Uptime Monitoring

Use [UptimeRobot](https://uptimerobot.com) (free):

1. Create HTTP(s) monitor
2. URL: `https://your-domain.com`
3. Interval: 5 minutes
4. Alert: Email/SMS on downtime

### 4. Regular Maintenance Tasks

**Daily:**
- [ ] Check error logs
- [ ] Monitor email delivery
- [ ] Review user feedback

**Weekly:**
- [ ] Review Sentry errors
- [ ] Check database performance
- [ ] Monitor Redis usage
- [ ] Review analytics

**Monthly:**
- [ ] Update dependencies
- [ ] Review security alerts
- [ ] Analyze user metrics
- [ ] Optimize performance

**Quarterly:**
- [ ] Rotate secrets (NEXTAUTH_SECRET, CRON_SECRET)
- [ ] Review and update documentation
- [ ] Security audit
- [ ] Performance optimization

---

## Troubleshooting

### Issue: Google OAuth Not Working

**Symptoms:** Redirect fails or "redirect_uri_mismatch" error

**Solutions:**
1. Verify `NEXTAUTH_URL` matches production domain exactly
2. Check `GOOGLE_REDIRECT_URI` is correct
3. Ensure redirect URI is added in Google Console
4. Clear browser cookies and try again
5. Check Google Console for error messages

### Issue: Cron Jobs Not Running

**Symptoms:** Recurring tasks not generated, emails not sent

**Solutions:**
1. Verify `CRON_SECRET` is set correctly
2. Check cron service configuration (Vercel or QStash)
3. Test endpoints manually with curl
4. Review cron job logs
5. Check authorization header format

### Issue: Email Not Sending

**Symptoms:** Email notifications not received

**Solutions:**
1. Verify domain is verified in Resend
2. Check DNS records (SPF, DKIM, DMARC)
3. Review Resend dashboard for errors
4. Check email quota limits (100/day on free tier)
5. Test with `/api/notifications/test` endpoint
6. Verify `RESEND_FROM_EMAIL` matches verified domain

### Issue: Push Notifications Not Working

**Symptoms:** Notifications not received

**Solutions:**
1. Verify VAPID keys are set correctly
2. Check browser permissions for notifications
3. Test with `/api/notifications/push/test`
4. Review browser console for errors
5. Ensure service worker is registered
6. Check push subscription in browser DevTools

### Issue: Database Connection Errors

**Symptoms:** "Too many connections" or timeout errors

**Solutions:**
1. Check `DATABASE_URL` connection_limit
2. Review Supabase dashboard for connection stats
3. Increase connection_limit if needed
4. Verify connection pooler is working
5. Check for connection leaks in code

### Issue: Tasks Not Syncing to Calendar

**Symptoms:** Sync button doesn't work or errors

**Solutions:**
1. Check Google Calendar API is enabled
2. Verify user has granted calendar permission
3. Test token refresh: `/api/debug/refresh-token`
4. Review error logs for specific error
5. Ask user to re-authenticate if token expired

### Issue: Build Failing

**Symptoms:** Deployment fails during build

**Solutions:**
1. Check build logs for specific error
2. Run `npm run build` locally to reproduce
3. Verify all environment variables are set
4. Check TypeScript errors: `npx tsc --noEmit`
5. Ensure Prisma client is generated
6. Review dependencies for conflicts

### Issue: High Redis Usage

**Symptoms:** Approaching Upstash free tier limit

**Solutions:**
1. Review rate limiting configuration
2. Check for excessive caching
3. Monitor cron job lock usage
4. Consider upgrading Upstash plan
5. Optimize cache expiration times

---

## Post-Deployment Checklist

After successful deployment:

- [ ] All environment variables are set
- [ ] Google OAuth is working
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Resend domain verified
- [ ] Cron jobs configured and running
- [ ] Error monitoring active (Sentry)
- [ ] Uptime monitoring set up
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] All features tested
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## Security Best Practices

### Secrets Management

1. **Never commit secrets** to version control
2. **Use strong, random secrets:**
   ```bash
   openssl rand -base64 32
   ```
3. **Rotate secrets regularly** (every 90 days)
4. **Store securely** (1Password, AWS Secrets Manager)
5. **Limit access** to production environment variables

### Application Security

1. **HTTPS only** - Enforce secure connections
2. **RLS enabled** - Verify database security
3. **Rate limiting** - Configured via Upstash Redis
4. **CRON_SECRET** - Protect cron endpoints
5. **Input validation** - Zod schemas in place
6. **Error handling** - No sensitive data in errors

### Monitoring

1. **Error tracking** - Sentry configured
2. **Audit logs** - Review regularly
3. **Security updates** - `npm audit` monthly
4. **Dependency updates** - Weekly checks
5. **Access logs** - Monitor for suspicious activity

---

## Support & Resources

### Documentation

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth Deployment](https://authjs.dev/getting-started/deployment)

### Internal Docs

- `README.md` - Quick start guide
- `CLAUDE.md` - Comprehensive project documentation
- `docs/GOOGLE_CALENDAR_INTEGRATION.md` - Calendar integration
- `docs/PUSH_NOTIFICATIONS.md` - Push notification setup
- `docs/EMAIL_NOTIFICATIONS.md` - Email configuration

### Getting Help

For issues or questions:
1. Check this deployment guide
2. Review `CLAUDE.md` for architecture details
3. Check Vercel/Railway logs
4. Review Sentry error reports
5. Contact support or team lead

---

**Last Updated:** November 3, 2025
**Version:** 1.0.0
**Status:** Production Ready
