'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Loader2, Repeat, WifiOff, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTaskSchema, CreateTaskInput } from '@/lib/validations/task';
import { Priority, RecurringPattern } from '@prisma/client';
import { PRIORITY_LABELS } from '@/types';
import { toast } from 'sonner';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTags } from '@/lib/hooks/useTags';
import { useCreateTask } from '@/lib/hooks/useTasks';
import { saveOfflineTask, isOfflineModeSupported } from '@/lib/offline-storage';

interface QuickAddTaskProps {
  userId: string;
  onSubmit?: (data: CreateTaskInput) => Promise<void>;
}

export function QuickAddTask({ userId, onSubmit }: QuickAddTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const createTask = useCreateTask();
  const { data: categories = [] } = useCategories(userId);
  const { data: tags = [] } = useTags(userId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: Priority.MEDIUM,
      categoryId: null,
      tagIds: [],
      isRecurring: false,
      recurringPattern: null,
    },
  });

  const priority = watch('priority');
  const categoryId = watch('categoryId');
  const isRecurring = watch('isRecurring');
  const recurringPattern = watch('recurringPattern');

  // Detect online/offline status
  useEffect(() => {
    const updateOnlineStatus = async () => {
      const wasOffline = isOffline;
      const isNowOnline = navigator.onLine;

      setIsOffline(!isNowOnline);

      // If we just came back online, trigger manual sync for iOS/Safari
      if (wasOffline && isNowOnline) {
        console.log('[Offline] Came back online, triggering sync...');

        // Try background sync first (Android Chrome)
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
          try {
            const registration = await navigator.serviceWorker.ready;
            // Type assertion for Background Sync API (not in all TypeScript defs)
            if ('sync' in registration) {
              await (registration as any).sync.register('sync-offline-tasks');
              console.log('[Offline] Background sync triggered');
            }
          } catch (error) {
            console.error('[Offline] Background sync failed:', error);
          }
        } else {
          // Fallback: Manual sync for iOS/Safari
          console.log('[Offline] Background Sync not supported, using manual sync');
          try {
            const { syncOfflineTasks } = await import('@/lib/offline-storage');
            const result = await syncOfflineTasks();

            if (result.success > 0) {
              toast.success(`${result.success} offline task(s) synced!`);
            }
            if (result.failed > 0) {
              toast.error(`${result.failed} task(s) failed to sync`);
            }
          } catch (error) {
            console.error('[Offline] Manual sync failed:', error);
          }
        }
      }
    };

    updateOnlineStatus(); // Set initial status

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for sync completion from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          const { success, failed } = event.data;
          if (success > 0) {
            toast.success(`${success} offline task(s) synced successfully!`);
          }
          if (failed > 0) {
            toast.error(`${failed} task(s) failed to sync`);
          }
        }
      });
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [isOffline]);

  const handleFormSubmit = async (data: any) => {
    try {
      // Include selected tags in the submission
      const taskData = {
        ...data,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      };

      // Check if offline and IndexedDB is supported
      if (isOffline && isOfflineModeSupported()) {
        // Save to IndexedDB for later sync
        const offlineTaskId = await saveOfflineTask({
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          dueTime: taskData.dueTime,
          priority: taskData.priority,
          categoryId: taskData.categoryId,
          estimatedTime: taskData.estimatedTime,
          isRecurring: taskData.isRecurring,
          recurringPattern: taskData.recurringPattern,
        });

        toast.success('Task saved offline! Will sync when online.', {
          icon: <CloudOff className="w-5 h-5" />,
          description: 'Your task is stored locally and will sync automatically.',
        });

        // Register background sync if supported
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          // Type assertion for Background Sync API (not in all TypeScript defs)
          if ('sync' in registration) {
            await (registration as any).sync.register('sync-offline-tasks');
            console.log('[Offline] Background sync registered');
          }
        }

        reset();
        setSelectedTags([]);
        setIsExpanded(false);
      } else {
        // Online - normal submission
        if (onSubmit) {
          await onSubmit(taskData);
        } else {
          // Use the mutation hook for task creation
          await createTask.mutateAsync(taskData);
        }

        toast.success('Task created successfully!');
        reset();
        setSelectedTags([]);
        setIsExpanded(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedTags([]);
    setIsExpanded(false);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Collapsed state
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Add a task</span>
      </button>
    );
  }

  // Expanded form state
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-slate-800 shadow-card dark:shadow-card-dark transition-colors">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
            You're offline. Task will be saved locally and synced when online.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">
            Title <span className="text-red-500 dark:text-red-400">*</span>
          </Label>
          <Input
            id="title"
            placeholder="What needs to be done?"
            {...register('title')}
            className={errors.title ? 'border-red-500 dark:border-red-400' : ''}
            autoFocus
          />
          {errors.title && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description</Label>
          <Textarea
            id="description"
            placeholder="Add more details..."
            rows={3}
            {...register('description')}
            className={errors.description ? 'border-red-500 dark:border-red-400' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Due Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dueDate">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              className={errors.dueDate ? 'border-red-500' : ''}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dueTime">Due Time</Label>
            <Input
              id="dueTime"
              type="time"
              {...register('dueTime')}
              className={errors.dueTime ? 'border-red-500' : ''}
            />
            {errors.dueTime && (
              <p className="text-sm text-red-600 mt-1">{errors.dueTime.message}</p>
            )}
          </div>
        </div>

        {/* Priority and Estimated Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setValue('priority', value as Priority)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Priority.HIGH}>{PRIORITY_LABELS.HIGH}</SelectItem>
                <SelectItem value={Priority.MEDIUM}>{PRIORITY_LABELS.MEDIUM}</SelectItem>
                <SelectItem value={Priority.LOW}>{PRIORITY_LABELS.LOW}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              max="1440"
              placeholder="e.g., 60"
              {...register('estimatedTime', { valueAsNumber: true })}
              className={errors.estimatedTime ? 'border-red-500' : ''}
            />
            {errors.estimatedTime && (
              <p className="text-sm text-red-600 mt-1">{errors.estimatedTime.message}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={categoryId || undefined}
            onValueChange={(value) => setValue('categoryId', value || null)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category (optional)" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <Label>Tags (optional)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-md hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  <Checkbox
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm">{tag.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recurring Task */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isRecurring}
              onCheckedChange={(checked) => {
                setValue('isRecurring', checked as boolean);
                if (!checked) {
                  setValue('recurringPattern', null);
                }
              }}
            />
            <Label className="flex items-center gap-2 cursor-pointer">
              <Repeat className="h-4 w-4" />
              Make this a recurring task
            </Label>
          </div>

          {isRecurring && (
            <div>
              <Label htmlFor="recurringPattern">Recurring Pattern</Label>
              <Select
                value={recurringPattern || undefined}
                onValueChange={(value) => setValue('recurringPattern', value as RecurringPattern)}
              >
                <SelectTrigger id="recurringPattern">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RecurringPattern.DAILY}>Daily</SelectItem>
                  <SelectItem value={RecurringPattern.WEEKLY}>Weekly</SelectItem>
                  <SelectItem value={RecurringPattern.MONTHLY}>Monthly</SelectItem>
                </SelectContent>
              </Select>
              {errors.recurringPattern && (
                <p className="text-sm text-red-600 mt-1">{errors.recurringPattern.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={createTask.isPending}>
            {createTask.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createTask.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
