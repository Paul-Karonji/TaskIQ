# Email Notifications Feature

**Status**: 🟡 5% Complete
**Priority**: Medium
**Estimated Time**: 10-12 hours

## Overview
Send automated email notifications to users about their tasks, including daily summaries, weekly reports, and task reminders. Emails are personalized, beautifully designed, and respect user preferences.

---

## Current Implementation Status

### ✅ Completed (5%)

#### 1. Database Schema
**File**: `prisma/schema.prisma`

```prisma
enum WeekDay {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

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

**Status**: Schema exists and is migrated.

---

## ❌ Not Implemented (95%)

### 1. Email Service Setup (0%)

#### Choose Email Provider

**Recommended Options:**

1. **Resend** (Recommended for Next.js)
   - Modern API
   - React Email support
   - Generous free tier (3,000 emails/month)
   - Great developer experience
   - Domain verification required

2. **SendGrid**
   - Industry standard
   - 100 emails/day free
   - Comprehensive analytics
   - More complex setup

3. **AWS SES**
   - Very cheap ($0.10 per 1,000 emails)
   - Requires AWS account
   - More complex configuration

**Decision**: **Resend** for modern Next.js integration

#### Install Dependencies

```bash
npm install resend
npm install @react-email/components react-email
```

#### Setup Environment Variables

```env
# .env
RESEND_API_KEY="re_..."
EMAIL_FROM="DueSync <notifications@taskiq.com>"
```

---

### 2. Email Service Configuration (0%)

**New file**: `lib/email.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('[Email] Failed to send:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true };
  } catch (error: any) {
    console.error('[Email] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email to multiple recipients
 */
export async function sendBulkEmails(
  emails: SendEmailParams[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
```

---

### 3. Email Templates (0%)

Using **React Email** for beautiful, responsive templates.

#### A. Daily Summary Email
**New file**: `emails/DailySummary.tsx`

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface DailySummaryEmailProps {
  userName: string;
  tasks: {
    id: string;
    title: string;
    dueTime?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category?: { name: string; color: string };
  }[];
  overdueCount: number;
}

export default function DailySummaryEmail({
  userName = 'User',
  tasks = [],
  overdueCount = 0,
}: DailySummaryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your daily task summary - {tasks.length} tasks due today</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🎯 DueSync</Heading>
            <Text style={subtitle}>Daily Task Summary</Text>
          </Section>

          {/* Greeting */}
          <Text style={text}>
            Good morning, <strong>{userName}</strong>! 👋
          </Text>

          {/* Summary Stats */}
          <Section style={statsContainer}>
            <Row>
              <Column style={statBox}>
                <Text style={statNumber}>{tasks.length}</Text>
                <Text style={statLabel}>Due Today</Text>
              </Column>
              {overdueCount > 0 && (
                <Column style={statBoxWarning}>
                  <Text style={statNumber}>{overdueCount}</Text>
                  <Text style={statLabel}>Overdue</Text>
                </Column>
              )}
            </Row>
          </Section>

          {/* Tasks List */}
          {tasks.length > 0 ? (
            <>
              <Text style={sectionTitle}>Today's Tasks:</Text>
              {tasks.map((task) => (
                <Section key={task.id} style={taskCard}>
                  <div
                    style={{
                      ...priorityIndicator,
                      backgroundColor: getPriorityColor(task.priority),
                    }}
                  />
                  <Text style={taskTitle}>{task.title}</Text>
                  <Text style={taskMeta}>
                    {task.dueTime && `Due: ${task.dueTime}`}
                    {task.category && ` • ${task.category.name}`}
                  </Text>
                </Section>
              ))}
            </>
          ) : (
            <Text style={text}>
              No tasks due today. Enjoy your day! ☕
            </Text>
          )}

          {/* CTA */}
          <Section style={buttonContainer}>
            <Link
              style={button}
              href={`${process.env.NEXTAUTH_URL}`}
            >
              View All Tasks
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by DueSync. <br />
              <Link href={`${process.env.NEXTAUTH_URL}/settings`} style={link}>
                Manage notification preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#3B82F6',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const subtitle = {
  color: '#ffffff',
  fontSize: '16px',
  margin: 0,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 24px',
};

const sectionTitle = {
  ...text,
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '32px',
  marginBottom: '16px',
};

const statsContainer = {
  padding: '24px',
};

const statBox = {
  textAlign: 'center' as const,
  padding: '16px',
  backgroundColor: '#EFF6FF',
  borderRadius: '8px',
  margin: '0 8px',
};

const statBoxWarning = {
  ...statBox,
  backgroundColor: '#FEF2F2',
};

const statNumber = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#3B82F6',
  margin: 0,
};

const statLabel = {
  fontSize: '14px',
  color: '#6B7280',
  margin: 0,
};

const taskCard = {
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '16px 16px 16px 20px',
  margin: '0 24px 12px',
  position: 'relative' as const,
};

const priorityIndicator = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  bottom: 0,
  width: '4px',
  borderRadius: '8px 0 0 8px',
};

const taskTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 4px',
};

const taskMeta = {
  fontSize: '14px',
  color: '#6B7280',
  margin: 0,
};

const buttonContainer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3B82F6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  borderTop: '1px solid #E5E7EB',
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#6B7280',
  lineHeight: '20px',
  margin: 0,
};

const link = {
  color: '#3B82F6',
  textDecoration: 'underline',
};

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'HIGH':
      return '#EF4444';
    case 'MEDIUM':
      return '#F59E0B';
    case 'LOW':
      return '#10B981';
    default:
      return '#6B7280';
  }
}
```

#### B. Weekly Report Email
**New file**: `emails/WeeklyReport.tsx`

```tsx
export default function WeeklyReportEmail({
  userName,
  weekStart,
  weekEnd,
  stats,
  upcomingTasks,
}: WeeklyReportEmailProps) {
  return (
    <Html>
      {/* Similar structure to DailySummary */}
      <Body>
        <Container>
          <Heading>📊 Weekly Task Report</Heading>

          {/* Stats: Completed, Pending, Overdue */}
          <Section>
            <Text>Tasks completed: {stats.completed}</Text>
            <Text>Tasks pending: {stats.pending}</Text>
            <Text>Completion rate: {stats.completionRate}%</Text>
          </Section>

          {/* Top 3 Priorities for next week */}
          <Section>
            <Heading>Coming Up Next Week:</Heading>
            {upcomingTasks.map(task => (
              <div key={task.id}>{task.title}</div>
            ))}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

#### C. Task Reminder Email
**New file**: `emails/TaskReminder.tsx`

```tsx
export default function TaskReminderEmail({
  userName,
  task,
}: TaskReminderEmailProps) {
  return (
    <Html>
      <Body>
        <Container>
          <Heading>⏰ Task Reminder</Heading>
          <Text>Hi {userName},</Text>
          <Text>
            Your task "<strong>{task.title}</strong>" is due{' '}
            {formatDueTime(task.dueDate, task.dueTime)}.
          </Text>

          {task.description && (
            <Section>
              <Text>{task.description}</Text>
            </Section>
          )}

          <Link href={`${process.env.NEXTAUTH_URL}/tasks/${task.id}`}>
            View Task Details
          </Link>
        </Container>
      </Body>
    </Html>
  );
}
```

---

### 4. Email Sender Functions (0%)

**New file**: `lib/email-senders.ts`

```typescript
import { sendEmail } from './email';
import DailySummaryEmail from '@/emails/DailySummary';
import WeeklyReportEmail from '@/emails/WeeklyReport';
import TaskReminderEmail from '@/emails/TaskReminder';
import { prisma } from './prisma';

/**
 * Send daily summary email to a user
 */
export async function sendDailySummaryEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tasks: {
        where: {
          status: 'PENDING',
          dueDate: {
            gte: new Date().setHours(0, 0, 0, 0),
            lt: new Date().setHours(23, 59, 59, 999),
          },
        },
        include: {
          category: true,
        },
        orderBy: [
          { priority: 'desc' },
          { dueTime: 'asc' },
        ],
      },
    },
  });

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const overdueTasks = await prisma.task.count({
    where: {
      userId,
      status: 'PENDING',
      dueDate: {
        lt: new Date().setHours(0, 0, 0, 0),
      },
    },
  });

  return await sendEmail({
    to: user.email,
    subject: `Your Daily Task Summary - ${user.tasks.length} tasks due today`,
    react: DailySummaryEmail({
      userName: user.name || 'there',
      tasks: user.tasks,
      overdueCount: overdueTasks,
    }),
  });
}

/**
 * Send weekly report email to a user
 */
export async function sendWeeklyReportEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Get stats for past week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const stats = {
    completed: await prisma.task.count({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: weekAgo },
      },
    }),
    pending: await prisma.task.count({
      where: {
        userId,
        status: 'PENDING',
      },
    }),
  };

  stats.completionRate = Math.round(
    (stats.completed / (stats.completed + stats.pending)) * 100
  );

  // Get upcoming tasks for next week
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingTasks = await prisma.task.findMany({
    where: {
      userId,
      status: 'PENDING',
      dueDate: {
        gte: new Date(),
        lte: nextWeek,
      },
    },
    take: 5,
    orderBy: [
      { priority: 'desc' },
      { dueDate: 'asc' },
    ],
  });

  return await sendEmail({
    to: user.email,
    subject: `Your Weekly Task Report - ${stats.completed} tasks completed`,
    react: WeeklyReportEmail({
      userName: user.name || 'there',
      weekStart: weekAgo,
      weekEnd: new Date(),
      stats,
      upcomingTasks,
    }),
  });
}

/**
 * Send task reminder email
 */
export async function sendTaskReminderEmail(
  userId: string,
  taskId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      category: true,
    },
  });

  if (!user || !task) {
    return { success: false, error: 'User or task not found' };
  }

  return await sendEmail({
    to: user.email,
    subject: `Reminder: "${task.title}" is due soon`,
    react: TaskReminderEmail({
      userName: user.name || 'there',
      task,
    }),
  });
}
```

---

### 5. Cron Jobs (0%)

#### A. Daily Summary Cron
**New file**: `app/api/cron/daily-email/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDailySummaryEmail } from '@/lib/email-senders';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Find users who want daily emails at this time (±15 minutes)
    const users = await prisma.notificationPreference.findMany({
      where: {
        dailyEmailEnabled: true,
        // Match time approximately (handled in code)
      },
      include: {
        user: true,
      },
    });

    let sent = 0;
    let failed = 0;

    for (const pref of users) {
      // Check if user's preferred time matches current time (±15 min)
      const [prefHour, prefMin] = pref.dailyEmailTime.split(':').map(Number);
      const prefMinutes = prefHour * 60 + prefMin;
      const currentMinutes = currentHour * 60 + currentMinute;
      const diff = Math.abs(currentMinutes - prefMinutes);

      if (diff <= 15) {
        const result = await sendDailySummaryEmail(pref.userId);
        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      }
    }

    console.log(`[Daily Email] Sent: ${sent}, Failed: ${failed}`);

    return NextResponse.json({ sent, failed });
  } catch (error: any) {
    console.error('[Daily Email] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Vercel Cron Config**:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-email",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### B. Weekly Report Cron
**New file**: `app/api/cron/weekly-email/route.ts`

Similar structure, runs weekly based on user's `weeklyEmailDay` preference.

#### C. Task Reminders Cron
**New file**: `app/api/cron/task-reminders/route.ts`

```typescript
// Runs every 15 minutes
// Checks for tasks due soon based on reminderMinutesBefore setting
// Sends email reminders
```

---

### 6. Settings UI (0%)

Already integrated into `components/settings/NotificationsSection.tsx`, but needs full implementation:

```tsx
export function NotificationsSection() {
  const [preferences, setPreferences] = useState({
    dailyEmailEnabled: true,
    dailyEmailTime: '08:00',
    weeklyEmailEnabled: true,
    weeklyEmailDay: 'MONDAY',
    weeklyEmailTime: '09:00',
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => toast.success('Preferences updated'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Daily Summary */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Daily Task Summary</Label>
            <p className="text-sm text-gray-500">
              Receive a summary of today's tasks every morning
            </p>
          </div>
          <Switch
            checked={preferences.dailyEmailEnabled}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, dailyEmailEnabled: checked })
            }
          />
        </div>

        {preferences.dailyEmailEnabled && (
          <div className="mt-4">
            <Label>Send at</Label>
            <Input
              type="time"
              value={preferences.dailyEmailTime}
              onChange={(e) =>
                setPreferences({ ...preferences, dailyEmailTime: e.target.value })
              }
            />
          </div>
        )}

        {/* Weekly Report */}
        {/* ... similar structure ... */}

        <Button onClick={() => updateMutation.mutate(preferences)}>
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Implementation Steps

### Phase 1: Setup (2-3 hours)

1. **Choose and Configure Email Provider** (1 hour)
   - [ ] Sign up for Resend
   - [ ] Verify domain
   - [ ] Get API key
   - [ ] Add to environment variables

2. **Install Dependencies** (0.5 hours)
   - [ ] Install resend
   - [ ] Install react-email
   - [ ] Configure react-email

3. **Create Email Service** (1 hour)
   - [ ] Create `lib/email.ts`
   - [ ] Test basic email sending
   - [ ] Error handling

### Phase 2: Email Templates (3-4 hours)

4. **Daily Summary Template** (1.5 hours)
   - [ ] Create `emails/DailySummary.tsx`
   - [ ] Design responsive layout
   - [ ] Add task list
   - [ ] Add stats
   - [ ] Test rendering

5. **Weekly Report Template** (1.5 hours)
   - [ ] Create `emails/WeeklyReport.tsx`
   - [ ] Add weekly stats
   - [ ] Add upcoming tasks
   - [ ] Test rendering

6. **Task Reminder Template** (1 hour)
   - [ ] Create `emails/TaskReminder.tsx`
   - [ ] Simple, focused design
   - [ ] Test rendering

### Phase 3: Email Senders (2 hours)

7. **Create Sender Functions** (2 hours)
   - [ ] Create `lib/email-senders.ts`
   - [ ] Implement `sendDailySummaryEmail`
   - [ ] Implement `sendWeeklyReportEmail`
   - [ ] Implement `sendTaskReminderEmail`
   - [ ] Add error handling
   - [ ] Add logging

### Phase 4: Cron Jobs (2-3 hours)

8. **Daily Email Cron** (1 hour)
   - [ ] Create `/api/cron/daily-email/route.ts`
   - [ ] Time matching logic
   - [ ] Test locally

9. **Weekly Email Cron** (1 hour)
   - [ ] Create `/api/cron/weekly-email/route.ts`
   - [ ] Day of week matching
   - [ ] Test locally

10. **Task Reminders Cron** (1 hour)
    - [ ] Create `/api/cron/task-reminders/route.ts`
    - [ ] Calculate reminder times
    - [ ] Test locally

### Phase 5: Testing (1-2 hours)

11. **End-to-End Testing** (2 hours)
    - [ ] Test email delivery
    - [ ] Test all templates
    - [ ] Test cron timing
    - [ ] Test preferences UI
    - [ ] Verify unsubscribe works

---

## Testing Checklist

- [ ] Daily summary sent at correct time
- [ ] Weekly report sent on correct day
- [ ] Task reminder sent before due time
- [ ] Emails respect user timezone
- [ ] User can disable each email type
- [ ] User can customize send times
- [ ] Emails look good on mobile
- [ ] Emails look good in dark mode email clients
- [ ] Unsubscribe link works
- [ ] Re-subscribe works
- [ ] No emails sent to unsubscribed users

---

## Known Issues / Considerations

1. **Email Deliverability**: Verify domain, SPF, DKIM records
2. **Rate Limiting**: Resend free tier: 100 emails/day
3. **Spam Filters**: Test email content doesn't trigger spam
4. **Timezone Handling**: User timezone must be respected
5. **Cron Accuracy**: Vercel cron may have ±1 minute variance
6. **Unsubscribe**: Legal requirement (CAN-SPAM, GDPR)

---

## Future Enhancements

- [ ] Custom email templates per user
- [ ] Email digest preview before sending
- [ ] Smart send time (when user is most active)
- [ ] Task completion emails
- [ ] Team collaboration email notifications
- [ ] Email threading (reply to emails to update tasks)
- [ ] Rich text formatting in task descriptions
- [ ] Inline task completion (checkbox in email)

---

**Last Updated**: October 31, 2025
**Next Review**: When implementation begins
