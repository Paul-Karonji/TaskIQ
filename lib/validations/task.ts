// Zod validation schemas for tasks

import { z } from 'zod';
import { Priority, Status, RecurringPattern } from '@prisma/client';

// Time format validation (HH:mm)
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Create task schema
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  dueDate: z.coerce.date({
    message: 'Due date is required',
  }),
  dueTime: z
    .string()
    .regex(timeRegex, 'Time must be in HH:mm format (e.g., 14:30)')
    .optional()
    .nullable(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  categoryId: z.string().cuid().optional().nullable(),
  estimatedTime: z
    .number()
    .int()
    .min(1, 'Estimated time must be at least 1 minute')
    .max(1440, 'Estimated time cannot exceed 24 hours')
    .optional()
    .nullable(),
  tagIds: z.array(z.string().cuid()).optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.nativeEnum(RecurringPattern).optional().nullable(),
});

// Update task schema (all fields optional except where noted)
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  dueDate: z.coerce.date().optional(),
  dueTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional().nullable(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(Status).optional(),
  categoryId: z.string().cuid().optional().nullable(),
  estimatedTime: z
    .number()
    .int()
    .min(1)
    .max(1440)
    .optional()
    .nullable(),
  tagIds: z.array(z.string().cuid()).optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.nativeEnum(RecurringPattern).optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
});

// Quick add task schema (minimal required fields)
export const quickAddTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  dueDate: z.coerce.date(),
  dueTime: z.string().regex(timeRegex).optional().nullable(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  estimatedTime: z.number().int().min(1).max(1440).optional().nullable(),
});

// Query parameter schemas for filtering
export const taskQuerySchema = z.object({
  status: z.nativeEnum(Status).optional(),
  priority: z.nativeEnum(Priority).optional(),
  categoryId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(), // Filter by single tag
  search: z.string().max(255).optional(),
  date: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// Complete task schema
export const completeTaskSchema = z.object({
  completed: z.boolean(),
});

// Task ID parameter schema
export const taskIdSchema = z.object({
  id: z.string().cuid('Invalid task ID'),
});

// Types inferred from schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type QuickAddTaskInput = z.infer<typeof quickAddTaskSchema>;
export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
