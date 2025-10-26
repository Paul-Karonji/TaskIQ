'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTaskSchema, CreateTaskInput } from '@/lib/validations/task';
import { Priority } from '@prisma/client';
import { PRIORITY_LABELS } from '@/types';
import { toast } from 'sonner';

interface QuickAddTaskProps {
  onTaskCreated?: () => void;
  onSubmit?: (data: CreateTaskInput) => Promise<void>;
}

export function QuickAddTask({ onTaskCreated, onSubmit }: QuickAddTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  const priority = watch('priority');

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default submission logic
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to create task');
        }
      }

      toast.success('Task created successfully!');
      reset();
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
    setIsExpanded(false);
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
