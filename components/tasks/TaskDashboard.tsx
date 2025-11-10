'use client';

import { useState, Suspense, lazy } from 'react';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { QuickAddTask } from './QuickAddTask';
import { useTasks, useToggleTaskComplete, useDeleteTask, useUpdateTask } from '@/lib/hooks/useTasks';
import { TaskFilters as TaskFiltersType, Task } from '@/types';
import { toast } from 'sonner';
import { Loader2, Folder, Tag, Target, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { scrollToTask } from '@/lib/utils';
import Link from 'next/link';

// Lazy load heavy components for better performance
const EditTaskDialog = lazy(() => import('./EditTaskDialog').then(m => ({ default: m.EditTaskDialog })));
const PriorityQueueWidget = lazy(() => import('./PriorityQueueWidget').then(m => ({ default: m.PriorityQueueWidget })));
const CompletedTasksSection = lazy(() => import('./CompletedTasksSection').then(m => ({ default: m.CompletedTasksSection })));
const CategoryManager = lazy(() => import('@/components/categories/CategoryManager').then(m => ({ default: m.CategoryManager })));
const TagManager = lazy(() => import('@/components/tags/TagManager').then(m => ({ default: m.TagManager })));

interface TaskDashboardProps {
  userId: string;
}

export function TaskDashboard({ userId }: TaskDashboardProps) {
  const [filters, setFilters] = useState<TaskFiltersType>({ status: 'PENDING' });
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Use filters directly to allow search across all statuses
  const { data, isLoading } = useTasks(userId, filters);
  const toggleComplete = useToggleTaskComplete();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

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
      await updateTask.mutateAsync({ id: taskId, data: { status: 'ARCHIVED' } });

      toast.success('Task archived successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive task');
    }
  };

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleTaskClick = (taskId: string) => {
    scrollToTask(taskId);
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6" suppressHydrationWarning>
        {/* Left Sidebar - Filters */}
        <aside className="lg:col-span-3" data-tour="filters">
          <TaskFilters userId={userId} onFiltersChange={handleFiltersChange} initialFilters={filters} />
        </aside>

        {/* Main Content - Tasks */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          {/* Management Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Link href="/focus" data-tour="focus-mode">
              <Button
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 dark:from-indigo-500 dark:to-blue-400 dark:hover:from-indigo-600 dark:hover:to-blue-500 text-white shadow-sm transition-all text-xs sm:text-sm px-2 sm:px-3"
              >
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Focus Mode</span>
                <span className="xs:hidden">Focus</span>
              </Button>
            </Link>
            <Link href="/archive">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs sm:text-sm px-2 sm:px-3"
              >
                <Archive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Archive</span>
                <span className="sm:hidden">Archive</span>
              </Button>
            </Link>
            <div data-tour="manage-categories">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryManager(true)}
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs sm:text-sm px-2 sm:px-3"
              >
                <Folder className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Manage Categories</span>
                <span className="sm:hidden">Categories</span>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagManager(true)}
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs sm:text-sm px-2 sm:px-3"
            >
              <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Manage Tags</span>
              <span className="sm:hidden">Tags</span>
            </Button>
          </div>

          {/* Quick Add Task */}
          <div className="animate-fade-in" data-tour="quick-add-task">
            <QuickAddTask userId={userId} />
          </div>

          {/* Task Stats */}
          {data && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-card dark:shadow-card-dark transition-all">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.total}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-card dark:shadow-card-dark transition-all">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                  {data.tasks.filter((t) => t.status === 'PENDING').length}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-card dark:shadow-card-dark transition-all">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                  {data.tasks.filter((t) => t.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="animate-slide-up">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            ) : (
              <TaskList
                tasks={data?.tasks || []}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            )}
          </div>

          {/* Completed Tasks Section */}
          <Suspense fallback={<div className="animate-pulse h-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />}>
            <CompletedTasksSection
              userId={userId}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          </Suspense>
        </div>

        {/* Right Sidebar - Priority Queue Widget */}
        <aside className="lg:col-span-3 hidden lg:block" data-tour="priority-queue">
          <Suspense fallback={<div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-lg" />}>
            <PriorityQueueWidget userId={userId} limit={5} onTaskClick={handleTaskClick} />
          </Suspense>
        </aside>
      </div>

      {/* Management Dialogs */}
      <Suspense fallback={null}>
        <CategoryManager
          userId={userId}
          open={showCategoryManager}
          onOpenChange={setShowCategoryManager}
        />
      </Suspense>
      <Suspense fallback={null}>
        <TagManager
          userId={userId}
          open={showTagManager}
          onOpenChange={setShowTagManager}
        />
      </Suspense>
      <Suspense fallback={null}>
        <EditTaskDialog
          userId={userId}
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      </Suspense>
    </main>
  );
}
