import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { Status, Priority } from '@prisma/client';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { PRIORITY_LABELS } from '@/types';

// Initialize Resend client
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not configured in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'DueSync <noreply@duesync.com>';

// HTML template for daily email
function generateDailyEmailHTML(
  userName: string,
  tasks: Array<{
    id: string;
    title: string;
    priority: Priority;
    dueTime?: string | null;
    category?: { name: string; color: string } | null;
  }>,
  date: string
): string {
  const taskRows = tasks
    .map(
      (task) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
        <div style="font-weight: 500; color: #111827; margin-bottom: 4px;">${task.title}</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;
            background-color: ${
              task.priority === 'HIGH'
                ? '#FEE2E2'
                : task.priority === 'MEDIUM'
                ? '#FEF3C7'
                : '#DBEAFE'
            };
            color: ${
              task.priority === 'HIGH'
                ? '#991B1B'
                : task.priority === 'MEDIUM'
                ? '#92400E'
                : '#1E40AF'
            };">
            ${PRIORITY_LABELS[task.priority]}
          </span>
          ${
            task.category
              ? `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #6B7280;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${task.category.color};"></span>
              ${task.category.name}
            </span>`
              : ''
          }
          ${
            task.dueTime
              ? `<span style="font-size: 12px; color: #6B7280;">Due at ${task.dueTime}</span>`
              : ''
          }
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Daily Task Summary</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">DueSync</h1>
            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Your Daily Task Summary</p>
          </div>

          <!-- Content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">Good morning, ${userName}! ☀️</h2>

            <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 1.5;">
              You have <strong>${tasks.length}</strong> task${
    tasks.length !== 1 ? 's' : ''
  } scheduled for <strong>${date}</strong>.
            </p>

            <!-- Tasks Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #F9FAFB;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #E5E7EB;">
                    Your Tasks
                  </th>
                </tr>
              </thead>
              <tbody>
                ${taskRows}
              </tbody>
            </table>

            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}"
                 style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                View All Tasks →
              </a>
            </div>

            <!-- Tip -->
            <div style="margin-top: 30px; padding: 16px; background-color: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 4px;">
              <p style="margin: 0; color: #1E40AF; font-size: 14px;">
                💡 <strong>Tip:</strong> Start with your high-priority tasks for maximum productivity!
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px 0; color: #9CA3AF; font-size: 12px;">
            <p style="margin: 0 0 8px;">You're receiving this because you enabled daily email summaries in DueSync.</p>
            <p style="margin: 0;">
              <a href="${process.env.NEXTAUTH_URL}/settings" style="color: #3B82F6; text-decoration: none;">Update preferences</a>
            </p>
            <p style="margin: 12px 0 0; font-size: 11px; color: #9CA3AF;">
              Made with care by <a href="https://wiktechnology.com" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: #6B7280; text-decoration: none;">WIK Technologies</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// HTML template for weekly email
function generateWeeklyEmailHTML(
  userName: string,
  stats: {
    completed: number;
    pending: number;
    overdue: number;
    totalTasks: number;
  },
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: Date;
    priority: Priority;
  }>,
  weekRange: string
): string {
  const upcomingRows = upcomingTasks
    .map(
      (task) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
        <div style="font-weight: 500; color: #111827; margin-bottom: 4px;">${task.title}</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; color: #6B7280;">
            ${format(new Date(task.dueDate), 'EEE, MMM d')}
          </span>
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;
            background-color: ${
              task.priority === 'HIGH'
                ? '#FEE2E2'
                : task.priority === 'MEDIUM'
                ? '#FEF3C7'
                : '#DBEAFE'
            };
            color: ${
              task.priority === 'HIGH'
                ? '#991B1B'
                : task.priority === 'MEDIUM'
                ? '#92400E'
                : '#1E40AF'
            };">
            ${PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Summary</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">DueSync</h1>
            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Your Weekly Summary</p>
          </div>

          <!-- Content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">Weekly Recap 📊</h2>

            <p style="margin: 0 0 24px; color: #4B5563; font-size: 16px; line-height: 1.5;">
              Here's your productivity summary for <strong>${weekRange}</strong>:
            </p>

            <!-- Stats Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px;">
              <div style="padding: 20px; background: linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%); border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #166534; margin-bottom: 4px;">${stats.completed}</div>
                <div style="font-size: 14px; color: #166534;">Completed</div>
              </div>
              <div style="padding: 20px; background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #1E40AF; margin-bottom: 4px;">${stats.pending}</div>
                <div style="font-size: 14px; color: #1E40AF;">Pending</div>
              </div>
            </div>

            ${
              stats.overdue > 0
                ? `
            <div style="padding: 16px; background-color: #FEE2E2; border-left: 4px solid #DC2626; border-radius: 4px; margin-bottom: 30px;">
              <p style="margin: 0; color: #991B1B; font-size: 14px;">
                ⚠️ You have <strong>${stats.overdue}</strong> overdue task${stats.overdue !== 1 ? 's' : ''}.
              </p>
            </div>
            `
                : ''
            }

            <!-- Upcoming Tasks -->
            ${
              upcomingTasks.length > 0
                ? `
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px;">Coming Up This Week</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tbody>
                ${upcomingRows}
              </tbody>
            </table>
            `
                : ''
            }

            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}"
                 style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
                View Dashboard →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px 0; color: #9CA3AF; font-size: 12px;">
            <p style="margin: 0 0 8px;">You're receiving this because you enabled weekly email summaries in DueSync.</p>
            <p style="margin: 0;">
              <a href="${process.env.NEXTAUTH_URL}/settings" style="color: #8B5CF6; text-decoration: none;">Update preferences</a>
            </p>
            <p style="margin: 12px 0 0; font-size: 11px; color: #9CA3AF;">
              Made with care by <a href="https://wiktechnology.com" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: #6B7280; text-decoration: none;">WIK Technologies</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send daily task summary email to a user
 */
export async function sendDailyTaskEmail(userId: string): Promise<{
  success: boolean;
  reason?: string;
  taskCount?: number;
}> {
  try {
    // Fetch user and notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { notifications: true },
    });

    if (!user?.email) {
      return { success: false, reason: 'no_email' };
    }

    if (!user.notifications?.dailyEmailEnabled) {
      return { success: false, reason: 'disabled' };
    }

    // Fetch today's pending tasks
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
      include: {
        category: true,
      },
      orderBy: [{ priority: 'asc' }, { dueTime: 'asc' }],
    });

    if (tasks.length === 0) {
      return { success: false, reason: 'no_tasks' };
    }

    // Generate email HTML
    const emailHtml = generateDailyEmailHTML(
      user.name || 'there',
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueTime: t.dueTime,
        category: t.category,
      })),
      format(today, 'EEEE, MMMM d, yyyy')
    );

    // Send email using Resend
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `☀️ Your tasks for ${format(today, 'EEEE, MMM d')} (${tasks.length} task${
        tasks.length !== 1 ? 's' : ''
      })`,
      html: emailHtml,
    });

    console.log(`✅ Daily email sent to ${user.email} (${tasks.length} tasks)`);
    return { success: true, taskCount: tasks.length };
  } catch (error: any) {
    console.error('Failed to send daily email:', error);
    throw error;
  }
}

/**
 * Send weekly task summary email to a user
 */
export async function sendWeeklyTaskEmail(userId: string): Promise<{
  success: boolean;
  reason?: string;
  stats?: any;
}> {
  try {
    // Fetch user and notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { notifications: true },
    });

    if (!user?.email) {
      return { success: false, reason: 'no_email' };
    }

    if (!user.notifications?.weeklyEmailEnabled) {
      return { success: false, reason: 'disabled' };
    }

    // Calculate week range
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    // Fetch week stats
    const [completed, pending, overdue] = await Promise.all([
      prisma.task.count({
        where: {
          userId,
          status: Status.COMPLETED,
          completedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: Status.PENDING,
          dueDate: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: Status.PENDING,
          dueDate: {
            lt: now,
          },
        },
      }),
    ]);

    // Fetch upcoming tasks for the next week
    const upcomingTasks = await prisma.task.findMany({
      where: {
        userId,
        status: Status.PENDING,
        dueDate: {
          gte: now,
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
      take: 5,
    });

    const stats = {
      completed,
      pending,
      overdue,
      totalTasks: completed + pending,
    };

    // Generate email HTML
    const emailHtml = generateWeeklyEmailHTML(
      user.name || 'there',
      stats,
      upcomingTasks,
      `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    );

    // Send email using Resend
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `📊 Your weekly summary: ${stats.completed} tasks completed`,
      html: emailHtml,
    });

    console.log(`✅ Weekly email sent to ${user.email}`);
    return { success: true, stats };
  } catch (error: any) {
    console.error('Failed to send weekly email:', error);
    throw error;
  }
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(userEmail: string, userName?: string): Promise<void> {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email</title>
      </head>
      <body style="font-family: sans-serif; padding: 20px; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #3b82f6;">DueSync Email Test</h1>
          <p>Hello ${userName || 'there'}! 👋</p>
          <p>This is a test email to confirm that your email notification settings are working correctly.</p>
          <p style="color: #10b981; font-weight: bold;">✅ Email configuration successful!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 14px; color: #6b7280;">
            You can now receive daily and weekly task summaries from DueSync.
          </p>
          <p style="margin-top: 20px; font-size: 11px; color: #9CA3AF; text-align: center;">
            Made with care by <a href="https://wiktechnology.com" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: #6B7280; text-decoration: none;">WIK Technologies</a>
          </p>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: '✅ DueSync Email Test - Configuration Successful',
    html: testHtml,
  });

  console.log(`✅ Test email sent to ${userEmail}`);
}
