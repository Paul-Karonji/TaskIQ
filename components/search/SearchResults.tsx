'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { useTasks, useToggleTaskComplete, useDeleteTask } from '@/lib/hooks/useTasks';
import { TaskFilters as TaskFiltersType, Task } from '@/types';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';

// Lazy load EditTaskDialog for better performance
const EditTaskDialog = lazy(() => import('@/components/tasks/EditTaskDialog').then(m => ({ default: m.EditTaskDialog })));

interface SearchResultsProps {
  initialQuery: string;
  initialStatus?: string;
  initialPriority?: string;
  initialCategoryId?: string;
}

export function SearchResults({
  initialQuery,
  initialStatus,
  initialPriority,
  initialCategoryId,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters with search query and any URL parameters
  // Note: status defaults to undefined to show ALL statuses in search results
  const [filters, setFilters] = useState<TaskFiltersType>({
    search: initialQuery,
    status: undefined, // Show ALL statuses by default in search
    priority: initialPriority as any,
    categoryId: initialCategoryId,
  });

  const { data, isLoading, refetch } = useTasks(filters);
  const toggleComplete = useToggleTaskComplete();
  const deleteTask = useDeleteTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);

    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [filters, router]);

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

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleTaskUpdated = () => {
    refetch();
  };

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };

  // Group tasks by status for better organization
  const pendingTasks = data?.tasks.filter((t) => t.status === 'PENDING') || [];
  const completedTasks = data?.tasks.filter((t) => t.status === 'COMPLETED') || [];
  const archivedTasks = data?.tasks.filter((t) => t.status === 'ARCHIVED') || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
        <TaskFilters
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
          isSearchPage={true}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Found <span className="font-semibold">{data?.total || 0}</span> task(s)
            </p>
          </div>

          {/* No Results */}
          {data?.total === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No tasks found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                {filters.search
                  ? `No tasks match "${filters.search}". Try a different search term.`
                  : 'Try adjusting your filters.'}
              </p>
            </div>
          )}

          {/* Results by Status */}
          {data && data.total > 0 && (
            <div className="space-y-8">
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                    Pending Tasks ({pendingTasks.length})
                  </h2>
                  <TaskList
                    tasks={pendingTasks}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    Completed Tasks ({completedTasks.length})
                  </h2>
                  <TaskList
                    tasks={completedTasks}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                </div>
              )}

              {/* Archived Tasks */}
              {archivedTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-2"></span>
                    Archived Tasks ({archivedTasks.length})
                  </h2>
                  <TaskList
                    tasks={archivedTasks}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Edit Task Dialog */}
      <Suspense fallback={null}>
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      </Suspense>
    </div>
  );
}
