# TaskIQ - Week 3 Implementation Plan

> Complete guide for implementing all Week 3 features: Categories/Tags Management, Recurring Tasks, Focus Mode, and Email Notifications

**Status**: 20% Complete (Google Calendar Integration ✅)
**Target**: 100% Complete
**Estimated Time**: 10-15 hours
**Last Updated**: October 30, 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Phase 1: Categories & Tags Management](#phase-1-categories--tags-management)
3. [Phase 2: Recurring Tasks](#phase-2-recurring-tasks)
4. [Phase 3: Focus Mode](#phase-3-focus-mode)
5. [Phase 4: Email Notifications](#phase-4-email-notifications)
6. [Environment Setup](#environment-setup)
7. [Testing Checklist](#testing-checklist)
8. [File Summary](#file-summary)
9. [Implementation Timeline](#implementation-timeline)

---

## Overview

### Current Status

| Feature | Status | Progress | Priority |
|---------|--------|----------|----------|
| Google Calendar Integration | ✅ Complete | 100% | High |
| Categories & Tags Management | ❌ Not Started | 0% | High |
| Recurring Tasks | ⚠️ Partial | 20% | High |
| Focus Mode | ❌ Not Started | 0% | Medium |
| Email Notifications | ⚠️ Partial | 5% | Medium |

**Overall Week 3 Progress: 20%**

### Implementation Strategy

Features will be implemented in order of:
1. **Simplicity** - Following existing patterns
2. **User Impact** - Most visible features first
3. **Dependencies** - Features with no external dependencies first

**Order:**
1. Categories & Tags (easiest, high impact)
2. Recurring Tasks (medium complexity, high impact)
3. Focus Mode (new page, medium impact)
4. Email Notifications (external service, medium impact)

### Technology Decisions

Based on user preferences:
- **Email Service**: Nodemailer with Gmail (free, simple setup)
- **Timer Type**: Pomodoro (25-min work, 5-min break, customizable)
- **Recurring Logic**: Both automatic (cron) and on-demand generation

---

## Phase 1: Categories & Tags Management
**Estimated Time**: 2-3 hours
**Complexity**: Easy (follows existing patterns)
**Dependencies**: None

### Architecture Overview

```
User creates category/tag
    ↓
API validates with Zod
    ↓
Prisma saves to database
    ↓
React Query invalidates cache
    ↓
UI updates automatically
```

### Step 1.1: Create Validation Schemas

**File**: `lib/validations/category.ts`
```typescript
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
```

**File**: `lib/validations/tag.ts`
```typescript
import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
```

### Step 1.2: Build API Endpoints

**File**: `app/api/categories/route.ts`

<details>
<summary>Click to expand full code</summary>

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createCategorySchema } from '@/lib/validations/category';

// GET /api/categories - Fetch all user's categories
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate input
    const validatedData = createCategorySchema.parse(body);

    // Create category
    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ category, message: 'Category created' }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    console.error('Failed to create category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', details: error.message },
      { status: 500 }
    );
  }
}
```

</details>

**File**: `app/api/categories/[id]/route.ts` - Update and delete operations
**File**: `app/api/tags/route.ts` - Same structure as categories
**File**: `app/api/tags/[id]/route.ts` - Same structure as categories

> **Note**: Full code for all API routes follows the same pattern. Replace "category" with "tag" and "Category" with "Tag" for tag routes.

### Step 1.3: Create React Query Hooks

**File**: `lib/hooks/useCategories.ts`

<details>
<summary>Click to expand full code</summary>

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  _count?: { tasks: number };
}

// Fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.categories as Category[];
    },
  });
}

// Create category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
}

// Update category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ name: string; color: string }> }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
}

// Delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
}
```

</details>

**File**: `lib/hooks/useTags.ts` - Same structure, replace "category" with "tag"

### Step 1.4: Build UI Components

**File**: `components/ui/color-picker.tsx`

Simple color picker with preset colors and manual input:

```typescript
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const presetColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6',
  ];

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-16 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3B82F6"
          className="flex-1 font-mono uppercase"
          maxLength={7}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="h-8 w-8 rounded border-2 border-gray-200 transition-all hover:scale-110"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
```

**File**: `components/categories/CategoryManager.tsx`

Full category management dialog (create, edit, delete):

> See full implementation in the repository. Key features:
> - List all categories with task counts
> - Create/edit form with color picker
> - Delete with confirmation
> - Real-time updates with React Query

**File**: `components/tags/TagManager.tsx` - Same as CategoryManager

### Step 1.5: Integrate into QuickAddTask

**Modify**: `components/tasks/QuickAddTask.tsx`

Add category and tag selection fields to the form.

### Step 1.6: Add Management Buttons

**Modify**: `components/tasks/TaskDashboard.tsx`

Add buttons to open CategoryManager and TagManager dialogs.

---

## Phase 2: Recurring Tasks
**Estimated Time**: 2-3 hours
**Complexity**: Medium
**Dependencies**: None

### Architecture Overview

```
User creates recurring task
    ↓
Task saved with isRecurring=true
    ↓
On completion → Calculate next date
    ↓
Create new task instance
    ↓
Cron job also generates instances
```

### Step 2.1: Add UI Fields

**Modify**: `components/tasks/QuickAddTask.tsx`

Add checkbox and select for recurring options:

```typescript
import { RecurringPattern } from '@/types';
import { Repeat } from 'lucide-react';

// In form JSX:
<div className="space-y-3 border-t pt-3">
  <div className="flex items-center gap-2">
    <Checkbox
      id="isRecurring"
      checked={watch('isRecurring')}
      onCheckedChange={(checked) => {
        setValue('isRecurring', !!checked);
        if (!checked) setValue('recurringPattern', null);
      }}
    />
    <label htmlFor="isRecurring" className="flex items-center gap-2 cursor-pointer">
      <Repeat className="h-4 w-4" />
      <span className="font-medium">Make this recurring</span>
    </label>
  </div>

  {watch('isRecurring') && (
    <div>
      <Label htmlFor="recurringPattern">Repeat Pattern</Label>
      <Select
        value={watch('recurringPattern') || ''}
        onValueChange={(value) => setValue('recurringPattern', value as RecurringPattern)}
      >
        <SelectTrigger id="recurringPattern">
          <SelectValue placeholder="Select pattern" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={RecurringPattern.DAILY}>Daily</SelectItem>
          <SelectItem value={RecurringPattern.WEEKLY}>Weekly</SelectItem>
          <SelectItem value={RecurringPattern.MONTHLY}>Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )}
</div>
```

### Step 2.2: Create Utility Function

**Modify**: `lib/utils.ts`

Add date calculation function:

```typescript
import { RecurringPattern } from '@/types';
import { addDays, addWeeks, addMonths } from 'date-fns';

/**
 * Calculate the next due date for a recurring task
 */
export function calculateNextRecurringDate(
  currentDate: Date,
  pattern: RecurringPattern
): Date {
  switch (pattern) {
    case RecurringPattern.DAILY:
      return addDays(currentDate, 1);
    case RecurringPattern.WEEKLY:
      return addWeeks(currentDate, 1);
    case RecurringPattern.MONTHLY:
      return addMonths(currentDate, 1);
    default:
      throw new Error(`Invalid recurring pattern: ${pattern}`);
  }
}
```

### Step 2.3: Add Generation Logic

**Modify**: `app/api/tasks/[id]/route.ts`

In the PATCH handler, after updating the task:

```typescript
import { calculateNextRecurringDate } from '@/lib/utils';

// After task update, check if completed and recurring
if (
  validatedData.status === Status.COMPLETED &&
  task.isRecurring &&
  task.recurringPattern
) {
  try {
    console.log('Generating next recurring task instance...');

    const nextDueDate = calculateNextRecurringDate(
      task.dueDate,
      task.recurringPattern
    );

    await prisma.task.create({
      data: {
        userId: task.userId,
        title: task.title,
        description: task.description,
        dueDate: nextDueDate,
        dueTime: task.dueTime,
        priority: task.priority,
        status: Status.PENDING,
        categoryId: task.categoryId,
        isRecurring: true,
        recurringPattern: task.recurringPattern,
        estimatedTime: task.estimatedTime,
      },
    });

    console.log('Next recurring task created');
  } catch (error) {
    console.error('Failed to generate recurring task:', error);
  }
}
```

### Step 2.4: Create Cron Job

**File**: `app/api/cron/generate-recurring/route.ts`

Automatic generation of recurring tasks:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateNextRecurringDate } from '@/lib/utils';
import { Status } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting recurring task generation...');

    const completedRecurringTasks = await prisma.task.findMany({
      where: {
        isRecurring: true,
        recurringPattern: { not: null },
        status: Status.COMPLETED,
      },
    });

    let generated = 0;

    for (const task of completedRecurringTasks) {
      try {
        const nextDueDate = calculateNextRecurringDate(
          task.dueDate,
          task.recurringPattern!
        );

        // Check if next instance already exists
        const existingNext = await prisma.task.findFirst({
          where: {
            userId: task.userId,
            title: task.title,
            dueDate: nextDueDate,
            isRecurring: true,
          },
        });

        if (existingNext) continue;

        // Create next instance
        await prisma.task.create({
          data: {
            userId: task.userId,
            title: task.title,
            description: task.description,
            dueDate: nextDueDate,
            dueTime: task.dueTime,
            priority: task.priority,
            status: Status.PENDING,
            categoryId: task.categoryId,
            isRecurring: true,
            recurringPattern: task.recurringPattern,
            estimatedTime: task.estimatedTime,
          },
        });

        generated++;
      } catch (error) {
        console.error(`Failed to generate for task ${task.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${generated} recurring task instances`,
      generated,
    });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
```

### Step 2.5: Add Visual Indicator

**Modify**: `components/tasks/TaskCard.tsx`

Add recurring icon:

```typescript
import { Repeat } from 'lucide-react';

// In JSX, near due date:
{task.isRecurring && (
  <div className="flex items-center gap-1 text-blue-600">
    <Repeat className="h-3 w-3" />
    <span className="text-xs">
      {task.recurringPattern?.toLowerCase()}
    </span>
  </div>
)}
```

---

## Phase 3: Focus Mode
**Estimated Time**: 2-3 hours
**Complexity**: Medium
**Dependencies**: None

### Architecture Overview

```
User opens Focus Mode
    ↓
Load today's tasks (API exists)
    ↓
Show one task at a time
    ↓
Pomodoro timer for focus
    ↓
Complete → Next task
```

### Step 3.1: Create Focus Page

**File**: `app/focus/page.tsx`

```typescript
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { FocusModeView } from '@/components/focus/FocusModeView';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function FocusPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main>
        <FocusModeView />
      </main>
    </div>
  );
}
```

### Step 3.2: Build Pomodoro Timer

**File**: `components/focus/PomodoroTimer.tsx`

Full Pomodoro timer with settings:

<details>
<summary>Click to expand timer implementation</summary>

Key features:
- 25-minute work sessions
- 5-minute breaks
- Customizable durations
- Visual circular progress
- Start/pause/reset controls
- Sound notifications
- Settings dialog

</details>

### Step 3.3: Build Focus View

**File**: `components/focus/FocusModeView.tsx`

Distraction-free task view with timer:

```typescript
'use client';

import { useState } from 'react';
import { useTodayTasks, useToggleComplete } from '@/lib/hooks/useTasks';
import { PomodoroTimer } from './PomodoroTimer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export function FocusModeView() {
  const { data, isLoading } = useTodayTasks();
  const [currentIndex, setCurrentIndex] = useState(0);
  const toggleComplete = useToggleComplete();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const tasks = data?.tasks || [];

  if (tasks.length === 0) {
    return <div>No tasks for today!</div>;
  }

  const currentTask = tasks[currentIndex];

  const handleComplete = async () => {
    await toggleComplete.mutateAsync({
      id: currentTask.id,
      completed: true,
    });

    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Task counter */}
        <p className="text-center text-gray-400 mb-6">
          Task {currentIndex + 1} of {tasks.length}
        </p>

        {/* Current task */}
        <div className="bg-gray-800 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">{currentTask.title}</h2>
          {currentTask.description && (
            <p className="text-gray-300 mb-6">{currentTask.description}</p>
          )}

          {/* Timer */}
          <div className="flex justify-center my-8">
            <PomodoroTimer onComplete={() => {}} />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-5 w-5 mr-2" />
              Complete Task
            </Button>

            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.min(tasks.length - 1, currentIndex + 1))}
              disabled={currentIndex === tasks.length - 1}
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 3.4: Add Navigation

**Modify**: `components/tasks/TaskDashboard.tsx`

Add Focus Mode link:

```typescript
import Link from 'next/link';
import { Target } from 'lucide-react';

<Link href="/focus">
  <Button variant="outline">
    <Target className="h-4 w-4 mr-2" />
    Focus Mode
  </Button>
</Link>
```

---

## Phase 4: Email Notifications
**Estimated Time**: 3-4 hours
**Complexity**: Higher
**Dependencies**: Gmail, Nodemailer

### Architecture Overview

```
User sets preferences
    ↓
Cron job runs hourly
    ↓
Check time matches preferences
    ↓
Generate email from template
    ↓
Send via Nodemailer + Gmail
```

### Step 4.1: Install Dependencies

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### Step 4.2: Setup Gmail

**Instructions**:
1. Go to https://myaccount.google.com
2. Security → 2-Step Verification (enable if not enabled)
3. Scroll to "App passwords"
4. Select app: Mail, device: Other (Custom name)
5. Enter "TaskIQ"
6. Copy 16-character password
7. Add to `.env`:

```env
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

### Step 4.3: Create Email Templates

**File**: `emails/DailyTaskSummary.tsx`

```typescript
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface Task {
  id: string;
  title: string;
  priority: string;
  dueTime?: string | null;
}

interface DailyTaskSummaryProps {
  userName: string;
  tasks: Task[];
  date: string;
}

export default function DailyTaskSummary({
  userName,
  tasks,
  date,
}: DailyTaskSummaryProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc' }}>
        <Container style={{ backgroundColor: '#fff', padding: '20px' }}>
          <Heading>Good morning, {userName}!</Heading>
          <Text>
            You have {tasks.length} task{tasks.length !== 1 ? 's' : ''} for {date}.
          </Text>

          <Section>
            {tasks.map((task) => (
              <div key={task.id} style={{ marginBottom: '12px' }}>
                <Text style={{ fontWeight: '500' }}>{task.title}</Text>
                {task.dueTime && (
                  <Text style={{ fontSize: '14px', color: '#666' }}>
                    Due at {task.dueTime}
                  </Text>
                )}
              </div>
            ))}
          </Section>

          <Hr />

          <Text>
            <Link href={process.env.NEXTAUTH_URL}>Open TaskIQ</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

**File**: `emails/WeeklyTaskSummary.tsx` - Similar structure

### Step 4.4: Build Email Service

**File**: `lib/email.ts`

```typescript
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import { prisma } from '@/lib/prisma';
import DailyTaskSummary from '@/emails/DailyTaskSummary';
import { Status } from '@/types';
import { format, startOfDay, endOfDay } from 'date-fns';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendDailyTaskEmail(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { notifications: true },
    });

    if (!user?.email || !user.notifications?.dailyEmailEnabled) {
      return { success: false, reason: 'disabled' };
    }

    const today = new Date();
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: Status.PENDING,
        dueDate: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      orderBy: [
        { priority: 'asc' },
        { dueTime: 'asc' },
      ],
    });

    if (tasks.length === 0) {
      return { success: false, reason: 'no_tasks' };
    }

    const emailHtml = render(
      DailyTaskSummary({
        userName: user.name || 'there',
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          dueTime: t.dueTime,
        })),
        date: format(today, 'EEEE, MMMM d'),
      })
    );

    await transporter.sendMail({
      from: `"TaskIQ" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: `Your tasks for ${format(today, 'EEEE, MMM d')} (${tasks.length} tasks)`,
      html: emailHtml,
    });

    console.log(`Daily email sent to ${user.email}`);
    return { success: true, taskCount: tasks.length };
  } catch (error) {
    console.error('Failed to send daily email:', error);
    throw error;
  }
}
```

### Step 4.5: Create Preferences API

**File**: `app/api/notifications/preferences/route.ts`

GET and PATCH handlers for notification preferences.

### Step 4.6: Build Preferences UI

**File**: `components/notifications/NotificationPreferences.tsx`

Dialog with toggles for email settings, time pickers, and test button.

### Step 4.7: Create Cron Job

**File**: `app/api/cron/send-notifications/route.ts`

Hourly cron job to check and send notifications.

---

## Environment Setup

### Required Environment Variables

Add to `.env`:

```env
# Gmail for Email Notifications
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"

# Cron Job Security
CRON_SECRET="your-random-secret-string-here"
```

### Vercel Cron Configuration

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-recurring",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/send-notifications",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Testing Checklist

### Categories & Tags
- [ ] Create category
- [ ] Edit category
- [ ] Delete category
- [ ] Create tag
- [ ] Assign to task
- [ ] Display in TaskCard

### Recurring Tasks
- [ ] Create recurring task
- [ ] Complete generates next
- [ ] Dates calculated correctly
- [ ] Indicator shows in UI
- [ ] Cron job works

### Focus Mode
- [ ] Page loads
- [ ] Timer counts down
- [ ] Can complete tasks
- [ ] Navigation works
- [ ] Handles empty state

### Email Notifications
- [ ] Can save preferences
- [ ] Test email works
- [ ] Daily email sends
- [ ] Weekly email sends
- [ ] Cron job runs

---

## File Summary

### New Files (24)
1. `lib/validations/category.ts`
2. `lib/validations/tag.ts`
3. `lib/hooks/useCategories.ts`
4. `lib/hooks/useTags.ts`
5. `lib/email.ts`
6. `app/api/categories/route.ts`
7. `app/api/categories/[id]/route.ts`
8. `app/api/tags/route.ts`
9. `app/api/tags/[id]/route.ts`
10. `app/api/notifications/preferences/route.ts`
11. `app/api/notifications/send-daily/route.ts`
12. `app/api/notifications/send-weekly/route.ts`
13. `app/api/cron/generate-recurring/route.ts`
14. `app/api/cron/send-notifications/route.ts`
15. `app/focus/page.tsx`
16. `components/categories/CategoryManager.tsx`
17. `components/tags/TagManager.tsx`
18. `components/ui/color-picker.tsx`
19. `components/focus/PomodoroTimer.tsx`
20. `components/focus/FocusModeView.tsx`
21. `components/notifications/NotificationPreferences.tsx`
22. `emails/DailyTaskSummary.tsx`
23. `emails/WeeklyTaskSummary.tsx`
24. `vercel.json`

### Modified Files (5)
1. `components/tasks/QuickAddTask.tsx`
2. `components/tasks/TaskDashboard.tsx`
3. `components/tasks/TaskCard.tsx`
4. `app/api/tasks/[id]/route.ts`
5. `lib/utils.ts`

---

## Implementation Timeline

### Day 1 (4-5 hours)
**Morning**: Categories & Tags
- Validation schemas
- API routes
- React Query hooks
- UI components

**Afternoon**: Recurring Tasks
- UI modifications
- Utility function
- Generation logic
- Cron job

### Day 2 (4-5 hours)
**Morning**: Focus Mode
- Page creation
- Pomodoro timer
- Focus view

**Afternoon**: Email Setup
- Email service
- Templates
- Test sending

### Day 3 (3-4 hours)
**Morning**: Email Completion
- Preferences API
- Preferences UI
- Cron job

**Afternoon**: Testing & Documentation
- Test all features
- Update docs
- Deploy

**Total: 11-14 hours**

---

## Success Criteria

Week 3 is complete when:

✅ All 24 files created
✅ All 5 files modified
✅ All tests pass
✅ Documentation updated
✅ Features deployed
✅ Cron jobs configured
✅ No major bugs

---

## Next Steps

1. Update README.md to show 100% Week 3 completion
2. Update CLAUDE.md with new features
3. Test in production
4. Plan Week 4 enhancements

---

**Happy Coding! 🚀**

*For questions or clarifications, refer to CLAUDE.md or existing code patterns.*
