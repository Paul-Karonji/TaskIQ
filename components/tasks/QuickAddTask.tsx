'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Loader2, Repeat } from 'lucide-react';
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

interface QuickAddTaskProps {
  onTaskCreated?: () => void;
  onSubmit?: (data: CreateTaskInput) => Promise<void>;
}

export function QuickAddTask({ onTaskCreated, onSubmit }: QuickAddTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

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

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Include selected tags in the submission
      const taskData = {
        ...data,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      };

      if (onSubmit) {
        await onSubmit(taskData);
      } else {
        // Default submission logic
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to create task');
        }
      }

      toast.success('Task created successfully!');
      reset();
      setSelectedTags([]);
      setIsExpanded(false);
      onTaskCreated?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
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
        className="w-full flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Add a task</span>
      </button>
    );
  }

  // Expanded form state
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="What needs to be done?"
            {...register('title')}
            className={errors.title ? 'border-red-500' : ''}
            autoFocus
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add more details..."
            rows={3}
            {...register('description')}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
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
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
