/**
 * Unit tests for TaskCard component
 * Tests rendering, interactions, and edge cases
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Priority, Status } from '@/types'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('TaskCard Component', () => {
  const mockTask = {
    id: 'task-1',
    userId: 'user-1',
    title: 'Test Task',
    description: 'This is a test task description',
    dueDate: new Date('2025-11-01T00:00:00.000Z'),
    dueTime: '14:00',
    priority: Priority.HIGH,
    status: Status.PENDING,
    categoryId: null,
    googleEventId: null,
    isRecurring: false,
    recurringPattern: null,
    estimatedTime: 60,
    completedAt: null,
    createdAt: new Date('2025-10-01T00:00:00.000Z'),
    updatedAt: new Date('2025-10-01T00:00:00.000Z'),
    category: {
      id: 'cat-1',
      name: 'Work',
      color: '#10B981',
    },
    tags: [
      {
        tag: {
          id: 'tag-1',
          name: 'urgent',
          color: '#EF4444',
        },
      },
    ],
  }

  const mockHandlers = {
    onToggleComplete: jest.fn(),
    onDelete: jest.fn(),
    onArchive: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render task title and description', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('This is a test task description')).toBeInTheDocument()
  })

  it('should display priority border color for HIGH priority', () => {
    const { container } = render(<TaskCard task={mockTask} {...mockHandlers} />)

    const card = container.firstChild
    expect(card).toHaveClass('border-l-red-500')
  })

  it('should display priority border color for MEDIUM priority', () => {
    const mediumTask = { ...mockTask, priority: Priority.MEDIUM }
    const { container } = render(<TaskCard task={mediumTask} {...mockHandlers} />)

    const card = container.firstChild
    expect(card).toHaveClass('border-l-amber-500')
  })

  it('should display priority border color for LOW priority', () => {
    const lowTask = { ...mockTask, priority: Priority.LOW }
    const { container } = render(<TaskCard task={lowTask} {...mockHandlers} />)

    const card = container.firstChild
    expect(card).toHaveClass('border-l-emerald-500')
  })

  it('should display due date and time', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)

    expect(screen.getByText(/Nov 1, 2025/)).toBeInTheDocument()
    expect(screen.getByText(/14:00/)).toBeInTheDocument()
  })

  it('should display category badge', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)

    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('should display tag badges', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)

    expect(screen.getByText('urgent')).toBeInTheDocument()
  })

  it('should display estimated time', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)

    expect(screen.getByText(/60 min/)).toBeInTheDocument()
  })

  it('should call onToggleComplete when checkbox is clicked', async () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith('task-1', true)
    })
  })

  it('should have checked checkbox for completed tasks', () => {
    const completedTask = {
      ...mockTask,
      status: Status.COMPLETED,
      completedAt: new Date(),
    }

    render(<TaskCard task={completedTask} {...mockHandlers} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('should show strikethrough for completed tasks', () => {
    const completedTask = {
      ...mockTask,
      status: Status.COMPLETED,
      completedAt: new Date(),
    }

    render(<TaskCard task={completedTask} {...mockHandlers} />)

    const titleElement = screen.getByText('Test Task')
    expect(titleElement).toHaveClass('line-through')
  })

  it('should show overdue indicator for past due dates', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date('2020-01-01T00:00:00.000Z'),
    }

    render(<TaskCard task={overdueTask} {...mockHandlers} />)

    expect(screen.getByText(/overdue/i)).toBeInTheDocument()
  })

  it('should call onDelete when delete button is clicked', async () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />)

    const deleteButton = screen.getByLabelText(/delete/i)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockHandlers.onDelete).toHaveBeenCalledWith('task-1')
    })
  })

  it('should show recurring indicator for recurring tasks', () => {
    const recurringTask = {
      ...mockTask,
      isRecurring: true,
      recurringPattern: 'DAILY' as const,
    }

    render(<TaskCard task={recurringTask} {...mockHandlers} />)

    expect(screen.getByTitle(/recurring/i)).toBeInTheDocument()
  })

  it('should show calendar sync status', () => {
    const syncedTask = {
      ...mockTask,
      googleEventId: 'event-123',
    }

    render(<TaskCard task={syncedTask} {...mockHandlers} />)

    expect(screen.getByTitle(/synced with google calendar/i)).toBeInTheDocument()
  })

  it('should handle tasks without description', () => {
    const taskWithoutDescription = {
      ...mockTask,
      description: null,
    }

    render(<TaskCard task={taskWithoutDescription} {...mockHandlers} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.queryByText('This is a test task description')).not.toBeInTheDocument()
  })

  it('should handle tasks without category', () => {
    const taskWithoutCategory = {
      ...mockTask,
      category: null,
      categoryId: null,
    }

    render(<TaskCard task={taskWithoutCategory} {...mockHandlers} />)

    expect(screen.queryByText('Work')).not.toBeInTheDocument()
  })

  it('should handle tasks without tags', () => {
    const taskWithoutTags = {
      ...mockTask,
      tags: [],
    }

    render(<TaskCard task={taskWithoutTags} {...mockHandlers} />)

    expect(screen.queryByText('urgent')).not.toBeInTheDocument()
  })
})
