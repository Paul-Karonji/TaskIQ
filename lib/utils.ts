// Utility functions for TaskIQ

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isPast, isThisWeek, parseISO } from 'date-fns';
import { Priority, Status } from '@prisma/client';
import { PRIORITY_COLORS } from '@/types';

/**
 * Merges class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date relative to today (Today, Tomorrow, or date)
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return 'Today';
  }

  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }

  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE'); // Day name
  }

  return format(dateObj, 'MMM d');
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
 * Get priority color class for Tailwind
 */
export function getPriorityColorClass(priority: Priority): string {
  const colorMap = {
    HIGH: 'border-red-500',
    MEDIUM: 'border-amber-500',
    LOW: 'border-green-500',
  };
  return colorMap[priority];
}

/**
 * Get priority text color class for Tailwind
 */
export function getPriorityTextClass(priority: Priority): string {
  const colorMap = {
    HIGH: 'text-red-600',
    MEDIUM: 'text-amber-600',
    LOW: 'text-green-600',
  };
  return colorMap[priority];
}

/**
 * Get priority background color class for Tailwind
 */
export function getPriorityBgClass(priority: Priority): string {
  const colorMap = {
    HIGH: 'bg-red-50',
    MEDIUM: 'bg-amber-50',
    LOW: 'bg-green-50',
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
