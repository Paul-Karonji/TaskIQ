'use client';

import { useHighPriorityUpcoming } from '@/lib/hooks/useTasks';
import { useTimezone } from '@/lib/hooks/useTimezone';
import { AlertCircle, Calendar, Loader2, PartyPopper } from 'lucide-react';
import { format, differenceInDays, startOfDay, isPast, isToday, isTomorrow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Task } from '@/types';

interface UpcomingHighPrioritySectionProps {
  userId: string;
  onTaskClick?: (taskId: string) => void;
}

export function UpcomingHighPrioritySection({ userId, onTaskClick }: UpcomingHighPrioritySectionProps) {
  const { data, isLoading } = useHighPriorityUpcoming(userId);
  const { timezone } = useTimezone();

  const tasks = data?.tasks || [];

  const getUrgencyStyle = (dueDate: Date) => {
    const now = new Date();
    const todayInTz = timezone ? toZonedTime(now, timezone) : now;
    const today = startOfDay(todayInTz);

    const dateInTz = timezone ? toZonedTime(new Date(dueDate), timezone) : new Date(dueDate);
    const due = startOfDay(dateInTz);

    const daysUntil = differenceInDays(due, today);

    if (daysUntil < 0 || isToday(dateInTz)) {
      // Overdue or today - RED
      return {
        border: 'border-l-4 border-red-500',
        bg: 'bg-red-50',
        badge: 'bg-red-100 text-red-800',
        icon: 'text-red-600',
      };
    } else if (daysUntil <= 2) {
      // 1-2 days - ORANGE
      return {
        border: 'border-l-4 border-orange-500',
        bg: 'bg-orange-50',
        badge: 'bg-orange-100 text-orange-800',
        icon: 'text-orange-600',
      };
    } else {
      // 3-7 days - BLUE
      return {
        border: 'border-l-4 border-blue-500',
        bg: 'bg-blue-50',
        badge: 'bg-blue-100 text-blue-800',
        icon: 'text-blue-600',
      };
    }
  };

  const getRelativeDateLabel = (dueDate: Date) => {
    const dateInTz = timezone ? toZonedTime(new Date(dueDate), timezone) : new Date(dueDate);
    const now = new Date();
    const todayInTz = timezone ? toZonedTime(now, timezone) : now;

    if (isPast(dateInTz) && !isToday(dateInTz)) {
      return '🔴 OVERDUE';
    }
    if (isToday(dateInTz)) {
      return '🔴 Today';
    }
    if (isTomorrow(dateInTz)) {
      return '🟡 Tomorrow';
    }

    const daysUntil = differenceInDays(startOfDay(dateInTz), startOfDay(todayInTz));
    if (daysUntil <= 7) {
      return `🟢 ${format(dateInTz, 'EEEE')}`;
    }

    return format(dateInTz, 'MMM d');
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // Show celebration if no urgent tasks
  if (tasks.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <PartyPopper className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-1">
              No Urgent Tasks! 🎉
            </h3>
            <p className="text-sm text-green-700">
              You don't have any high-priority tasks coming up in the next 7 days. Great job!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-white" />
          <div>
            <h3 className="text-lg font-bold text-white">High Priority Tasks</h3>
            <p className="text-sm text-white/90">Next 7 days • {tasks.length} tasks</p>
          </div>
        </div>
      </div>

      {/* Task Cards */}
      <div className="p-4 space-y-3">
        {tasks.map((task) => {
          const dueDate = new Date(task.dueDate);
          const urgencyStyle = getUrgencyStyle(dueDate);
          const relativeDate = getRelativeDateLabel(dueDate);

          return (
            <div
              key={task.id}
              data-task-id={task.id}
              className={`${urgencyStyle.border} ${urgencyStyle.bg} rounded-lg p-4 transition-all hover:shadow-md cursor-pointer`}
              onClick={() => onTaskClick?.(task.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${urgencyStyle.badge}`}>
                      <Calendar className="h-3 w-3" />
                      {relativeDate}
                    </span>
                    {task.dueTime && (
                      <span className="text-xs text-gray-600 font-medium">
                        {task.dueTime}
                      </span>
                    )}
                    {task.category && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: task.category.color }}
                        />
                        {task.category.name}
                      </span>
                    )}
                  </div>
                </div>
                <AlertCircle className={`h-5 w-5 ${urgencyStyle.icon} flex-shrink-0`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
