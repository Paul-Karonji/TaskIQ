# Recurring Tasks Feature

**Status**: ✅ 100% Complete (FULLY IMPLEMENTED)
**Priority**: Complete
**Last Updated**: October 31, 2025

## Overview
Allow users to create tasks that automatically repeat on a schedule (daily, weekly, monthly). When a recurring task is completed, a new instance is automatically created based on the pattern.

---

## Implementation Status

### ✅ FULLY IMPLEMENTED (100%)

#### 1. Database Schema
**File**: `prisma/schema.prisma`

```prisma
enum RecurringPattern {
  DAILY
  WEEKLY
  MONTHLY
}

model Task {
  // ... other fields
  isRecurring       Boolean            @default(false)
  recurringPattern  RecurringPattern?
  // ... other fields
}
```

**Status**: Schema is complete and migrated to database.

#### 2. Type Definitions
**File**: `types/index.ts`

```typescript
import { RecurringPattern } from '@prisma/client';

export interface Task {
  // ... other fields
  isRecurring: boolean;
  recurringPattern?: RecurringPattern | null;
  // ... other fields
}
```

**Status**: Types are defined and exported.

#### 3. UI Components - QuickAddTask Form
**File**: `components/tasks/QuickAddTask.tsx` (Lines 280-315)

**Implementation:**
```tsx
{/* Recurring Task Checkbox */}
<div className="flex items-center space-x-2">
  <Checkbox
    id="isRecurring"
    checked={isRecurring}
    onCheckedChange={(checked) => {
      setValue('isRecurring', checked as boolean);
      if (!checked) {
        setValue('recurringPattern', null);
      }
    }}
  />
  <Label htmlFor="isRecurring" className="flex items-center gap-2">
    <Repeat className="h-4 w-4" />
    Recurring Task
  </Label>
</div>

{/* Pattern Selector (shown when isRecurring is true) */}
{isRecurring && (
  <div>
    <Label htmlFor="recurringPattern">Recurring Pattern</Label>
    <Select
      value={recurringPattern || undefined}
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
```

**Status**: ✅ Fully implemented with checkbox and pattern selector dropdown.

#### 4. Cron Job - Automatic Task Generation
**File**: `app/api/cron/generate-recurring/route.ts`

**Features:**
- Runs hourly via Vercel cron (`vercel.json`)
- Finds all completed recurring tasks
- Calculates next due date using `calculateNextRecurringDate()`
- Smart duplicate detection (prevents creating existing instances)
- Only generates if next due date is today or past
- Copies all task properties (title, description, category, estimated time, etc.)
- Sets new task status to PENDING
- Comprehensive error handling and logging

**Status**: ✅ Fully functional with smart logic.

#### 5. Utility Functions
**File**: `lib/utils.ts`

**Function**: `calculateNextRecurringDate(currentDate, pattern)`
- DAILY: Adds 1 day
- WEEKLY: Adds 7 days
- MONTHLY: Adds 1 month (handles month-end dates correctly)

**Status**: ✅ Complete and tested.

#### 6. Visual Indicators
**File**: `components/tasks/TaskCard.tsx`

**Implementation:**
- Shows Repeat icon for recurring tasks
- Pattern label displayed (Daily/Weekly/Monthly)

**Status**: ✅ Visual indicators displayed.

---

## How It Works

### 1. Creating a Recurring Task

User creates a task via QuickAddTask:
1. Fills in task details (title, description, due date, etc.)
2. Checks "Recurring Task" checkbox
3. Selects pattern (Daily, Weekly, or Monthly)
4. Submits form

Task is created with:
```json
{
  "isRecurring": true,
  "recurringPattern": "DAILY" | "WEEKLY" | "MONTHLY",
  "status": "PENDING"
}
```

### 2. Completing a Recurring Task

When user marks a recurring task as complete:
1. Task status changes to COMPLETED
2. `completedAt` timestamp is set
3. Task remains in database for history

### 3. Automatic Generation (Cron Job)

Every hour, cron job runs:
1. Finds all completed recurring tasks
2. For each task:
   - Calculates next due date based on pattern
   - Checks if pending instance already exists (duplicate detection)
   - If next due date is today or past AND no duplicate exists:
     - Creates new task with PENDING status
     - Copies all properties from original
     - Logs generation for monitoring

### 4. Pattern Calculation

- **DAILY**: Original due date + 1 day
- **WEEKLY**: Original due date + 7 days
- **MONTHLY**: Original due date + 1 month (e.g., Jan 15 → Feb 15)
  - Handles month-end correctly (e.g., Jan 31 → Feb 28)

---

## Vercel Cron Configuration

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-recurring",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule**: Runs every hour on the hour (0th minute)

---

## Future Enhancements (Optional)

While the core feature is 100% complete, these enhancements could be added:

### 1. Advanced Patterns
- Skip weekends (for work tasks)
- Custom intervals (every 2 days, every 3 weeks, etc.)
- Specific days of week (e.g., Monday and Wednesday)
- End date for recurring series

### 2. UI Improvements
- Visual calendar showing future occurrences
- Edit recurring series (update all future instances)
- Delete series vs. single instance

### 3. Notifications
- Notify user when new recurring instance is created
- Show upcoming recurring tasks in separate section

---

## Testing Checklist

- ✅ Can create recurring task with DAILY pattern
- ✅ Can create recurring task with WEEKLY pattern
- ✅ Can create recurring task with MONTHLY pattern
- ✅ Checkbox toggles pattern selector visibility
- ✅ Pattern selector shows all 3 options
- ✅ Task is created with correct `isRecurring` and `recurringPattern` values
- ✅ Cron job runs hourly
- ✅ Next instance is generated when due date arrives
- ✅ Duplicate detection prevents multiple instances
- ✅ calculateNextRecurringDate works for all patterns
- ✅ Recurring icon/label shows in TaskCard
- ✅ All task properties are copied to new instance

---

## Summary

The Recurring Tasks feature is **100% complete and functional**. Users can:
- Create recurring tasks with daily, weekly, or monthly patterns
- Visual UI with checkbox and pattern selector in QuickAddTask
- Automatic generation via hourly cron job
- Smart duplicate detection
- Full task property copying to new instances

The feature is production-ready and requires no additional work for core functionality. Only optional enhancements remain for future consideration.
└─────────────────────────────────────────┘
```

#### B. Recurring Badge in TaskCard
**File to modify**: `components/tasks/TaskCard.tsx`

**Required Changes:**
- Show recurring icon (🔄) badge if `task.isRecurring === true`
- Display pattern in tooltip: "Repeats Daily/Weekly/Monthly"

**Example:**
```tsx
{task.isRecurring && (
  <Badge variant="outline" className="gap-1">
    <Repeat className="h-3 w-3" />
    {task.recurringPattern}
  </Badge>
)}
```

#### C. Edit Recurring Task Dialog
**New file**: `components/tasks/EditRecurringTaskDialog.tsx`

**Features:**
- Edit recurring pattern
- Option to apply changes to:
  - Only this instance
  - This and future instances
  - All instances
- Delete recurring task:
  - Delete only this instance
  - Delete entire series

---

### 2. Backend Logic (0%)

#### A. Task Generation Service
**New file**: `lib/recurring-tasks.ts`

**Functions:**

```typescript
/**
 * Generate next instance of recurring task
 */
export async function generateNextRecurringTask(
  completedTask: Task
): Promise<Task | null> {
  if (!completedTask.isRecurring || !completedTask.recurringPattern) {
    return null;
  }

  const nextDueDate = calculateNextDueDate(
    completedTask.dueDate,
    completedTask.recurringPattern
  );

  const newTask = await prisma.task.create({
    data: {
      userId: completedTask.userId,
      title: completedTask.title,
      description: completedTask.description,
      dueDate: nextDueDate,
      dueTime: completedTask.dueTime,
      priority: completedTask.priority,
      categoryId: completedTask.categoryId,
      isRecurring: true,
      recurringPattern: completedTask.recurringPattern,
      estimatedTime: completedTask.estimatedTime,
      status: 'PENDING',
    },
  });

  return newTask;
}

/**
 * Calculate next due date based on pattern
 */
function calculateNextDueDate(
  currentDueDate: Date,
  pattern: RecurringPattern
): Date {
  const next = new Date(currentDueDate);

  switch (pattern) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}

/**
 * Stop recurring task (convert to one-time)
 */
export async function stopRecurring(taskId: string): Promise<Task> {
  return await prisma.task.update({
    where: { id: taskId },
    data: {
      isRecurring: false,
      recurringPattern: null,
    },
  });
}
```

#### B. Modify Task Completion Endpoint
**File to modify**: `app/api/tasks/[id]/route.ts` (PATCH endpoint)

**Changes:**
When marking a recurring task as completed:
1. Complete the current instance
2. Generate next instance automatically
3. Return both tasks in response

```typescript
// In PATCH handler
if (status === 'COMPLETED' && task.isRecurring) {
  // Complete current task
  const completedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  // Generate next instance
  const nextTask = await generateNextRecurringTask(completedTask);

  return NextResponse.json({
    completedTask,
    nextTask,
    message: 'Task completed. Next occurrence created.',
  });
}
```

---

### 3. Validation (0%)

#### Update Zod Schemas
**File to modify**: `lib/validations/task.ts`

```typescript
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  dueTime: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  categoryId: z.string().optional(),
  estimatedTime: z.number().int().positive().optional(),

  // 🆕 Recurring fields
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
}).refine(
  (data) => {
    // If isRecurring is true, recurringPattern must be provided
    if (data.isRecurring && !data.recurringPattern) {
      return false;
    }
    return true;
  },
  {
    message: 'Recurring pattern is required when task is recurring',
    path: ['recurringPattern'],
  }
);
```

---

### 4. Cron Job for Orphaned Tasks (0%)

**New file**: `app/api/cron/generate-recurring/route.ts`

**Purpose**: Safety net to generate recurring tasks if completion hook fails

```typescript
/**
 * Runs every day at 2:00 AM
 * Checks for completed recurring tasks without next instances
 * Generates missing instances
 */
export async function GET(request: NextRequest) {
  // Auth check with CRON_SECRET

  const orphanedTasks = await prisma.task.findMany({
    where: {
      status: 'COMPLETED',
      isRecurring: true,
      completedAt: {
        lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Completed >24h ago
      },
    },
  });

  for (const task of orphanedTasks) {
    // Check if next instance exists
    const existingNext = await prisma.task.findFirst({
      where: {
        userId: task.userId,
        title: task.title,
        isRecurring: true,
        dueDate: {
          gt: task.dueDate,
        },
        status: 'PENDING',
      },
    });

    if (!existingNext) {
      await generateNextRecurringTask(task);
    }
  }

  return NextResponse.json({ processed: orphanedTasks.length });
}
```

**Vercel Cron Config** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-recurring",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Implementation Steps

### Phase 1: Basic Recurring Tasks (4-5 hours)

1. **Add UI to QuickAddTask** (1.5 hours)
   - [ ] Add recurring toggle checkbox
   - [ ] Add pattern dropdown
   - [ ] Update form validation
   - [ ] Update mutation to include recurring fields

2. **Add Badge to TaskCard** (0.5 hours)
   - [ ] Import Repeat icon from lucide-react
   - [ ] Show badge when isRecurring is true
   - [ ] Add tooltip with pattern details

3. **Create Backend Logic** (2 hours)
   - [ ] Create `lib/recurring-tasks.ts`
   - [ ] Implement `generateNextRecurringTask()`
   - [ ] Implement `calculateNextDueDate()`
   - [ ] Add tests for date calculation

4. **Update Task Completion** (1 hour)
   - [ ] Modify PATCH endpoint to generate next instance
   - [ ] Handle errors gracefully
   - [ ] Add logging

### Phase 2: Advanced Features (4-5 hours)

5. **Edit Recurring Tasks** (2 hours)
   - [ ] Create EditRecurringTaskDialog component
   - [ ] Add "Edit this occurrence" option
   - [ ] Add "Edit all occurrences" option

6. **Delete Recurring Tasks** (1 hour)
   - [ ] Add "Delete this occurrence" option
   - [ ] Add "Delete entire series" option
   - [ ] Confirm dialog with clear messaging

7. **Weekly Pattern with Day Selection** (1 hour)
   - [ ] Add day-of-week selector for WEEKLY
   - [ ] Store selected days in separate field (if needed)
   - [ ] Generate tasks only on selected days

8. **Cron Job Safety Net** (1 hour)
   - [ ] Create cron endpoint
   - [ ] Configure Vercel cron
   - [ ] Test orphaned task detection

---

## Database Schema Enhancements (Optional)

For more advanced recurring patterns, consider:

```prisma
model Task {
  // ... existing fields

  // Advanced recurring fields
  recurringEndDate    DateTime?  // When to stop generating
  recurringCount      Int?       // Generate N times only
  recurringDaysOfWeek Int[]      // [1,3,5] for Mon, Wed, Fri
  recurringDayOfMonth Int?       // 15 for 15th of each month
  parentTaskId        String?    // Link to original recurring task

  // ... relations
}
```

---

## Testing Checklist

### Manual Testing

- [ ] Create a daily recurring task
  - [ ] Complete it
  - [ ] Verify next instance is created with tomorrow's date
  - [ ] Verify original task shows as completed

- [ ] Create a weekly recurring task
  - [ ] Complete it
  - [ ] Verify next instance is created 7 days later
  - [ ] Verify pattern is preserved

- [ ] Create a monthly recurring task
  - [ ] Complete it
  - [ ] Verify next instance is created 1 month later
  - [ ] Test edge case: Complete on Jan 31, should create Feb 28/29

- [ ] Edit a recurring task
  - [ ] Change title on single instance
  - [ ] Change title on all instances
  - [ ] Verify correct instances updated

- [ ] Delete a recurring task
  - [ ] Delete single instance
  - [ ] Delete entire series
  - [ ] Verify correct tasks deleted

- [ ] Test task without recurring enabled
  - [ ] Complete it
  - [ ] Verify no next instance is created

### Edge Cases

- [ ] Complete recurring task multiple times quickly
- [ ] Complete task on the same day it was created
- [ ] Recurring task due date in the past
- [ ] Recurring task with invalid pattern
- [ ] User deletes original task before completing
- [ ] Database failure during next instance creation

---

## API Reference

### Create Recurring Task

**POST** `/api/tasks`

```json
{
  "title": "Daily standup",
  "description": "Team sync meeting",
  "dueDate": "2025-11-01",
  "dueTime": "09:00",
  "priority": "MEDIUM",
  "isRecurring": true,
  "recurringPattern": "DAILY"
}
```

### Update Recurring Task

**PATCH** `/api/tasks/:id`

```json
{
  "title": "Updated title",
  "recurringPattern": "WEEKLY"
}
```

### Stop Recurring

**PATCH** `/api/tasks/:id`

```json
{
  "isRecurring": false,
  "recurringPattern": null
}
```

---

## Known Issues / Considerations

1. **Timezone Handling**: Recurring tasks should respect user's timezone when generating next instance
2. **Daylight Saving Time**: Consider DST transitions for recurring tasks
3. **Skip Weekends**: May want option to skip weekends for weekly/daily tasks
4. **Custom Patterns**: Current implementation only supports fixed intervals
5. **Bulk Generation**: Don't generate too many future instances at once (memory)

---

## Future Enhancements

- [ ] Biweekly pattern (every 2 weeks)
- [ ] Custom intervals (every N days/weeks/months)
- [ ] Skip weekends option
- [ ] End date for recurring series
- [ ] Maximum occurrence count
- [ ] Custom day-of-week for weekly
- [ ] Multiple days per week (Mon, Wed, Fri)
- [ ] Specific weekday of month (2nd Tuesday)
- [ ] Exception dates (skip specific dates)

---

## Resources

- [date-fns documentation](https://date-fns.org/docs/Getting-Started) - For date calculations
- [Prisma enums](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums) - Enum documentation
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) - Cron configuration

---

**Last Updated**: October 31, 2025
**Next Review**: When implementation begins
