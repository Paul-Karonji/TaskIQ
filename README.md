# DueSync - Smart Task Synchronization

> **Status:** Production Ready - 100% Complete | **Version:** 1.0.0 | **Last Updated:** November 2, 2025

A modern, intelligent task management application built with Next.js 15, React Query, Prisma, and NextAuth. Features Google Calendar sync, email & push notifications, Focus Mode with Pomodoro timer, recurring tasks, categories/tags, interactive onboarding, and archive management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase, Neon, or Railway recommended)
- Google OAuth credentials
- Gmail account with App Password (for email notifications)
- VAPID keys (for push notifications)

### Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**

   Create a `.env` file with the following:
   ```env
   # Database
   DATABASE_URL="your-postgresql-url"
   DIRECT_URL="your-direct-url"

   # Google OAuth & Calendar
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Email Notifications (Gmail)
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-16-char-app-password"

   # Push Notifications (VAPID Keys)
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
   VAPID_PRIVATE_KEY="your-private-key"

   # Cron Job Security
   CRON_SECRET="your-random-secret-string"
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✨ Key Features

### Core Task Management
- ✅ Full CRUD operations for tasks
- ✅ Priority levels (HIGH, MEDIUM, LOW) with color coding
- ✅ Status tracking (PENDING, COMPLETED, ARCHIVED)
- ✅ Categories and tags with custom colors
- ✅ Task filtering by status, priority, category, and tags
- ✅ Global search functionality with separate search page
- ✅ Estimated time tracking (minutes)
- ✅ Due date and time management

### Advanced Features
- ✅ **Recurring Tasks** - Daily, weekly, monthly patterns with automatic generation via cron job
- ✅ **Google Calendar Sync** - Two-way synchronization with automatic token refresh
- ✅ **Focus Mode** - Distraction-free view with customizable Pomodoro timer (1-60 min work, 1-30 min break)
- ✅ **Email Notifications** - Daily/weekly summaries with beautiful HTML templates (Gmail SMTP)
- ✅ **Push Notifications** - Browser push notifications with customizable reminders
- ✅ **Archive System** - Dedicated archive page with restore and permanent delete functionality
- ✅ **User Onboarding** - Interactive 9-step tour using driver.js
- ✅ **Categories Management** - Full CRUD with color picker and task count
- ✅ **Tags Management** - Full CRUD with color picker and filtering
- ✅ **Dark/Light Mode** - Theme toggle with system preference detection
- ✅ **Settings Page** - Complete user preferences management

### Automation & Integrations
- ✅ 3 automated cron jobs:
  - Recurring tasks generation (hourly)
  - Email notifications (hourly)
  - Push reminders (every 15 minutes)
- ✅ Service Worker for offline push notifications
- ✅ Gmail SMTP integration for email delivery
- ✅ Google OAuth 2.0 for authentication and calendar access
- ✅ Web Push API for browser notifications

---

## 📁 Project Structure

```
DueSync/
├── app/
│   ├── api/
│   │   ├── auth/                  # NextAuth API routes
│   │   ├── tasks/                 # Task CRUD API
│   │   │   ├── route.ts           # GET all, POST create
│   │   │   ├── [id]/route.ts      # GET, PATCH, DELETE
│   │   │   ├── [id]/calendar/     # Calendar sync endpoints
│   │   │   └── today/             # Today's tasks for Focus Mode
│   │   ├── categories/            # Category CRUD
│   │   │   ├── route.ts           # GET, POST
│   │   │   └── [id]/route.ts      # PATCH, DELETE
│   │   ├── tags/                  # Tag CRUD
│   │   │   ├── route.ts           # GET, POST
│   │   │   └── [id]/route.ts      # PATCH, DELETE
│   │   ├── notifications/
│   │   │   ├── preferences/       # Email/push preferences (GET, PATCH)
│   │   │   └── push/              # Push subscription endpoints
│   │   │       ├── subscribe/     # POST subscribe
│   │   │       ├── unsubscribe/   # DELETE unsubscribe
│   │   │       └── test/          # POST test notification
│   │   ├── cron/                  # Automated jobs (Vercel Cron)
│   │   │   ├── generate-recurring/  # Hourly recurring task generation
│   │   │   ├── send-notifications/  # Hourly email notifications
│   │   │   └── push-reminders/      # 15-min push notifications
│   │   ├── user/                  # User endpoints
│   │   │   ├── profile/           # GET, PATCH profile
│   │   │   ├── export/            # GET export data as JSON
│   │   │   └── onboarding/        # GET, PATCH onboarding status
│   │   └── debug/                 # Debug endpoints (auth, tokens)
│   ├── login/                     # Login page
│   ├── focus/                     # Focus Mode page with Pomodoro timer
│   ├── archive/                   # Archive page with restore/delete
│   ├── settings/                  # Settings page with tabs
│   ├── search/                    # Global search results page
│   ├── privacy/                   # Privacy policy page
│   ├── terms/                     # Terms of service page
│   ├── test-push/                 # Push notification test page
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Main dashboard
│   └── globals.css                # Global styles
├── components/
│   ├── focus/                     # Focus Mode components
│   │   ├── FocusModeView.tsx      # Main focus view
│   │   └── PomodoroTimer.tsx      # Pomodoro timer with circular progress
│   ├── onboarding/                # Onboarding tour
│   │   └── WelcomeTour.tsx        # Interactive 9-step tour (driver.js)
│   ├── search/                    # Search components
│   │   ├── SearchBar.tsx          # Search input in header
│   │   └── SearchResults.tsx      # Search results page
│   ├── settings/                  # Settings components
│   │   ├── SettingsLayout.tsx     # Settings page layout
│   │   ├── ProfileSection.tsx     # Profile & display preferences
│   │   ├── NotificationsSection.tsx # Email & push notification settings
│   │   ├── AccountsSection.tsx    # Connected accounts
│   │   └── LegalSection.tsx       # Privacy, terms, data export
│   ├── notifications/             # Notification components
│   │   └── NotificationPreferences.tsx  # Notification settings form
│   ├── categories/                # Category management
│   │   └── CategoryManager.tsx    # Category CRUD with color picker
│   ├── tags/                      # Tag management
│   │   └── TagManager.tsx         # Tag CRUD with color picker
│   ├── tasks/                     # Task components
│   │   ├── TaskCard.tsx           # Individual task display
│   │   ├── TaskList.tsx           # Task list container
│   │   ├── TaskDashboard.tsx      # Main dashboard
│   │   ├── QuickAddTask.tsx       # Task creation form with recurring support
│   │   ├── TaskFilters.tsx        # Filter controls
│   │   ├── CalendarSyncButton.tsx # Calendar sync toggle
│   │   ├── CompletedTasksSection.tsx  # Completed tasks view
│   │   ├── PriorityQueueWidget.tsx    # High priority tasks widget
│   │   └── UpcomingHighPrioritySection.tsx  # Upcoming high priority
│   ├── theme/                     # Theme components
│   │   ├── ThemeProvider.tsx      # Theme context provider
│   │   └── ThemeToggle.tsx        # Light/dark mode toggle
│   ├── providers/                 # Context providers
│   │   └── query-provider.tsx     # React Query provider
│   ├── ui/                        # UI primitives (shadcn/ui)
│   ├── ServiceWorkerProvider.tsx  # Service worker registration
│   └── Logo.tsx                   # DueSync logo component
├── lib/
│   ├── hooks/                     # Custom React hooks
│   │   ├── useTasks.ts            # Task management hooks
│   │   ├── useCalendarSync.ts     # Calendar sync hooks
│   │   ├── useCategories.ts       # Category hooks
│   │   ├── useTags.ts             # Tag hooks
│   │   └── useOnboarding.ts       # Onboarding state management
│   ├── validations/               # Zod schemas
│   │   ├── task.ts                # Task validation
│   │   ├── category.ts            # Category validation
│   │   ├── tag.ts                 # Tag validation
│   │   └── push.ts                # Push subscription validation
│   ├── auth.ts                    # Auth helpers
│   ├── prisma.ts                  # Prisma client singleton
│   ├── google-calendar.ts         # Google Calendar API integration
│   ├── email.ts                   # Email service (Nodemailer + Gmail)
│   ├── push.ts                    # Client-side push utilities
│   ├── push-sender.ts             # Server-side push sender
│   ├── register-sw.ts             # Service worker registration
│   └── utils.ts                   # Utility functions (cn, date helpers)
├── public/
│   └── sw.js                      # Service Worker for push notifications
├── prisma/
│   └── schema.prisma              # Database schema (User, Task, Category, Tag, etc.)
├── docs/                          # Feature documentation
│   ├── GOOGLE_CALENDAR_INTEGRATION.md
│   ├── EMAIL_NOTIFICATIONS.md
│   ├── EMAIL_CONFIGURATION.md
│   ├── PUSH_NOTIFICATIONS.md
│   ├── FOCUS_MODE.md
│   ├── RECURRING_TASKS.md
│   ├── CATEGORIES_TAGS.md
│   ├── USER_GUIDE.md
│   ├── FAQ.md
│   └── RLS_IMPLEMENTATION.md
├── types/
│   ├── index.ts                   # TypeScript types
│   └── next-auth.d.ts             # NextAuth type extensions
├── vercel.json                    # Vercel cron job configuration
├── auth.ts                        # NextAuth configuration
├── CLAUDE.md                      # AI assistant documentation
├── system documentation.md        # System overview
├── README.md                      # This file
└── .env                           # Environment variables (gitignored)
```

## 🎯 Complete Feature Status

### Week 1 - Setup ✅ 100% Complete
- ✅ Next.js 15 + TypeScript setup
- ✅ PostgreSQL database with Prisma
- ✅ Google OAuth authentication
- ✅ Session management with NextAuth v5
- ✅ Supabase PostgreSQL integration
- ✅ Environment configuration

### Week 2 - Core Task Management ✅ 100% Complete
- ✅ Task CRUD operations (Create, Read, Update, Delete)
- ✅ Priority levels (High, Medium, Low) with color coding
- ✅ Task filtering by status and priority
- ✅ Search functionality
- ✅ Task statistics dashboard
- ✅ Responsive design
- ✅ Toast notifications with Sonner
- ✅ Loading states and skeleton animations
- ✅ React Query integration for data fetching
- ✅ Form validation with Zod
- ✅ Optimistic UI updates

### Week 3+ - Advanced Features ✅ 100% Complete

#### Google Calendar Integration ✅
- ✅ OAuth2 with calendar scope
- ✅ Sync/unsync tasks to Google Calendar
- ✅ Automatic token refresh mechanism
- ✅ Event creation with reminders (24h email, 30min popup)
- ✅ Event updates when task changes
- ✅ Event deletion when unsynced
- ✅ Debug endpoints for troubleshooting
- ✅ Comprehensive error handling

#### Recurring Tasks ✅
- ✅ Database schema (isRecurring, recurringPattern)
- ✅ UI in QuickAddTask (checkbox + pattern selector)
- ✅ Daily, weekly, monthly patterns
- ✅ Automatic task generation via cron job (hourly)
- ✅ Smart duplicate detection
- ✅ Visual indicators in TaskCard (Repeat icon)
- ✅ Date calculation utilities

#### Focus Mode ✅
- ✅ Dedicated focus page (/focus)
- ✅ Today's tasks API endpoint
- ✅ Pomodoro timer with circular progress bar
- ✅ Work/Break mode switching
- ✅ Customizable timer (1-60 min work, 1-30 min break)
- ✅ Task navigation (previous/next/progress dots)
- ✅ Timer controls (start/pause/reset)
- ✅ Sound on timer completion
- ✅ Audio controls toggle
- ✅ Distraction-free dark UI

#### Email Notifications ✅
- ✅ Database schema (NotificationPreference)
- ✅ Gmail SMTP integration (Nodemailer)
- ✅ HTML email templates (daily & weekly)
- ✅ Daily task summaries
- ✅ Weekly reports with statistics
- ✅ User-configurable time and day settings
- ✅ Notification scheduler via cron job (hourly)
- ✅ Test email functionality
- ✅ Smart skipping (no email if no tasks)
- ✅ Preferences UI in settings

#### Push Notifications ✅
- ✅ VAPID keys configuration
- ✅ Client-side utilities (subscribe/unsubscribe)
- ✅ Server-side push sender
- ✅ Service Worker (sw.js)
- ✅ Push subscription API endpoints
- ✅ Cron job for reminders (every 15 minutes)
- ✅ Task reminders (customizable minutes before)
- ✅ Overdue alerts (9 AM daily)
- ✅ Due today reminders (8 AM daily)
- ✅ Test notification functionality
- ✅ Browser support detection

#### Categories & Tags ✅
- ✅ Database schema with relations
- ✅ Complete CRUD API endpoints
- ✅ CategoryManager component with color picker
- ✅ TagManager component with color picker
- ✅ Display in TaskCard with colors
- ✅ Task count per category/tag
- ✅ Edit/delete with confirmations
- ✅ Selection in task forms
- ✅ Task filtering by category and tag
- ✅ React Query hooks for data management

#### User Onboarding ✅
- ✅ Welcome tour component using driver.js
- ✅ 9-step interactive guide
- ✅ Feature highlights (Quick Add, Filters, Categories, Focus, etc.)
- ✅ Progress indicators
- ✅ Skip/back/next/finish navigation
- ✅ API endpoint for tracking status
- ✅ Resume tour from settings
- ✅ Custom hook for state management
- ✅ Auto-triggers for new users
- ✅ Responsive design

#### Archive System ✅
- ✅ Dedicated archive page (/archive)
- ✅ View all archived tasks
- ✅ Restore to PENDING functionality
- ✅ Permanent delete with confirmation
- ✅ Task count display
- ✅ Empty state handling
- ✅ Navigation integration
- ✅ Toast notifications

#### Additional Features ✅
- ✅ Global search with dedicated page
- ✅ Dark/light mode with theme toggle
- ✅ Settings page with tabbed interface
- ✅ Privacy policy page
- ✅ Terms of service page
- ✅ User data export (JSON format)
- ✅ Profile management
- ✅ Account connections display

---

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js 18+
- **Package Manager**: npm

### Frontend
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI primitives (shadcn/ui)
- **Icons**: Lucide React 0.468.0
- **Notifications**: Sonner 1.7.3
- **Form Handling**: React Hook Form 7.54.2
- **Validation**: Zod 3.24.1
- **Onboarding**: driver.js 1.3.1

### Backend & Database
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.2.1
- **Authentication**: NextAuth v5.0.0-beta.25
- **OAuth Provider**: Google OAuth 2.0

### State & API
- **State Management**: React Query (TanStack Query v5.62.18)
- **External APIs**:
  - Google Calendar API v3 (googleapis 144.0.0)
  - Web Push API (web-push 3.6.7)
- **Email**: Nodemailer 6.9.16

### Development
- **Type Checking**: TypeScript Compiler
- **Linting**: ESLint
- **Analytics**: Vercel Analytics

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Build
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma migrate dev      # Run migrations
npx prisma studio          # Open Prisma Studio GUI
npx prisma generate        # Generate Prisma Client
npx prisma migrate reset   # Reset database (careful!)

# Code Quality
npx tsc --noEmit          # Check TypeScript errors
npm run lint              # Run ESLint

# VAPID Keys (Push Notifications)
npx web-push generate-vapid-keys  # Generate VAPID keys
```

## 📖 API Documentation

### Authentication
- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/callback/google` - Google OAuth callback

### Tasks
- `GET /api/tasks` - Fetch all tasks (with filtering: status, priority, search, categoryId)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get single task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `GET /api/tasks/today` - Get today's tasks for Focus Mode

### Google Calendar Integration
- `POST /api/tasks/[id]/calendar` - Sync task to Google Calendar
- `DELETE /api/tasks/[id]/calendar` - Remove sync from Google Calendar

### Categories
- `GET /api/categories` - Fetch all categories
- `POST /api/categories` - Create new category
- `PATCH /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Tags
- `GET /api/tags` - Fetch all tags
- `POST /api/tags` - Create new tag
- `PATCH /api/tags/[id]` - Update tag
- `DELETE /api/tags/[id]` - Delete tag

### Notifications
- `GET /api/notifications/preferences` - Get notification preferences
- `PATCH /api/notifications/preferences` - Update preferences
- `POST /api/notifications/push/subscribe` - Subscribe to push notifications
- `DELETE /api/notifications/push/unsubscribe` - Unsubscribe from push
- `POST /api/notifications/push/test` - Send test push notification

### Cron Jobs (Protected with CRON_SECRET)
- `GET /api/cron/generate-recurring` - Generate recurring task instances (runs hourly)
- `GET /api/cron/send-notifications` - Send email notifications (runs hourly)
- `GET /api/cron/push-reminders` - Send push reminders (runs every 15 min)

### User
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile
- `GET /api/user/export` - Export all user data as JSON
- `GET /api/user/onboarding` - Get onboarding status
- `PATCH /api/user/onboarding` - Update onboarding status

### Debug (Development Only)
- `GET /api/debug/auth` - Check authentication status and token validity
- `GET /api/debug/refresh-token` - Manually test token refresh
- `GET /api/debug/clear-tokens` - Clear tokens for re-authentication

---

## 📝 Documentation

### Main Documentation
- **`README.md`** - This file (quick start and feature overview)

### Feature Guides
- **`docs/GOOGLE_CALENDAR_INTEGRATION.md`** - Complete Google Calendar setup and usage
- **`docs/EMAIL_NOTIFICATIONS.md`** - Email notification system guide
- **`docs/EMAIL_CONFIGURATION.md`** - Gmail SMTP setup instructions
- **`docs/PUSH_NOTIFICATIONS.md`** - Web push notification implementation
- **`docs/FOCUS_MODE.md`** - Focus Mode and Pomodoro timer guide
- **`docs/RECURRING_TASKS.md`** - Recurring tasks setup and patterns
- **`docs/CATEGORIES_TAGS.md`** - Categories and tags management
- **`docs/USER_GUIDE.md`** - Complete user guide for all features
- **`docs/FAQ.md`** - Frequently asked questions
- **`docs/RLS_IMPLEMENTATION.md`** - Row-level security guide (optional)

---

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Danger**: Red (#EF4444)
- **Priority High**: Red (#EF4444)
- **Priority Medium**: Amber (#F59E0B)
- **Priority Low**: Green (#10B981)
- **Background Light**: Slate (#F8FAFC)
- **Background Dark**: Slate (#0F172A)

### Typography
- **Font**: Inter (variable font)
- Clean, modern, and highly readable

### Components
- Built with Radix UI primitives
- Fully accessible (keyboard navigation, screen readers)
- Responsive design for mobile, tablet, and desktop
- Dark mode support throughout

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

Before deploying to production, ensure you have:

#### Required Services
- [ ] PostgreSQL database (Supabase recommended)
- [ ] Google OAuth credentials configured
- [ ] Resend account for email notifications
- [ ] Upstash Redis for rate limiting
- [ ] Domain name (optional, can use Vercel subdomain)

#### Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all production values
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Set strong `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set strong `CRON_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Generate VAPID keys for push notifications
- [ ] Verify email domain in Resend
- [ ] Update `RESEND_FROM_EMAIL` to verified domain
- [ ] Test database connection (connection_limit=100)

#### Google OAuth Setup
- [ ] Add production URL to Google Cloud Console
- [ ] Update authorized redirect URIs:
  - `https://your-domain.com/api/auth/callback/google`
- [ ] Verify calendar API is enabled
- [ ] Test OAuth flow in staging first

#### Database Setup
- [ ] Run Prisma migrations (see `docs/BASELINE_MIGRATION.md`)
- [x] Row-Level Security enabled (see `APPLY_RLS.md` for details)
- [ ] Verify database indexes are created
- [ ] Test database connection pooling

#### Optional but Recommended
- [ ] Set up Sentry error monitoring (see `docs/ERROR_MONITORING.md`)
- [ ] Configure custom domain
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Enable Vercel Analytics

### Vercel Deployment (Recommended)

#### Step 1: Prepare Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Production-ready deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/duesync.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Vercel

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

#### Step 3: Configure Environment Variables

In Vercel dashboard (Settings → Environment Variables), add ALL variables from `.env`:

**Critical Variables:**
```
DATABASE_URL=postgresql://...?connection_limit=100
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback/google
VAPID_PUBLIC_KEY=your-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-key
VAPID_PRIVATE_KEY=your-key
VAPID_SUBJECT=mailto:duesync@wiktechnologies.com
CRON_SECRET=your-strong-secret
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=noreply@your-domain.com
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

**Optional Variables:**
```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-sentry-token
```

**Important:**
- Use "Production" environment for all variables
- Can add "Preview" and "Development" separately
- Never commit secrets to git

#### Step 4: Configure Cron Jobs

Ensure `vercel.json` exists with cron configuration:

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

These cron jobs will automatically:
- Generate recurring task instances (hourly)
- Send email notifications (hourly)
- Send push reminders (every 15 minutes)

**Note:** Vercel Cron requires Pro plan. On Hobby plan, use external cron services like [cron-job.org](https://cron-job.org) with `CRON_SECRET` header.

#### Step 5: Deploy

1. Click "Deploy" in Vercel dashboard
2. Vercel will:
   - Install dependencies
   - Build Next.js application
   - Generate Prisma Client
   - Deploy to edge network
3. Wait for deployment to complete (~2-5 minutes)

#### Step 6: Post-Deployment Configuration

##### Database Migration

**If new database:**
```bash
# Connect to production (update DATABASE_URL in .env temporarily)
npx prisma migrate deploy
```

**If existing database:**
See `docs/BASELINE_MIGRATION.md` for baseline migration instructions.

##### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Edit OAuth 2.0 Client ID
5. Add authorized redirect URI:
   ```
   https://your-production-domain.com/api/auth/callback/google
   ```
6. Save changes

##### Resend Email Domain

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain (or use Resend's domain for testing)
3. Add DNS records to verify domain
4. Update `RESEND_FROM_EMAIL` to use verified domain

##### Test Deployment

Run through this checklist:

**Authentication:**
- [ ] Can sign in with Google
- [ ] Can sign out
- [ ] Session persists on page refresh
- [ ] Redirects work correctly

**Core Features:**
- [ ] Can create task
- [ ] Can edit task
- [ ] Can delete task
- [ ] Can mark task as complete
- [ ] Can filter and search tasks

**Integrations:**
- [ ] Google Calendar sync works
- [ ] Email notifications send correctly
- [ ] Push notifications work (subscribe and test)
- [ ] Cron jobs execute (check Vercel logs)

**Performance:**
- [ ] Page load time <3 seconds
- [ ] API responses <500ms
- [ ] No console errors
- [ ] Images load correctly

### Alternative Deployment Options

#### Railway

1. Visit [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables
4. Deploy
5. Add Railway PostgreSQL (optional)

**Note:** Railway doesn't support cron jobs natively. Use external cron service.

#### Docker Deployment

1. Build Docker image:
```bash
docker build -t duesync .
```

2. Run container:
```bash
docker run -p 3000:3000 --env-file .env duesync
```

3. For production, use Docker Compose with PostgreSQL

#### Self-Hosted

Requirements:
- Node.js 18+ server
- PostgreSQL database
- Reverse proxy (Nginx/Caddy)
- SSL certificate
- Process manager (PM2)

See `docs/SELF_HOSTING.md` for detailed guide (coming soon).

### Post-Deployment Monitoring

#### Monitor Errors

1. **Sentry** (recommended):
   - See `docs/ERROR_MONITORING.md`
   - Set up alerts for critical errors
   - Review error dashboard daily

2. **Vercel Logs**:
   - View real-time logs in Vercel dashboard
   - Set up log drains for long-term storage

#### Monitor Performance

1. **Vercel Analytics**:
   - Enable in project settings (free)
   - Track page views, load times
   - Identify slow pages

2. **Database Monitoring**:
   - Check connection pool usage
   - Monitor query performance
   - Set up alerts for high CPU/memory

#### Monitor Cron Jobs

Check Vercel dashboard:
- Deployments → Functions → Cron
- View execution history
- Check for failures
- Monitor execution duration

### Troubleshooting

#### Build Failures

**"Module not found" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Run type check locally
npx tsc --noEmit
```

#### Runtime Errors

**"Prisma Client not found":**
- Ensure `npx prisma generate` runs in build command
- Check Vercel build logs

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Check `connection_limit=100` is set
- Ensure database is accessible from Vercel IPs

**OAuth errors:**
- Verify redirect URI matches exactly
- Check `NEXTAUTH_URL` is production domain
- Ensure Google OAuth credentials are correct

#### Performance Issues

**Slow API responses:**
- Check database query performance
- Increase connection pool size
- Add database indexes
- Enable Redis caching

**Memory errors:**
- Reduce connection pool size
- Optimize large data fetches
- Implement pagination

### Rollback Plan

If deployment has critical issues:

1. **Instant Rollback** (Vercel):
   - Go to Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Code Rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database Rollback**:
   - Restore from backup
   - Revert problematic migration

### Security Hardening

After deployment:

- [ ] Enable Vercel security headers
- [ ] Set up WAF (Web Application Firewall) if needed
- [ ] Configure rate limiting properly
- [ ] Enable HTTPS only (automatic on Vercel)
- [ ] Set secure cookie flags
- [ ] Rotate all production secrets
- [ ] Review Vercel access logs
- [ ] Set up security alerts

### Scaling Considerations

When your app grows:

**Database:**
- Increase connection pool (already at 100)
- Consider read replicas for heavy read workloads
- Upgrade Supabase plan for more resources

**Serverless Functions:**
- Vercel Pro: Longer execution time (60s vs 10s)
- Enterprise: Regional deployments

**Caching:**
- Use Vercel Edge Network
- Implement Redis for session/data caching
- Add CDN for static assets

**Monitoring:**
- Upgrade Sentry plan for more events
- Set up custom dashboards
- Enable performance profiling

### Cost Estimation

**Free Tier Limits:**
- Vercel: 100GB bandwidth, 100 hours serverless
- Supabase: 500MB database, 2GB transfer
- Resend: 100 emails/day
- Upstash: 10,000 requests/day
- Sentry: 5,000 errors/month

**When to Upgrade:**
- >1,000 active users: Upgrade Vercel to Pro ($20/mo)
- >10,000 tasks: Upgrade Supabase to Pro ($25/mo)
- >100 emails/day: Upgrade Resend ($20/mo for 50k emails)
- Heavy traffic: Upgrade Upstash ($10/mo)

**Estimated Cost for 10,000 Users:**
- Vercel Pro: $20/mo
- Supabase Pro: $25/mo
- Resend: $20/mo
- Upstash: $10/mo
- Sentry: $26/mo
- **Total: ~$100/mo**

### Support & Maintenance

**Regular Maintenance:**
- Update dependencies monthly (`npm update`)
- Run security audits (`npm audit`)
- Review error logs weekly
- Backup database daily (automatic with Supabase)
- Rotate secrets quarterly

**Support Channels:**
- Email: support@wiktechnologies.com
- GitHub Issues: For bug reports
- Documentation: Comprehensive guides in `/docs`

---

**Deployment Success Checklist:**

✅ All environment variables configured
✅ Database migrations applied
✅ Google OAuth redirect URIs updated
✅ Email domain verified in Resend
✅ Cron jobs executing successfully
✅ Error monitoring set up (Sentry)
✅ Authentication flow tested
✅ All features tested in production
✅ Performance metrics acceptable
✅ Security headers configured
✅ Backup strategy in place
✅ Monitoring and alerts set up

**You're ready for production!** 🚀

---

## 🧪 Testing Checklist

### Authentication
- [ ] Can sign in with Google
- [ ] Can sign out
- [ ] Session persists on refresh
- [ ] Unauthorized requests are blocked

### Task Management
- [ ] Can create task with all fields
- [ ] Can create recurring task
- [ ] Can view task list
- [ ] Can toggle task completion
- [ ] Can edit task
- [ ] Can delete task
- [ ] Can filter by status/priority/category/tag
- [ ] Can search tasks
- [ ] Can archive task
- [ ] Can restore archived task

### Google Calendar
- [ ] Can sync task to calendar
- [ ] Event appears in Google Calendar
- [ ] Can unsync task
- [ ] Event is removed from calendar
- [ ] Token refresh works

### Notifications
- [ ] Can enable email notifications
- [ ] Can set email time/day preferences
- [ ] Receives daily email summary
- [ ] Receives weekly email report
- [ ] Can subscribe to push notifications
- [ ] Receives push reminders
- [ ] Receives overdue alerts

### Focus Mode
- [ ] Can access Focus Mode
- [ ] Timer works correctly
- [ ] Can navigate between tasks
- [ ] Can customize timer settings
- [ ] Audio alerts work

### Categories & Tags
- [ ] Can create category with color
- [ ] Can create tag with color
- [ ] Can edit category/tag
- [ ] Can delete category/tag
- [ ] Can filter tasks by category/tag

### UI/UX
- [ ] Onboarding tour appears for new users
- [ ] Dark/light mode toggle works
- [ ] Responsive on mobile
- [ ] Loading states appear correctly
- [ ] Toast notifications work
- [ ] Forms validate correctly

---

## 🤝 Contributing

This is a production-ready application. If you'd like to contribute or report issues:

### For Users
- Feature requests: Create an issue on GitHub
- Bug reports: Provide detailed steps to reproduce
- Feedback: Contact us at infoduesync@wiktechnologies.com

### For Developers
- Read `CLAUDE.md` for comprehensive technical documentation
- Follow existing code patterns and conventions
- Ensure TypeScript compilation succeeds
- Test thoroughly before submitting changes

---

## 💬 Contact & Support

- **Email**: infoduesync@wiktechnologies.com
- **Support**: infoduesync@wiktechnologies.com
- **Response Time**: Within 48 hours

---

## 📄 Legal

- **Privacy Policy**: Available at `/privacy`
- **Terms of Service**: Available at `/terms`
- **License**: MIT License - free to use for learning purposes
- **Data Protection**: GDPR & CCPA compliant

---

## 🎯 Project Status

**Overall Status**: Production Ready - 100% Complete

| Phase | Status | Completion |
|-------|--------|------------|
| Week 1 - Setup | ✅ Complete | 100% |
| Week 2 - Core Features | ✅ Complete | 100% |
| Week 3+ - Advanced Features | ✅ Complete | 100% |

### All Features Implemented ✅
- ✅ Task Management (CRUD, filtering, search)
- ✅ Google Calendar Integration
- ✅ Recurring Tasks
- ✅ Focus Mode with Pomodoro Timer
- ✅ Email Notifications
- ✅ Push Notifications
- ✅ Categories & Tags Management
- ✅ User Onboarding Tour
- ✅ Archive System
- ✅ Settings & Preferences
- ✅ Dark/Light Mode
- ✅ Responsive Design
- ✅ Legal Pages (Privacy, Terms)
- ✅ Data Export

---

## 💡 Key Highlights

### Smart Synchronization
DueSync keeps your tasks synchronized across Google Calendar, email, and browser notifications automatically.

### Focus on Productivity
Focus Mode with Pomodoro timer helps you concentrate on one task at a time without distractions.

### Never Miss a Deadline
Customizable notifications ensure you're always aware of upcoming and overdue tasks.

### Flexible Organization
Categories, tags, priorities, and filters give you complete control over task organization.

### Beautiful Interface
Clean, modern design with dark mode support and smooth animations throughout.

---

## 🔮 Future Enhancements

### Short Term
- [ ] Subtasks functionality
- [ ] Task dependencies
- [ ] Drag-and-drop reordering
- [ ] Keyboard shortcuts
- [ ] Time tracking per task

### Medium Term
- [ ] Calendar view (month/week)
- [ ] Gantt chart view
- [ ] Task templates
- [ ] Bulk operations
- [ ] Advanced recurring patterns (skip weekends, custom intervals)

### Long Term
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Team collaboration features
- [ ] Task sharing
- [ ] Real-time collaboration
- [ ] AI task suggestions
- [ ] Voice input
- [ ] Third-party integrations (Slack, Trello, etc.)
- [ ] Analytics dashboard

---

## 💻 Development Tips

1. **Database Changes**: Always create Prisma migrations
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. **Environment Setup**: Never commit `.env` file

3. **Google Calendar**: Ensure calendar scope is granted during OAuth

4. **Token Issues**: Use `/api/debug/auth` to check token status

5. **Type Safety**: Run `npx tsc --noEmit` regularly

6. **Cron Jobs**: Test locally using Vercel CLI or by calling endpoints manually

7. **Push Notifications**: Generate VAPID keys for each environment
   ```bash
   npx web-push generate-vapid-keys
   ```

8. **Email Testing**: Use Gmail App Passwords, not your account password

---

**Built with ❤️ using Next.js 15, TypeScript, Prisma, and React Query**

*Last Updated: November 2, 2025*
