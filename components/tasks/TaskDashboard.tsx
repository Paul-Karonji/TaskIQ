'use client';

import { useState } from 'react';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { QuickAddTask } from './QuickAddTask';
import { useTasks, useToggleTaskComplete, useDeleteTask } from '@/lib/hooks/useTasks';
import { TaskFilters as TaskFiltersType } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function TaskDashboard() {
  const [filters, setFilters] = useState<TaskFiltersType>({});

  const { data, isLoading, refetch } = useTasks(filters);
  const toggleComplete = useToggleTaskComplete();
  const deleteTask = useDeleteTask();

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await toggleComplete.mutateAsync({ id: taskId, completed });
      toast.success(completed ? 'Task completed!' : 'Task marked as pending');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };

  const handleTaskCreated = () => {
    refetch();
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Filters */}
        <aside className="lg:col-span-1">
          <TaskFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
        </aside>

        {/* Main Content - Tasks */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Add Task */}
          <div className="animate-fade-in">
            <QuickAddTask onTaskCreated={handleTaskCreated} />
          </div>

          {/* Task Stats */}
          {data && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{data.total}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {data.tasks.filter((t) => t.status === 'PENDING').length}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.tasks.filter((t) => t.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="animate-slide-up">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TaskList
                tasks={data?.tasks || []}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
