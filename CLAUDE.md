# DueSync - Project Documentation for Claude

> Comprehensive documentation for AI assistants and developers working on DueSync
>
> **Developed by:** WIK Technologies

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Feature Implementation Status](#feature-implementation-status)
7. [Component Structure](#component-structure)
8. [Authentication Flow](#authentication-flow)
9. [Google Calendar Integration](#google-calendar-integration)
10. [Development Workflow](#development-workflow)
11. [Known Issues](#known-issues)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

**DueSync** is a modern, intelligent task management application designed to help users organize, prioritize, and sync their tasks with Google Calendar. The project is built with Next.js 15, React, TypeScript, and integrates with PostgreSQL via Prisma ORM.

### Key Features
- Task CRUD operations with priority levels
- Google Calendar two-way sync
- Task filtering and search
- Google OAuth authentication
- Responsive design
- Real-time updates with React Query

### Project Information
- **Developer**: WIK Technologies
- **Project ID**: duesync-475306
- **Database**: Supabase PostgreSQL
- **Auth Provider**: Google OAuth (NextAuth v5)
- **Current Version**: Week 3 (Complete - 100%)

---

## Architecture

### Application Structure
```
DueSync/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── tasks/                # Task CRUD endpoints
│   │   │   ├── route.ts          # GET all, POST create
│   │   │   ├── [id]/             # Individual task operations
│   │   │   │   ├── route.ts      # GET, PATCH, DELETE
│   │   │   │   └── calendar/     # Calendar sync
│   │   │   └── today/            # Today's tasks for Focus Mode
│   │   └── debug/                # Debug endpoints
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Main dashboard
│   └── globals.css               # Global styles
├── components/
│   ├── providers/                # Context providers
│   ├── tasks/                    # Task-specific components
│   │   ├── TaskCard.tsx          # Individual task display
│   │   ├── TaskList.tsx          # Task list container
│   │   ├── TaskDashboard.tsx     # Main dashboard
│   │   ├── QuickAddTask.tsx      # Task creation form
│   │   ├── TaskFilters.tsx       # Search and filter UI
│   │   └── CalendarSyncButton.tsx # Calendar sync control
│   ├── ui/                       # Reusable UI components (shadcn/ui)
│   └── Logo.tsx                  # App logo
├── lib/
│   ├── hooks/                    # Custom React hooks
│   │   ├── useTasks.ts           # Task management hooks
│   │   └── useCalendarSync.ts    # Calendar sync hooks
│   ├── validations/              # Zod schemas
│   ├── auth.ts                   # Auth helpers
│   ├── prisma.ts                 # Prisma client
│   ├── google-calendar.ts        # Google Calendar API
│   └── utils.ts                  # Utility functions
├── prisma/
│   └── schema.prisma             # Database schema
├── types/
│   ├── index.ts                  # TypeScript types
│   └── next-auth.d.ts            # NextAuth type extensions
├── docs/
│   └── GOOGLE_CALENDAR_INTEGRATION.md
├── auth.ts                       # NextAuth configuration
├── .env                          # Environment variables
└── README.md                     # Project documentation
```

### Design Patterns
- **App Router**: Next.js 15 App Router with React Server Components
- **API Routes**: RESTful API design with proper HTTP methods
- **Server Actions**: Authentication checks on server side
- **Client Components**: Interactive UI with 'use client' directive
- **Custom Hooks**: Reusable logic with React Query
- **Type Safety**: Full TypeScript coverage
- **Validation**: Runtime validation with Zod
- **Database**: Prisma ORM with PostgreSQL

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI primitives
- **State Management**: React Query (TanStack Query) v5.62.18
- **Form Handling**: React Hook Form 7.54.2
- **Notifications**: Sonner 1.7.3
- **Icons**: Lucide React 0.468.0

### Backend
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.2.1
- **Authentication**: NextAuth v5.0.0-beta.25
- **OAuth**: Google OAuth 2.0
- **External APIs**: Google Calendar API v3
- **Validation**: Zod 3.24.1

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler

---

## Database Schema

### User Model
Stores user account information and authentication details.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  googleId      String?   @unique
  accessToken   String?   @db.Text
  refreshToken  String?   @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  tasks         Task[]
  tags          Tag[]
  categories    Category[]
  notifications NotificationPreference?
  accounts      Account[]
  sessions      Session[]
}
```

### Account Model (NextAuth)
Stores OAuth provider account information.

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

### Task Model
Core model for task management.

```prisma
model Task {
  id                String             @id @default(cuid())
  userId            String
  title             String
  description       String?            @db.Text
  dueDate           DateTime
  dueTime           String?            // "14:30" format
  priority          Priority           @default(MEDIUM)
  status            Status             @default(PENDING)
  categoryId        String?
  googleEventId     String?            @unique
  isRecurring       Boolean            @default(false)
  recurringPattern  RecurringPattern?
  estimatedTime     Int?               // minutes
  completedAt       DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  // Relations
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tags     TaskTag[]

  @@index([userId, dueDate])
  @@index([userId, status])
  @@index([userId, priority])
  @@index([googleEventId])
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}

enum Status {
  PENDING
  COMPLETED
  ARCHIVED
}

enum RecurringPattern {
  DAILY
  WEEKLY
  MONTHLY
}
```

### Category Model
Task categorization.

```prisma
model Category {
  id        String   @id @default(cuid())
  userId    String
  name      String
  color     String   @default("#10B981") // green-500
  createdAt DateTime @default(now())

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks Task[]

  @@unique([userId, name])
}
```

### Tag Model
Task tagging system.

```prisma
model Tag {
  id        String    @id @default(cuid())
  userId    String
  name      String
  color     String    @default("#3B82F6") // blue-500
  createdAt DateTime  @default(now())

  user  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks TaskTag[]

  @@unique([userId, name])
}

model TaskTag {
  taskId String
  tagId  String

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([taskId, tagId])
}
```

### NotificationPreference Model
User notification settings (schema only - not implemented).

```prisma
model NotificationPreference {
  id                       String   @id @default(cuid())
  userId                   String   @unique
  dailyEmailEnabled        Boolean  @default(true)
  dailyEmailTime           String   @default("08:00")
  weeklyEmailEnabled       Boolean  @default(true)
  weeklyEmailDay           WeekDay  @default(MONDAY)
  weeklyEmailTime          String   @default("09:00")
  pushNotificationsEnabled Boolean  @default(true)
  pushSubscription         Json?
  reminderMinutesBefore    Int[]    @default([15, 60])
  updatedAt                DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## API Documentation

### Authentication

#### POST /api/auth/signin/google
Sign in with Google OAuth.

#### POST /api/auth/signout
Sign out the current user.

### Tasks

#### GET /api/tasks
Fetch all tasks with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, COMPLETED, ARCHIVED)
- `priority` (optional): Filter by priority (HIGH, MEDIUM, LOW)
- `search` (optional): Search in title and description
- `categoryId` (optional): Filter by category
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response:**
```json
{
  "tasks": [
    {
      "id": "clx...",
      "title": "Task title",
      "description": "Task description",
      "dueDate": "2025-11-01T00:00:00.000Z",
      "dueTime": "14:00",
      "priority": "HIGH",
      "status": "PENDING",
      "categoryId": "clx...",
      "googleEventId": "event_id",
      "isRecurring": false,
      "recurringPattern": null,
      "estimatedTime": 60,
      "completedAt": null,
      "createdAt": "2025-10-30T00:00:00.000Z",
      "updatedAt": "2025-10-30T00:00:00.000Z",
      "category": { "name": "Work", "color": "#10B981" },
      "tags": [{ "tag": { "name": "urgent", "color": "#EF4444" } }]
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Optional description",
  "dueDate": "2025-11-01",
  "dueTime": "14:00",
  "priority": "HIGH",
  "categoryId": "clx...",
  "estimatedTime": 60
}
```

**Response:**
```json
{
  "task": { /* task object */ }
}
```

#### GET /api/tasks/[id]
Get a single task by ID.

**Response:**
```json
{
  "task": { /* task object with relations */ }
}
```

#### PATCH /api/tasks/[id]
Update a task.

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "COMPLETED",
  "priority": "MEDIUM"
  // ... any task fields
}
```

**Response:**
```json
{
  "task": { /* updated task object */ }
}
```

#### DELETE /api/tasks/[id]
Delete a task.

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

#### GET /api/tasks/today
Get today's tasks for Focus Mode.

**Response:**
```json
{
  "tasks": [ /* array of today's tasks */ ],
  "total": 5
}
```

### Google Calendar Integration

#### POST /api/tasks/[id]/calendar
Sync a task with Google Calendar.

**Response:**
```json
{
  "message": "Task synced with Google Calendar",
  "task": { /* updated task with googleEventId */ },
  "event": { /* Google Calendar event object */ }
}
```

**Error Responses:**
- `400`: No Google account connected
- `401`: Token expired - need to re-authenticate
- `403`: Permission denied - calendar access not granted
- `404`: Task not found
- `500`: Sync failed

#### DELETE /api/tasks/[id]/calendar
Remove task sync from Google Calendar.

**Response:**
```json
{
  "message": "Task unsynced from Google Calendar",
  "task": { /* updated task with googleEventId removed */ }
}
```

### Debug Endpoints

#### GET /api/debug/auth
Check authentication status and token validity.

**Response:**
```json
{
  "authenticated": true,
  "userId": "clx...",
  "account": {
    "hasAccessToken": true,
    "hasRefreshToken": true,
    "isExpired": false,
    "hasCalendarScope": true,
    "expiresAt": 1760608611
  }
}
```

#### GET /api/debug/refresh-token
Manually test token refresh.

#### GET /api/debug/clear-tokens
Clear all authentication tokens (useful for troubleshooting).

---

## Feature Implementation Status

### Week 1 - Setup ✅ COMPLETE
- ✅ Next.js 15 project setup
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ Prisma ORM with PostgreSQL
- ✅ NextAuth with Google OAuth
- ✅ Database schema design
- ✅ Environment configuration

### Week 2 - Task Management ✅ COMPLETE
- ✅ Task CRUD API endpoints
- ✅ Task UI components (TaskCard, TaskList)
- ✅ Quick Add Task form
- ✅ Priority levels with color coding
- ✅ Task filtering (status, priority, search)
- ✅ Task statistics dashboard
- ✅ React Query integration
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Loading states

### Week 3 - Advanced Features ✅ 100% COMPLETE

#### ✅ Google Calendar Integration (100%)
- ✅ OAuth2 with calendar scope
- ✅ Token refresh mechanism
- ✅ Sync/unsync endpoints
- ✅ Calendar sync button component
- ✅ Event creation with reminders
- ✅ Event updates and deletions
- ✅ Error handling for expired tokens
- ✅ Debug endpoints
- ✅ Comprehensive documentation

#### ✅ Recurring Tasks (100% - Fully Functional)
- ✅ Database schema (RecurringPattern enum: DAILY, WEEKLY, MONTHLY)
- ✅ Task model fields (isRecurring, recurringPattern)
- ✅ Complete UI in QuickAddTask (checkbox + pattern selector at lines 280-315)
- ✅ Cron job for task generation (`/api/cron/generate-recurring`) running hourly
- ✅ Smart duplicate detection (prevents generating existing instances)
- ✅ Automatic next instance creation with full task copying
- ✅ Visual indicators in TaskCard (Repeat icon)
- ✅ Date calculation utility function (calculateNextRecurringDate)
- 🟡 Advanced patterns (skip weekends, custom intervals) - future enhancement

#### ✅ Focus Mode (100%)
- ✅ API endpoint (/api/tasks/today)
- ✅ Focus Mode page (/app/focus/page.tsx)
- ✅ Pomodoro timer functionality with circular progress
- ✅ Work/Break mode switching
- ✅ Task navigation (previous/next/progress dots)
- ✅ Timer controls (start/pause/reset)
- ✅ Customizable timer settings (1-60 min work, 1-30 min break)
- ✅ Sound on timer completion
- ✅ Audio controls toggle
- ✅ Distraction-free UI
- ✅ Navigation button in dashboard
- ✅ Empty state handling

#### ✅ Email Notifications (100%)
- ✅ Database schema (NotificationPreference)
- ✅ Email service integration (Nodemailer + Gmail SMTP)
- ✅ HTML email templates (daily & weekly with beautiful styling)
- ✅ Notification scheduler (cron job - `/api/cron/send-notifications`)
- ✅ Daily task summaries with task details
- ✅ Weekly reports with statistics (completed, pending, overdue)
- ✅ Notification preferences UI (time & day selection)
- ✅ Test email functionality
- ✅ User-configurable time and day settings
- ✅ Smart skipping (no email if no tasks)
- ✅ Responsive email designs
- ✅ Complete error handling and logging

#### ✅ Push Notifications (100%)
- ✅ VAPID keys configuration
- ✅ Client-side utilities (`lib/push.ts`)
  - Browser support detection
  - Permission request flow
  - Subscribe/unsubscribe functionality
  - Subscription status checking
- ✅ Server-side utilities (`lib/push-sender.ts`)
  - Send to single/multiple users
  - Task-specific helpers (reminder, overdue, due today)
  - Expired subscription handling
  - User preference checking
- ✅ API endpoints
  - POST `/api/notifications/push/subscribe`
  - DELETE `/api/notifications/push/unsubscribe`
  - POST `/api/notifications/push/test`
- ✅ Service Worker (`public/sw.js`)
- ✅ Cron job (`/api/cron/push-reminders`)
  - Runs every 15 minutes
  - Sends reminders (customizable minutes before)
  - Sends overdue alerts (9 AM daily)
  - Sends due today reminders (8 AM daily)
  - CRON_SECRET authorization
  - Complete error handling

#### ✅ Categories/Tags Management (100%)
- ✅ Database schema
- ✅ Complete CRUD API endpoints (GET, POST, PATCH, DELETE)
- ✅ Display in TaskCard with colors
- ✅ Creation UI (CategoryManager, TagManager)
- ✅ Edit/delete functionality with confirmations
- ✅ Category/tag selection in task forms
- ✅ Color picker component
- ✅ Task count display per category/tag
- ✅ React Query hooks for data management
- ✅ Management buttons in dashboard
- ✅ Task filtering by category and tag

#### ✅ User Onboarding Tour (100%)
- ✅ Welcome tour component using driver.js (`components/onboarding/WelcomeTour.tsx`)
- ✅ 9-step interactive guide covering all features
- ✅ Highlights: Quick Add, Filters, Categories, Focus Mode, Notifications, Priority Queue, Settings
- ✅ Progress indicators showing step completion
- ✅ Skip/back/next/finish navigation
- ✅ API endpoint for tracking onboarding status (`/api/user/onboarding`)
- ✅ Resume tour functionality (from Settings → Profile)
- ✅ Smart skipping (tracks if user skipped or completed)
- ✅ Custom hook (`useOnboarding`) for state management
- ✅ Responsive design for mobile and desktop
- ✅ Auto-triggers for new users on first login

#### ✅ Archive Page (100%)
- ✅ Dedicated archive page at `/app/archive/page.tsx`
- ✅ View all archived tasks
- ✅ Restore functionality (moves task back to PENDING status)
- ✅ Permanent delete option with confirmation
- ✅ Task count display
- ✅ Empty state handling with helpful messaging
- ✅ Back to dashboard navigation
- ✅ Full integration with TaskCard component
- ✅ Toast notifications for user feedback

---

## Component Structure

### Task Components

#### TaskCard.tsx
Displays individual task with all details.

**Features:**
- Priority color indicator (4px left border)
- Checkbox for completion toggle
- Due date and time display
- Category and tags badges
- Edit and delete buttons (hover to show)
- Estimated time display
- Overdue indicator
- Calendar sync button
- Strikethrough for completed tasks

**Props:**
```typescript
interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
}
```

#### TaskList.tsx
Container for rendering multiple tasks.

**Features:**
- Maps through tasks array
- Loading skeleton states
- Empty state when no tasks
- Handles task actions (complete, edit, delete)

#### TaskDashboard.tsx
Main dashboard component (client component).

**Features:**
- Task statistics (Total, Pending, Completed)
- Filter controls
- Task list rendering
- Quick add task form
- Real-time updates with React Query

#### QuickAddTask.tsx
Collapsible form for quick task creation.

**Features:**
- Collapsed state ("+ Add a task" button)
- Expanded state with full form
- Form validation with Zod
- React Hook Form integration
- Loading states
- Success/error feedback
- Auto-reset after submission

**Fields:**
- Title (required)
- Description (optional)
- Due date (required)
- Due time (optional)
- Priority (default: MEDIUM)
- Estimated time in minutes (optional)

#### TaskFilters.tsx
Search and filter controls.

**Features:**
- Search input (debounced 300ms)
- Status dropdown filter
- Priority dropdown filter
- Clear all filters button
- Active filters summary

#### CalendarSyncButton.tsx
Button to sync/unsync tasks with Google Calendar.

**Features:**
- Shows sync status (synced/unsynced)
- Loading spinner during sync
- Error handling with toast
- Optimistic UI updates

---

## Authentication Flow

### Initial Setup

1. **Google Cloud Console Configuration:**
   - Project: DueSync (duesync-475306)
   - OAuth 2.0 Client ID created
   - Authorized redirect URIs configured
   - Calendar API enabled
   - OAuth consent screen configured

2. **NextAuth Configuration (auth.ts):**
   ```typescript
   Google({
     clientId: process.env.GOOGLE_CLIENT_ID,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     authorization: {
       params: {
         scope: 'openid email profile https://www.googleapis.com/auth/calendar',
         access_type: 'offline',
         prompt: 'consent',
       },
     },
     allowDangerousEmailAccountLinking: true,
   })
   ```

3. **Database Storage:**
   - User record created/updated
   - Account record stores OAuth tokens
   - Session record for user session

### Sign In Flow

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. User grants permissions (email, profile, calendar)
4. Google redirects back with authorization code
5. NextAuth exchanges code for tokens
6. Tokens stored in Account table:
   - `access_token`: For API calls
   - `refresh_token`: For token renewal
   - `expires_at`: Token expiration timestamp
   - `scope`: Granted permissions
7. Session created in database
8. User redirected to dashboard

### Token Refresh Flow

1. **Automatic Refresh:**
   - When access token expires, OAuth2 client auto-refreshes
   - New tokens saved to database
   - Handled by `oauth2Client.on('tokens')` event

2. **Proactive Refresh:**
   - `ensureValidToken()` checks expiration before API calls
   - Refreshes if token expires within 5 minutes
   - Prevents API call failures

3. **Manual Refresh:**
   - Debug endpoint: `/api/debug/refresh-token`
   - Useful for troubleshooting

### Re-authentication

When refresh token is invalid:
1. User sees "Please sign out and sign back in"
2. User goes to Google account connections
3. Removes DueSync access
4. Signs out from DueSync
5. Signs in again with fresh consent

---

## Google Calendar Integration

### Overview
Full two-way sync between DueSync tasks and Google Calendar events.

### Architecture

**File: `lib/google-calendar.ts`**
- `getCalendarClient(userId)`: Get authenticated Calendar API client
- `ensureValidToken(userId)`: Check and refresh tokens
- `createCalendarEvent(userId, task)`: Create calendar event
- `updateCalendarEvent(userId, eventId, task)`: Update event
- `deleteCalendarEvent(userId, eventId)`: Delete event
- `syncTaskWithCalendar(userId, task)`: Sync (create or update)
- `unsyncTaskFromCalendar(userId, googleEventId, taskId)`: Remove sync

### Event Details

When syncing a task to Google Calendar:
- **Summary**: Task title
- **Description**: Task description
- **Start Time**: Due date + due time (or 9:00 AM default)
- **End Time**: Start time + estimated time (or 30 min default)
- **Time Zone**: UTC
- **Reminders**:
  - Email: 24 hours before
  - Popup: 30 minutes before

### Error Handling

Common errors handled:
- No Google account connected (400)
- Token expired/invalid (401)
- Permission denied (403)
- Event not found (404)
- Calendar API errors (500)

### Troubleshooting

Debug endpoints available:
- `/api/debug/auth`: Check token status
- `/api/debug/refresh-token`: Test token refresh
- `/api/debug/clear-tokens`: Clear tokens for re-auth

See `docs/GOOGLE_CALENDAR_INTEGRATION.md` for complete guide.

---

## Development Workflow

### Environment Setup

1. **Clone repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (.env):**
   ```env
   # Database (Supabase)
   DATABASE_URL="postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

### Database Management

**View database:**
```bash
npx prisma studio
```

**Create migration:**
```bash
npx prisma migrate dev --name migration_name
```

**Reset database:**
```bash
npx prisma migrate reset
```

### Code Quality

**Type checking:**
```bash
npx tsc --noEmit
```

**Linting:**
```bash
npm run lint
```

### Production Build

```bash
npm run build
npm start
```

---

## Known Issues

### 1. Google Calendar Token Expiration
**Issue**: Refresh tokens can expire or be revoked by Google.

**Solution**:
- User must revoke access at Google account settings
- Sign out from DueSync
- Sign in again with fresh consent
- Use `/api/debug/clear-tokens` to clear old tokens

### 2. TypeScript Warnings
**Issue**: React type mismatches between dependencies.

**Impact**: Benign warnings, doesn't affect functionality.

**Solution**: Can be resolved by cleaning node_modules or using workspaces.

### 3. Edit Task Not Implemented
**Issue**: TaskCard has edit button but no edit dialog.

**Status**: Pending implementation.

### 4. Recurring Tasks Incomplete
**Issue**: Schema exists but no UI or generation logic.

**Status**: Week 3 - needs completion.

### 5. No Email Notifications
**Issue**: NotificationPreference schema exists but no email service.

**Status**: Week 3 - needs implementation.

---

## Future Enhancements

### Immediate (Week 3 Completion)
- Complete recurring tasks feature
- Build Focus Mode page
- Implement email notifications
- Add categories/tags management UI

### Short Term
- Edit task dialog
- Bulk task operations
- Task templates
- Keyboard shortcuts
- Dark mode
- Task notes/comments

### Medium Term
- Drag-and-drop task reordering
- Subtasks functionality
- Task dependencies
- Time tracking
- Calendar view
- Gantt chart view

### Long Term
- Mobile app (React Native)
- Desktop app (Electron)
- Team collaboration features
- Task sharing
- Real-time collaboration
- AI task suggestions
- Voice input
- Smart scheduling
- Analytics dashboard
- Export/import (CSV, JSON)
- Integrations (Slack, Trello, etc.)

---

## Project Credentials

### Database (Supabase)
- Project: duesync-dev
- URL: https://mxsjkvtwgnosabgxwrsb.supabase.co
- Region: AWS US East 1

### Google Cloud
- Project: DueSync
- Project ID: duesync-475306
- OAuth Client configured
- Calendar API enabled

### Security Notes
- All credentials stored in `.env` file
- `.env` is gitignored
- Never commit credentials to version control
- Use environment variables in production

---

## Contributing Guidelines

### Code Style
- Use TypeScript for all new files
- Follow existing naming conventions
- Use Prettier for formatting
- Add JSDoc comments for functions
- Keep components small and focused

### Component Guidelines
- Use 'use client' directive for interactive components
- Prefer Server Components when possible
- Use React Query for data fetching
- Implement proper loading states
- Handle errors gracefully

### Database Changes
- Always create Prisma migrations
- Test migrations locally first
- Document schema changes
- Update TypeScript types

### API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Validate input with Zod
- Handle errors consistently
- Add authentication checks

---

## Testing Strategy

### Manual Testing Checklist

**Authentication:**
- [ ] Can sign in with Google
- [ ] Can sign out
- [ ] Session persists on refresh
- [ ] Unauthorized requests are blocked

**Task Management:**
- [ ] Can create task with all fields
- [ ] Can create task with minimal fields
- [ ] Can view list of tasks
- [ ] Can toggle task completion
- [ ] Can delete task
- [ ] Can filter by status
- [ ] Can filter by priority
- [ ] Can search tasks

**Google Calendar:**
- [ ] Can sync task to calendar
- [ ] Event appears in Google Calendar
- [ ] Can unsync task from calendar
- [ ] Event is removed from Google Calendar
- [ ] Token refresh works automatically
- [ ] Re-authentication works when token invalid

**UI/UX:**
- [ ] Loading states appear correctly
- [ ] Toast notifications show for actions
- [ ] Priority colors display correctly
- [ ] Completed tasks show strikethrough
- [ ] Overdue tasks show indicator
- [ ] Responsive on mobile
- [ ] Forms validate correctly

---

## Deployment Guide

### Prerequisites
- PostgreSQL database (Supabase)
- Google OAuth credentials
- Vercel account (recommended) or other hosting

### Deployment Steps

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Configure environment variables:**
   - Add all variables from `.env`
   - Update NEXTAUTH_URL to production URL
   - Update GOOGLE_REDIRECT_URI to production callback

4. **Build and deploy**
5. **Run migrations on production database:**
   ```bash
   npx prisma migrate deploy
   ```

6. **Update Google OAuth:**
   - Add production URL to authorized redirect URIs
   - Update OAuth consent screen if needed

### Post-Deployment
- Test authentication flow
- Test calendar sync
- Monitor error logs
- Set up analytics (optional)

---

## Performance Optimization

### Current Optimizations
- React Query caching (1-minute stale time)
- Debounced search (300ms)
- Optimistic UI updates
- Server Components for static content
- Minimal client-side JavaScript

### Future Optimizations
- Implement pagination for large task lists
- Add virtual scrolling for performance
- Optimize images with Next.js Image
- Implement service worker for offline support
- Add CDN for static assets
- Database query optimization with indexes

---

## Security Considerations

### Current Security Measures
- Environment variables for sensitive data
- NextAuth session management
- Server-side authentication checks
- Input validation with Zod
- SQL injection prevention (Prisma)
- Row-Level Security (RLS) enabled on all user data tables
- XSS protection (React)
- CSRF protection (NextAuth)
- Distributed rate limiting (Redis/Upstash)
- Secure cron job endpoints (CRON_SECRET)

### Security Best Practices
- Never expose tokens client-side
- Always validate user ownership
- Use HTTPS in production
- Regular dependency updates (npm audit)
- Security audits and monitoring (Sentry recommended)
- Rotate secrets quarterly

---

## Support and Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://authjs.dev)
- [React Query Docs](https://tanstack.com/query)
- [Google Calendar API](https://developers.google.com/calendar)

### Internal Documentation
- `README.md` - Quick start guide
- `WEEK2_IMPLEMENTATION.md` - Week 2 details
- `docs/GOOGLE_CALENDAR_INTEGRATION.md` - Calendar guide
- `prisma/schema.prisma` - Database schema

### Getting Help
For issues or questions about this codebase, refer to this document first. It contains comprehensive information about the project structure, implementation details, and known issues.

---

## 🏢 About the Developer

**DueSync** is proudly developed and maintained by **WIK Technologies** - a software development company specializing in creating innovative productivity solutions.

For technical support or inquiries:
- Email: support@wiktechnology.com
- Website: [wiktechnology.com](https://wiktechnology.com)

---

**Last Updated**: November 2, 2025
**Current Version**: 1.0.0 (100% Complete - Production Ready)
**Developer**: WIK Technologies
**Status**: All features fully implemented and functional. Application is production-ready with Row-Level Security enabled.
**Optional Enhancements**: Performance optimization (code splitting, lazy loading), advanced recurring patterns, team collaboration features
**Next Steps**: Deploy to production, gather user feedback, monitor performance and errors

---

*© 2025 WIK Technologies. All rights reserved.*
