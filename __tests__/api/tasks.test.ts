/**
 * Unit tests for Task API endpoints
 * Tests: GET /api/tasks, POST /api/tasks
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/tasks/route'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
}

describe('Tasks API - GET /api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue(mockSession as any)
  })

  it('should return 401 if user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/tasks')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should return tasks for authenticated user', async () => {
    const mockTasks = [
      {
        id: 'task-1',
        userId: 'test-user-id',
        title: 'Test Task 1',
        description: 'Description 1',
        dueDate: new Date('2025-11-01'),
        priority: 'HIGH',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        tags: [],
      },
      {
        id: 'task-2',
        userId: 'test-user-id',
        title: 'Test Task 2',
        description: 'Description 2',
        dueDate: new Date('2025-11-02'),
        priority: 'MEDIUM',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        tags: [],
      },
    ]

    // Mock Prisma findMany
    ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)
    ;(prisma.task.count as jest.Mock).mockResolvedValue(2)

    const request = new NextRequest('http://localhost:3000/api/tasks')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.tasks).toHaveLength(2)
    expect(data.total).toBe(2)
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'test-user-id' },
      })
    )
  })

  it('should filter tasks by status', async () => {
    ;(prisma.task.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.task.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/tasks?status=COMPLETED')
    await GET(request)

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'test-user-id',
          status: 'COMPLETED',
        },
      })
    )
  })

  it('should filter tasks by priority', async () => {
    ;(prisma.task.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.task.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/tasks?priority=HIGH')
    await GET(request)

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'test-user-id',
          priority: 'HIGH',
        },
      })
    )
  })

  it('should search tasks by title and description', async () => {
    ;(prisma.task.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.task.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/tasks?search=meeting')
    await GET(request)

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'test-user-id',
          OR: [
            { title: { contains: 'meeting', mode: 'insensitive' } },
            { description: { contains: 'meeting', mode: 'insensitive' } },
          ],
        },
      })
    )
  })
})

describe('Tasks API - POST /api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue(mockSession as any)
  })

  it('should return 401 if user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Task',
        dueDate: '2025-11-01',
        priority: 'HIGH',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('should create a new task with valid data', async () => {
    const taskData = {
      title: 'New Task',
      description: 'Task description',
      dueDate: '2025-11-01',
      dueTime: '14:00',
      priority: 'HIGH',
      estimatedTime: 60,
    }

    const createdTask = {
      id: 'new-task-id',
      userId: 'test-user-id',
      ...taskData,
      dueDate: new Date(taskData.dueDate),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      category: null,
      tags: [],
    }

    ;(prisma.task.create as jest.Mock).mockResolvedValue(createdTask)

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.task.title).toBe('New Task')
    expect(prisma.task.create).toHaveBeenCalled()
  })

  it('should return 400 for invalid task data', async () => {
    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required 'title' field
        dueDate: '2025-11-01',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  it('should set default priority to MEDIUM if not provided', async () => {
    const taskData = {
      title: 'Task without priority',
      dueDate: '2025-11-01',
    }

    const createdTask = {
      id: 'new-task-id',
      userId: 'test-user-id',
      title: taskData.title,
      dueDate: new Date(taskData.dueDate),
      priority: 'MEDIUM',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    ;(prisma.task.create as jest.Mock).mockResolvedValue(createdTask)

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.task.priority).toBe('MEDIUM')
  })
})
