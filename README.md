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
│   │   └── tasks/         # Task CRUD API routes
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
│   │   └── TaskFilters.tsx
│   └── ui/                # UI primitives
├── lib/
│   ├── hooks/             # Custom React hooks
│   ├── validations/       # Zod schemas
│   ├── auth.ts            # Auth helpers
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript types
├── prisma/
│   └── schema.prisma      # Database schema
└── auth.ts                # NextAuth configuration
```

## ✨ Features

### Week 1 (Complete)
- ✅ Next.js 15 + TypeScript setup
- ✅ PostgreSQL database with Prisma
- ✅ Google OAuth authentication
- ✅ Session management with NextAuth

### Week 2 (Complete)
- ✅ Task CRUD operations (Create, Read, Update, Delete)
- ✅ Priority levels (High, Medium, Low) with color coding
- ✅ Task filtering by status and priority
- ✅ Search functionality
- ✅ Task statistics dashboard
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states and animations

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

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 with Google OAuth
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **UI Components**: Radix UI primitives
- **Notifications**: Sonner

## 📖 API Routes

### Authentication
- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signout` - Sign out

### Tasks
- `GET /api/tasks` - Fetch all tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get single task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `GET /api/tasks/today` - Get today's tasks

### Query Parameters
- `status` - Filter by status (PENDING, COMPLETED, ARCHIVED)
- `priority` - Filter by priority (HIGH, MEDIUM, LOW)
- `search` - Search in title and description
- `page` & `limit` - Pagination

## 🧪 Testing

Manual testing checklist available in `WEEK2_IMPLEMENTATION.md`

## 🚧 Roadmap

### Week 3 (Upcoming)
- [ ] Google Calendar integration
- [ ] Recurring tasks
- [ ] Focus Mode page
- [ ] Email notifications
- [ ] Categories and tags management UI

### Future Enhancements
- [ ] Dark mode
- [ ] Drag-and-drop task reordering
- [ ] Subtasks
- [ ] Task notes/comments
- [ ] Keyboard shortcuts
- [ ] Export/import tasks
- [ ] Mobile app

## 📝 Documentation

- `WEEK2_IMPLEMENTATION.md` - Detailed Week 2 implementation notes
- `prisma/schema.prisma` - Database schema documentation

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

## 📄 License

MIT License - free to use for learning purposes

---

**Current Status**: Week 2 Complete ✅
**Next Up**: Week 3 - Google Calendar Integration & Recurring Tasks

Built with ❤️ using Next.js, TypeScript, and Prisma
