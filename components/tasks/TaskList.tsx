'use client';

import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { CheckCircle2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskList({
  tasks,
  isLoading = false,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <CheckCircle2 className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          You don&apos;t have any tasks yet. Create your first task to get started!
        </p>
      </div>
    );
  }

  // Task list
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
