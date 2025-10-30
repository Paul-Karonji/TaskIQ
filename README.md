# TaskIQ - Smart Task Management

A modern, intelligent task management application built with Next.js 15, React Query, Prisma, and NextAuth.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use a cloud service like Neon, Supabase, or Railway)
- Google OAuth credentials (already configured in Week 1)

### Installation & Setup

1. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

2. **Environment variables**

   Your `.env` file should already be configured with:
   ```env
   DATABASE_URL="your-postgresql-url"
   DIRECT_URL="your-direct-url"

   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Run database migrations** (if not already done)
   ```bash
   npx prisma migrate dev
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
TaskIQ/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth API routes
│   │   │   └── [...nextauth]/
│   │   ├── tasks/         # Task CRUD API routes
│   │   │   ├── route.ts   # GET all, POST create
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts      # GET, PATCH, DELETE
│   │   │   │   └── calendar/     # Calendar sync endpoints
│   │   │   └── today/     # Today's tasks endpoint
│   │   └── debug/         # Debug endpoints
│   │       ├── auth/
│   │       ├── refresh-token/
│   │       └── clear-tokens/
│   ├── login/             # Login page
│   ├── globals.css        # Global styles with TaskIQ theme
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main dashboard with auth
├── components/
│   ├── providers/         # React Query provider
│   ├── tasks/             # Task components
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskDashboard.tsx
│   │   ├── QuickAddTask.tsx
│   │   ├── TaskFilters.tsx
│   │   └── CalendarSyncButton.tsx  # NEW
│   ├── ui/                # UI primitives (shadcn/ui)
│   └── Logo.tsx           # App logo
├── lib/
│   ├── hooks/             # Custom React hooks
│   │   ├── useTasks.ts
│   │   └── useCalendarSync.ts     # NEW
│   ├── validations/       # Zod schemas
│   ├── auth.ts            # Auth helpers
│   ├── prisma.ts          # Prisma client
│   ├── google-calendar.ts # Google Calendar API      # NEW
│   └── utils.ts           # Utility functions
├── types/
│   ├── index.ts           # TypeScript types
│   └── next-auth.d.ts     # NextAuth type extensions # NEW
├── prisma/
│   └── schema.prisma      # Database schema
├── docs/
│   └── GOOGLE_CALENDAR_INTEGRATION.md  # NEW
├── auth.ts                # NextAuth configuration
├── CLAUDE.md              # AI assistant documentation # NEW
├── WEEK2_IMPLEMENTATION.md # Week 2 docs
├── README.md              # This file
└── .env                   # Environment variables (gitignored)
```

## ✨ Features

### Week 1 (Complete) ✅
- ✅ Next.js 15 + TypeScript setup
- ✅ PostgreSQL database with Prisma
- ✅ Google OAuth authentication
- ✅ Session management with NextAuth
- ✅ Supabase PostgreSQL integration
- ✅ Environment configuration

### Week 2 (Complete) ✅
- ✅ Task CRUD operations (Create, Read, Update, Delete)
- ✅ Priority levels (High, Medium, Low) with color coding
- ✅ Task filtering by status and priority
- ✅ Search functionality
- ✅ Task statistics dashboard
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states and animations
- ✅ React Query integration for data fetching
- ✅ Form validation with Zod
- ✅ Optimistic UI updates

### Week 3 (In Progress) 🔄 20%
- ✅ **Google Calendar Integration** (Complete)
  - Sync tasks to Google Calendar
  - Automatic token refresh
  - Event creation, updates, and deletion
  - Calendar sync button in task cards
  - Debug endpoints for troubleshooting
- ⚠️ **Recurring Tasks** (Partial - Schema only)
- ❌ **Focus Mode** (Not started)
- ❌ **Email Notifications** (Not started)
- ❌ **Categories/Tags Management** (Display only)

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Priority High**: Red (#EF4444)
- **Priority Medium**: Amber (#F59E0B)
- **Priority Low**: Green (#10B981)
- **Background**: Light Gray (#F9FAFB)

### Typography
- **Font**: Inter
- Optimized for readability and modern appearance

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

# Code Quality
npx tsc --noEmit          # Check TypeScript errors
npm run lint              # Run ESLint
```

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js 18+
- **Package Manager**: npm

### Frontend
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Form Handling**: React Hook Form
- **Validation**: Zod

### Backend & Database
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.2
- **Authentication**: NextAuth v5 (beta)
- **OAuth Provider**: Google OAuth 2.0

### State & API
- **State Management**: React Query (TanStack Query v5)
- **External APIs**: Google Calendar API v3 (googleapis)
- **HTTP Client**: Built into googleapis

### Development
- **Type Checking**: TypeScript Compiler
- **Linting**: ESLint
- **Code Quality**: Prettier (configured)

## 📖 API Routes

### Authentication
- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/callback/google` - Google OAuth callback

### Tasks
- `GET /api/tasks` - Fetch all tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get single task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `GET /api/tasks/today` - Get today's tasks for Focus Mode

### Google Calendar Integration
- `POST /api/tasks/[id]/calendar` - Sync task to Google Calendar
- `DELETE /api/tasks/[id]/calendar` - Remove sync from Google Calendar

### Debug Endpoints
- `GET /api/debug/auth` - Check authentication status and token validity
- `GET /api/debug/refresh-token` - Manually test token refresh
- `GET /api/debug/clear-tokens` - Clear tokens for re-authentication

### Query Parameters
- `status` - Filter by status (PENDING, COMPLETED, ARCHIVED)
- `priority` - Filter by priority (HIGH, MEDIUM, LOW)
- `search` - Search in title and description
- `categoryId` - Filter by category
- `page` & `limit` - Pagination

## 🧪 Testing

Manual testing checklist available in `WEEK2_IMPLEMENTATION.md`

## 🚧 Roadmap

### Week 3 (Current - 20% Complete)
- [x] **Google Calendar integration** ✅
  - [x] OAuth2 with calendar scope
  - [x] Sync/unsync tasks to calendar
  - [x] Token refresh mechanism
  - [x] Debug endpoints
- [ ] **Recurring tasks** ⚠️
  - [x] Database schema
  - [ ] UI for creating recurring tasks
  - [ ] Task generation logic
  - [ ] Cron job for scheduling
- [ ] **Focus Mode page**
  - [x] API endpoint (/api/tasks/today)
  - [ ] Focus Mode UI page
  - [ ] Timer/Pomodoro functionality
- [ ] **Email notifications**
  - [x] Database schema
  - [ ] Email service integration
  - [ ] Email templates
  - [ ] Notification scheduler
  - [ ] Preferences UI
- [ ] **Categories and tags management UI**
  - [x] Database schema
  - [x] Display in task cards
  - [ ] Creation and edit UI
  - [ ] Color picker
  - [ ] API endpoints

### Future Enhancements
- [ ] Dark mode
- [ ] Drag-and-drop task reordering
- [ ] Subtasks
- [ ] Task notes/comments
- [ ] Keyboard shortcuts
- [ ] Export/import tasks (CSV, JSON)
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Time tracking
- [ ] Analytics dashboard
- [ ] AI-powered task suggestions
- [ ] Integrations (Slack, Trello, etc.)

## 📝 Documentation

- **`CLAUDE.md`** - Comprehensive project documentation for AI assistants and developers
- **`WEEK2_IMPLEMENTATION.md`** - Detailed Week 2 implementation notes
- **`docs/GOOGLE_CALENDAR_INTEGRATION.md`** - Complete Google Calendar integration guide
- **`prisma/schema.prisma`** - Database schema with inline documentation
- **`.env.example`** - Environment variables template (create from your .env)

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

### For AI Assistants
Refer to `CLAUDE.md` for comprehensive project documentation including:
- Complete architecture overview
- Database schema details
- API documentation with examples
- Implementation status for all features
- Known issues and troubleshooting guides
- Code guidelines and patterns

## 📄 License

MIT License - free to use for learning purposes

---

## 🎯 Current Project Status

**Overall Progress**: Week 3 - 20% Complete

| Week | Status | Completion |
|------|--------|------------|
| Week 1 - Setup | ✅ Complete | 100% |
| Week 2 - Task Management | ✅ Complete | 100% |
| Week 3 - Advanced Features | 🔄 In Progress | 20% |

**Latest Achievement**: Google Calendar Integration ✅
- Tasks can now be synced to Google Calendar
- Automatic token refresh handles expired sessions
- Full two-way sync with event creation, updates, and deletion

**Next Milestone**: Complete remaining Week 3 features
- Recurring tasks UI and logic
- Focus Mode page with timer
- Email notification system
- Categories/Tags management interface

---

## 🔍 Key Features Highlight

### Task Management
Create, edit, complete, and delete tasks with rich details including priority levels, due dates, descriptions, and estimated time.

### Google Calendar Sync
One-click sync to Google Calendar with automatic event creation, updates, and intelligent token management.

### Smart Filtering
Search tasks by title/description, filter by status (pending/completed), priority level, and categories.

### Real-time Updates
Optimistic UI updates with React Query ensure instant feedback while maintaining data consistency.

### Responsive Design
Beautiful, mobile-friendly interface built with Tailwind CSS and Radix UI components.

---

## 💡 Tips for Developers

1. **Database Changes**: Always create Prisma migrations (`npx prisma migrate dev`)
2. **Environment Setup**: Copy `.env` and update with your credentials
3. **Google Calendar**: Ensure calendar scope is granted during OAuth
4. **Token Issues**: Use `/api/debug/auth` to check token status
5. **Type Safety**: Run `npx tsc --noEmit` to check for TypeScript errors
6. **Documentation**: Read `CLAUDE.md` for in-depth technical details

---

**Built with ❤️ using Next.js 15, TypeScript, Prisma, and React Query**

*Last Updated: October 30, 2025*
