'use client';

import { useState } from 'react';
import { useCompletedTasks, useToggleTaskComplete, useDeleteTask } from '@/lib/hooks/useTasks';
import { TaskCard } from './TaskCard';
import { Task } from '@/types';
import { ChevronDown, ChevronUp, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletedTasksSectionProps {
  userId: string;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function CompletedTasksSection({
  userId,
  onToggleComplete,
  onEdit,
  onDelete,
  onArchive,
}: CompletedTasksSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useCompletedTasks(userId);
  const toggleComplete = useToggleTaskComplete();
  const deleteTask = useDeleteTask();

  const tasks = data?.tasks || [];
  const total = data?.total || 0;

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    if (onToggleComplete) {
      onToggleComplete(taskId, completed);
    } else {
      await toggleComplete.mutateAsync({ id: taskId, completed });
    }
  };

  const handleDelete = async (taskId: string) => {
    if (onDelete) {
      onDelete(taskId);
    } else {
      if (confirm('Are you sure you want to delete this task?')) {
        await deleteTask.mutateAsync(taskId);
      }
    }
  };

  // Don't show section if no completed tasks
  if (total === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Completed Tasks</h3>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No completed tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  onArchive={onArchive}
                />
              ))}
            </div>
          )}

          {/* Collapse button at bottom */}
          {tasks.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-gray-600"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Collapse
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
