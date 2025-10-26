// TypeScript types for TaskIQ

import { Priority, Status, RecurringPattern } from '@prisma/client';

// Task types
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  dueDate: Date | string;
  dueTime?: string | null;
  priority: Priority;
  status: Status;
  categoryId?: string | null;
  googleEventId?: string | null;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern | null;
  estimatedTime?: number | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: Category | null;
  tags?: TaskTag[];
}

// Category types
export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date | string;
}

// Tag types
export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date | string;
}

// TaskTag join table
export interface TaskTag {
  taskId: string;
  tagId: string;
  tag: Tag;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: Date | string | null;
  image?: string | null;
  googleId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page?: number;
  limit?: number;
}

// Filter types
export interface TaskFilters {
  status?: Status | 'ALL';
  priority?: Priority | 'ALL';
  categoryId?: string;
  search?: string;
  date?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
}

// Form types
export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate: Date | string;
  dueTime?: string;
  priority?: Priority;
  categoryId?: string;
  estimatedTime?: number;
  tagIds?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: Status;
  completedAt?: Date | string | null;
}

// Priority color mapping
export const PRIORITY_COLORS: Record<Priority, string> = {
  HIGH: '#EF4444', // red-500
  MEDIUM: '#F59E0B', // amber-500
  LOW: '#10B981', // green-500
};

// Status display names
export const STATUS_LABELS: Record<Status, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

// Priority display names
export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}