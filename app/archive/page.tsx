'use client';

import { useState } from 'react';
import { useTasks, useDeleteTask } from '@/lib/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Archive, Loader2, ChevronLeft, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ArchivePage() {
  const { data, isLoading, refetch } = useTasks({ status: 'ARCHIVED' });
  const deleteTask = useDeleteTask();

  const tasks = data?.tasks || [];
  const total = data?.total || 0;

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to permanently delete this task?')) {
      return;
    }

    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted permanently');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleUnarchive = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING' }),
      });

      if (!response.ok) throw new Error('Failed to unarchive task');

      toast.success('Task restored successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unarchive task');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="rounded-full bg-amber-100 p-4">
            <Archive className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Archived Tasks</h1>
            <p className="text-gray-600 mt-1">
              {total} {total === 1 ? 'task' : 'tasks'} archived
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-gray-200 rounded-lg">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <Inbox className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No archived tasks</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Tasks you archive will appear here for future reference.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="relative">
              <TaskCard task={task} onDelete={handleDelete} />

              {/* Unarchive button overlay */}
              <div className="absolute top-4 right-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnarchive(task.id)}
                  className="bg-white hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                >
                  Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info footer */}
      {tasks.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Click &quot;Restore&quot; to move a task back to your active
            tasks, or delete it permanently.
          </p>
        </div>
      )}
    </main>
  );
}
