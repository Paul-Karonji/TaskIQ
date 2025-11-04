'use client';

import { usePriorityQueue } from '@/lib/hooks/useTasks';
import { Zap, Calendar, Loader2, Sparkles } from 'lucide-react';
import { format, differenceInDays, startOfDay, isToday, isTomorrow, isPast } from 'date-fns';

interface PriorityQueueWidgetProps {
  userId: string;
  limit?: number;
  onTaskClick?: (taskId: string) => void;
}

export function PriorityQueueWidget({ userId, limit = 5, onTaskClick }: PriorityQueueWidgetProps) {
  const { data, isLoading } = usePriorityQueue(userId, limit);

  const tasks = data?.tasks || [];

  const getUrgencyDot = (dueDate: Date) => {
    const today = startOfDay(new Date());
    const due = startOfDay(new Date(dueDate));
    const daysUntil = differenceInDays(due, today);

    if (daysUntil < 0 || isToday(due)) {
      return '🔴'; // Overdue or today - RED
    } else if (daysUntil <= 2) {
      return '🟡'; // 1-2 days - ORANGE
    } else {
      return '🟢'; // 3+ days - GREEN
    }
  };

  const getRelativeDateShort = (dueDate: Date) => {
    const date = new Date(dueDate);

    if (isPast(date) && !isToday(date)) {
      const daysAgo = Math.abs(differenceInDays(startOfDay(date), startOfDay(new Date())));
      return `${daysAgo}d ago`;
    }
    if (isToday(date)) {
      return 'Today';
    }
    if (isTomorrow(date)) {
      return 'Tomorrow';
    }

    const daysUntil = differenceInDays(startOfDay(date), startOfDay(new Date()));
    if (daysUntil <= 7) {
      return format(date, 'EEEE').slice(0, 3); // Mon, Tue, etc.
    }

    return format(date, 'MMM d');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-white" />
          <h3 className="text-base font-bold text-white">Priority Queue</h3>
        </div>
        <p className="text-xs text-white/80 mt-0.5">Next {limit} urgent tasks</p>
      </div>

      {/* Content */}
      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No urgent tasks!</p>
            <p className="text-xs text-gray-400 mt-1">You're all caught up 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => {
              const dueDate = new Date(task.dueDate);
              const urgencyDot = getUrgencyDot(dueDate);
              const relativeDate = getRelativeDateShort(dueDate);

              return (
                <div
                  key={task.id}
                  data-task-id={task.id}
                  className="group p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                  onClick={() => onTaskClick?.(task.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0" title="Urgency indicator">
                      {urgencyDot}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-900">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center text-xs text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {relativeDate}
                        </span>
                        {task.dueTime && (
                          <span className="text-xs text-gray-500">
                            • {task.dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      {tasks.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Click to jump to task
          </p>
        </div>
      )}
    </div>
  );
}
