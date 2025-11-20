// Utility functions for DueSync

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isPast, isThisWeek, parseISO, addDays, addWeeks, addMonths } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { Priority, Status, RecurringPattern } from '@prisma/client';
import { PRIORITY_COLORS } from '@/types';

/**
 * Merges class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display (timezone-aware)
 * @param date - Date to format
 * @param formatStr - Format string (default: 'MMM d, yyyy')
 * @param timezone - IANA timezone (default: browser's timezone)
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy', timezone?: string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (timezone) {
    return formatInTimeZone(dateObj, timezone, formatStr);
  }

  return format(dateObj, formatStr);
}

/**
 * Format a date relative to today (Today, Tomorrow, or date) - timezone-aware
 * @param date - Date to format
 * @param timezone - IANA timezone (default: browser's timezone)
 */
export function formatRelativeDate(date: Date | string, timezone?: string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = timezone ? toZonedTime(dateObj, timezone) : dateObj;

  if (isToday(zonedDate)) {
    return 'Today';
  }

  if (isTomorrow(zonedDate)) {
    return 'Tomorrow';
  }

  if (isThisWeek(zonedDate)) {
    return format(zonedDate, 'EEEE'); // Day name
  }

  return format(zonedDate, 'MMM d');
}

/**
 * Format date and time together (timezone-aware)
 * @param date - Date to format
 * @param time - Time string (HH:mm)
 * @param timezone - IANA timezone (default: browser's timezone)
 */
export function formatDateTime(date: Date | string, time?: string | null, timezone?: string): string {
  const dateStr = formatRelativeDate(date, timezone);

  if (time) {
    const time12 = formatTime12Hour(time);
    return `${dateStr} at ${time12}`;
  }

  return dateStr;
}

/**
 * Check if a task is overdue
 */
export function isOverdue(dueDate: Date | string, status: Status): boolean {
  if (status === 'COMPLETED' || status === 'ARCHIVED') {
    return false;
  }

  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isPast(dateObj) && !isToday(dateObj);
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority];
}

/**
 * Get priority color class for Tailwind (with dark mode support)
 */
export function getPriorityColorClass(priority: Priority): string {
  const colorMap = {
    HIGH: 'border-l-red-500 dark:border-l-red-400',
    MEDIUM: 'border-l-amber-500 dark:border-l-amber-400',
    LOW: 'border-l-emerald-500 dark:border-l-emerald-400',
  };
  return colorMap[priority];
}

/**
 * Get priority text color class for Tailwind (with dark mode support)
 */
export function getPriorityTextClass(priority: Priority): string {
  const colorMap = {
    HIGH: 'text-red-700 dark:text-red-300',
    MEDIUM: 'text-amber-700 dark:text-amber-300',
    LOW: 'text-emerald-700 dark:text-emerald-300',
  };
  return colorMap[priority];
}

/**
 * Get priority background color class for Tailwind (with dark mode support)
 */
export function getPriorityBgClass(priority: Priority): string {
  const colorMap = {
    HIGH: 'bg-red-100 dark:bg-red-900/30',
    MEDIUM: 'bg-amber-100 dark:bg-amber-900/30',
    LOW: 'bg-emerald-100 dark:bg-emerald-900/30',
  };
  return colorMap[priority];
}

/**
 * Format estimated time
 */
export function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Parse time string (HH:mm) to hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Format time string to 12-hour format
 */
export function formatTime12Hour(timeStr: string): string {
  const { hours, minutes } = parseTime(timeStr);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Calculate the next due date for a recurring task
 * Handles edge cases like monthly recurring on the 31st
 */
export function calculateNextRecurringDate(
  currentDueDate: Date,
  pattern: RecurringPattern
): Date {
  const baseDate = new Date(currentDueDate);

  switch (pattern) {
    case 'DAILY':
      return addDays(baseDate, 1);

    case 'WEEKLY':
      return addWeeks(baseDate, 1);

    case 'MONTHLY':
      // addMonths from date-fns handles edge cases automatically
      // e.g., Jan 31 + 1 month = Feb 28/29 (last day of Feb)
      return addMonths(baseDate, 1);

    default:
      throw new Error(`Unknown recurring pattern: ${pattern}`);
  }
}

/**
 * Scroll to a task in the DOM and highlight it
 * @param taskId - The task ID to scroll to
 */
export function scrollToTask(taskId: string) {
  // Find the task element by data attribute
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

  if (taskElement) {
    // Scroll to the element with smooth behavior
    taskElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // Add a highlight animation
    taskElement.classList.add('ring-4', 'ring-indigo-300', 'dark:ring-indigo-500', 'ring-opacity-75');

    // Remove the highlight after 2 seconds
    setTimeout(() => {
      taskElement.classList.remove('ring-4', 'ring-indigo-300', 'dark:ring-indigo-500', 'ring-opacity-75');
    }, 2000);
  }
}
