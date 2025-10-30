// components/tasks/CalendarSyncButton.tsx
'use client';

import { Calendar, CalendarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalendarSync } from '@/lib/hooks/useCalendarSync';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  googleEventId?: string | null;
}

interface CalendarSyncButtonProps {
  task: Task;
  onSync?: (task: Task) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
}

/**
 * Button to sync/unsync a task with Google Calendar
 */
export function CalendarSyncButton({
  task,
  onSync,
  size = 'icon',
  variant = 'ghost',
  className,
}: CalendarSyncButtonProps) {
  const { toggleSync, isSyncing } = useCalendarSync();

  const handleClick = async () => {
    try {
      const updatedTask = await toggleSync(task);
      onSync?.(updatedTask);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const isSynced = Boolean(task.googleEventId);

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={isSyncing}
      className={cn(
        isSynced && 'text-blue-600 hover:text-blue-700',
        className
      )}
      title={isSynced ? 'Unlink from Google Calendar' : 'Sync to Google Calendar'}
    >
      {isSyncing ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isSynced ? (
        <Calendar className="h-4 w-4" />
      ) : (
        <CalendarOff className="h-4 w-4" />
      )}
      {size !== 'icon' && (
        <span className="ml-2">
          {isSynced ? 'Synced' : 'Sync to Calendar'}
        </span>
      )}
    </Button>
  );
}
