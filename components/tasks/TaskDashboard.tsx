'use client';

import { useState } from 'react';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { QuickAddTask } from './QuickAddTask';
import { UpcomingHighPrioritySection } from './UpcomingHighPrioritySection';
import { PriorityQueueWidget } from './PriorityQueueWidget';
import { CompletedTasksSection } from './CompletedTasksSection';
import { useTasks, useToggleTaskComplete, useDeleteTask } from '@/lib/hooks/useTasks';
import { TaskFilters as TaskFiltersType } from '@/types';
import { toast } from 'sonner';
import { Loader2, Folder, Tag, Target, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { TagManager } from '@/components/tags/TagManager';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { scrollToTask } from '@/lib/utils';
import Link from 'next/link';

export function TaskDashboard() {
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  // Filter to only show PENDING tasks by default (exclude COMPLETED)
  const pendingTasksFilter = { ...filters, status: filters.status || 'PENDING' };
  const { data, isLoading, refetch } = useTasks(pendingTasksFilter);
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

  const handleArchive = async (taskId: string) => {
    if (!confirm('Are you sure you want to archive this task?')) {
      return;
    }

    try {
      await toggleComplete.mutateAsync({ id: taskId, completed: false });
      // Update the task status to ARCHIVED using the update mutation
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });

      if (!response.ok) throw new Error('Failed to archive task');

      toast.success('Task archived successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive task');
    }
  };

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };

  const handleTaskCreated = () => {
    refetch();
  };

  const handleTaskClick = (taskId: string) => {
    scrollToTask(taskId);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Filters */}
        <aside className="lg:col-span-3">
          <TaskFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
        </aside>

        {/* Main Content - Tasks */}
        <div className="lg:col-span-6 space-y-6">
          {/* Management Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Link href="/focus">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                Focus Mode
              </Button>
            </Link>
            <Link href="/archive">
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                View Archive
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryManager(true)}
            >
              <Folder className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagManager(true)}
            >
              <Tag className="h-4 w-4 mr-2" />
              Manage Tags
            </Button>
            <NotificationPreferences />
          </div>

          {/* High Priority Tasks Section */}
          <div className="animate-fade-in">
            <UpcomingHighPrioritySection onTaskClick={handleTaskClick} />
          </div>

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
                onArchive={handleArchive}
              />
            )}
          </div>

          {/* Completed Tasks Section */}
          <div className="animate-fade-in">
            <CompletedTasksSection
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          </div>
        </div>

        {/* Right Sidebar - Priority Queue Widget */}
        <aside className="lg:col-span-3 hidden lg:block">
          <PriorityQueueWidget limit={5} onTaskClick={handleTaskClick} />
        </aside>
      </div>

      {/* Management Dialogs */}
      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      />
      <TagManager
        open={showTagManager}
        onOpenChange={setShowTagManager}
      />
    </main>
  );
}
