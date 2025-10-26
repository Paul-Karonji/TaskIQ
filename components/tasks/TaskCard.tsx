'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Tag as TagIcon,
  Folder,
} from 'lucide-react';
import {
  cn,
  formatRelativeDate,
  formatTime12Hour,
  formatEstimatedTime,
  getPriorityColorClass,
  getPriorityBgClass,
  getPriorityTextClass,
  isOverdue,
} from '@/lib/utils';
import { PRIORITY_LABELS } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = task.status === 'COMPLETED';
  const taskIsOverdue = isOverdue(task.dueDate, task.status);

  const handleCheckboxChange = (checked: boolean) => {
    onToggleComplete?.(task.id, checked);
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01]',
        getPriorityColorClass(task.priority),
        'border-l-4',
        isCompleted && 'opacity-60'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleCheckboxChange}
          className="mt-1"
          aria-label={`Mark "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={cn(
              'text-base font-semibold text-gray-900 mb-1',
              isCompleted && 'line-through text-gray-500'
            )}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p
              className={cn(
                'text-sm text-gray-600 mb-2 line-clamp-2',
                isCompleted && 'text-gray-400'
              )}
            >
              {task.description}
            </p>
          )}

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {/* Due Date */}
            <div
              className={cn(
                'flex items-center gap-1',
                taskIsOverdue && 'text-red-600 font-medium'
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>{formatRelativeDate(task.dueDate)}</span>
              {task.dueTime && (
                <>
                  <span className="mx-1">•</span>
                  <Clock className="h-4 w-4" />
                  <span>{formatTime12Hour(task.dueTime)}</span>
                </>
              )}
            </div>

            {/* Estimated Time */}
            {task.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatEstimatedTime(task.estimatedTime)}</span>
              </div>
            )}

            {/* Category */}
            {task.category && (
              <div className="flex items-center gap-1">
                <Folder className="h-4 w-4" />
                <span>{task.category.name}</span>
              </div>
            )}
          </div>

          {/* Tags and Priority */}
          {(task.tags && task.tags.length > 0) || task.priority && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Priority Badge */}
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs font-medium',
                  getPriorityBgClass(task.priority),
                  getPriorityTextClass(task.priority)
                )}
              >
                {PRIORITY_LABELS[task.priority]}
              </Badge>

              {/* Tags */}
              {task.tags?.map((taskTag) => (
                <Badge
                  key={taskTag.tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: taskTag.tag.color,
                    color: taskTag.tag.color,
                  }}
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {taskTag.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons (show on hover) */}
        {(isHovered || window.innerWidth < 768) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                aria-label={`Edit task "${task.title}"`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                aria-label={`Delete task "${task.title}"`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overdue indicator */}
      {taskIsOverdue && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Overdue
          </span>
        </div>
      )}
    </div>
  );
}
