// React Query hooks for task management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/types';

// Fetch all tasks with filters
export function useTasks(userId: string | undefined, filters?: TaskFilters) {
  const queryParams = new URLSearchParams();

  if (filters?.status && filters.status !== 'ALL') {
    queryParams.set('status', filters.status);
  }
  if (filters?.priority && filters.priority !== 'ALL') {
    queryParams.set('priority', filters.priority);
  }
  if (filters?.categoryId) {
    queryParams.set('categoryId', filters.categoryId);
  }
  if (filters?.search) {
    queryParams.set('search', filters.search);
  }
  if (filters?.date) {
    const dateStr = typeof filters.date === 'string' ? filters.date : filters.date.toISOString();
    queryParams.set('date', dateStr);
  }

  return useQuery({
    queryKey: ['tasks', userId, filters],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return res.json() as Promise<{ tasks: Task[]; total: number }>;
    },
    enabled: !!userId, // Only run query if userId exists
  });
}

// Fetch today's tasks
export function useTodayTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', userId, 'today'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/today');
      if (!res.ok) {
        throw new Error('Failed to fetch today\'s tasks');
      }
      return res.json() as Promise<{ tasks: Task[]; total: number }>;
    },
    enabled: !!userId,
  });
}

// Fetch a single task
export function useTask(userId: string | undefined, taskId: string) {
  return useQuery({
    queryKey: ['tasks', userId, taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch task');
      }
      return res.json() as Promise<{ task: Task }>;
    },
    enabled: !!userId && !!taskId,
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create task');
      }

      return res.json() as Promise<{ task: Task }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Update a task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update task');
      }

      return res.json() as Promise<{ task: Task }>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete task');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Toggle task completion
export function useToggleTaskComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: completed ? 'COMPLETED' : 'PENDING',
          completedAt: completed ? new Date().toISOString() : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to toggle task');
      }

      return res.json() as Promise<{ task: Task }>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
    },
    onMutate: async ({ id, completed }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old?.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.map((task: Task) =>
            task.id === id
              ? {
                  ...task,
                  status: completed ? 'COMPLETED' : 'PENDING',
                  completedAt: completed ? new Date().toISOString() : null,
                }
              : task
          ),
        };
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
  });
}

// Fetch completed tasks
export function useCompletedTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', userId, 'completed'],
    queryFn: async () => {
      const res = await fetch('/api/tasks?status=COMPLETED');
      if (!res.ok) {
        throw new Error('Failed to fetch completed tasks');
      }
      return res.json() as Promise<{ tasks: Task[]; total: number }>;
    },
    enabled: !!userId,
  });
}

// Fetch HIGH priority tasks for next 7 days
export function useHighPriorityUpcoming(userId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', userId, 'high-priority-upcoming'],
    queryFn: async () => {
      const res = await fetch('/api/tasks?priority=HIGH&status=PENDING');
      if (!res.ok) {
        throw new Error('Failed to fetch high priority tasks');
      }
      const data = await res.json() as { tasks: Task[]; total: number };

      // Filter to next 7 days on client side
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);

      const filtered = data.tasks.filter((task) => {
        const dueDate = new Date(task.dueDate);
        return dueDate <= sevenDaysFromNow;
      });

      return { tasks: filtered, total: filtered.length };
    },
    enabled: !!userId,
  });
}

// Fetch next 5 HIGH priority tasks (for priority queue widget)
export function usePriorityQueue(userId: string | undefined, limit: number = 5) {
  return useQuery({
    queryKey: ['tasks', userId, 'priority-queue', limit],
    queryFn: async () => {
      const res = await fetch('/api/tasks?priority=HIGH&status=PENDING');
      if (!res.ok) {
        throw new Error('Failed to fetch priority queue');
      }
      const data = await res.json() as { tasks: Task[]; total: number };

      // Take only the first N tasks (they're already sorted by due date)
      const limited = data.tasks.slice(0, limit);

      return { tasks: limited, total: data.total };
    },
    enabled: !!userId,
  });
}
