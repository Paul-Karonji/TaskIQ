// types/index.ts
import { Task, Tag, Category, Priority, Status, RecurringPattern } from "@prisma/client"

// Extended Task type with relations
export type TaskWithRelations = Task & {
  tags: Tag[]
  category: Category | null
}

// Form input types
export type CreateTaskInput = {
  title: string
  description?: string
  dueDate: Date
  dueTime?: string
  priority?: Priority
  categoryId?: string
  tagIds?: string[]
  isRecurring?: boolean
  recurringPattern?: RecurringPattern
  estimatedTime?: number
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  status?: Status
  completedAt?: Date
}

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}