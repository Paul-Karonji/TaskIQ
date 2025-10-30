// lib/hooks/useCalendarSync.ts
import { useState } from 'react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  googleEventId?: string | null;
}

/**
 * Hook for syncing tasks with Google Calendar
 */
export function useCalendarSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncTask = async (taskId: string) => {
    setIsSyncing(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/calendar`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.details || error.error || 'Failed to sync with Google Calendar';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success('Task synced with Google Calendar! Check your calendar.');
      return data.task;
    } catch (error: any) {
      console.error('Failed to sync task:', error);
      toast.error(error.message || 'Failed to sync with Google Calendar', {
        duration: 5000,
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const unsyncTask = async (taskId: string) => {
    setIsSyncing(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/calendar`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.details || error.error || 'Failed to unsync from Google Calendar';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success('Task removed from Google Calendar');
      return data.task;
    } catch (error: any) {
      console.error('Failed to unsync task:', error);
      toast.error(error.message || 'Failed to unsync from Google Calendar', {
        duration: 5000,
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSync = async (task: Task) => {
    if (task.googleEventId) {
      return await unsyncTask(task.id);
    } else {
      return await syncTask(task.id);
    }
  };

  return {
    syncTask,
    unsyncTask,
    toggleSync,
    isSyncing,
  };
}
