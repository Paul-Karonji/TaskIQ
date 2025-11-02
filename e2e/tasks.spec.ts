import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Task Management
 * Tests task CRUD operations, filtering, and search
 *
 * Note: These tests require authenticated state.
 * For CI/CD, you should set up auth state storage.
 */

test.describe('Task Creation', () => {
  test.skip('should create a new task with all fields', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/')

    // Click "Add a task" button to expand the form
    await page.getByRole('button', { name: /add a task/i }).click()

    // Fill out the task form
    await page.getByLabel(/title/i).fill('E2E Test Task')
    await page.getByLabel(/description/i).fill('This task was created by E2E test')

    // Set due date
    await page.getByLabel(/due date/i).fill('2025-12-01')

    // Set due time
    await page.getByLabel(/due time/i).fill('14:00')

    // Select priority
    await page.getByLabel(/priority/i).selectOption('HIGH')

    // Set estimated time
    await page.getByLabel(/estimated time/i).fill('60')

    // Submit the form
    await page.getByRole('button', { name: /create task/i }).click()

    // Wait for success toast
    await expect(page.getByText(/task created/i)).toBeVisible()

    // Verify task appears in the list
    await expect(page.getByText('E2E Test Task')).toBeVisible()
  })

  test.skip('should create a task with minimal required fields', async ({ page }) => {
    await page.goto('/')

    // Expand quick add form
    await page.getByRole('button', { name: /add a task/i }).click()

    // Fill only required fields
    await page.getByLabel(/title/i).fill('Minimal Task')
    await page.getByLabel(/due date/i).fill('2025-12-01')

    // Submit
    await page.getByRole('button', { name: /create task/i }).click()

    // Verify success
    await expect(page.getByText(/task created/i)).toBeVisible()
    await expect(page.getByText('Minimal Task')).toBeVisible()
  })

  test.skip('should show validation error for missing required fields', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /add a task/i }).click()

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create task/i }).click()

    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible()
  })
})

test.describe('Task Completion', () => {
  test.skip('should mark task as complete', async ({ page }) => {
    await page.goto('/')

    // Find a task and click its checkbox
    const taskCheckbox = page.locator('[role="checkbox"]').first()
    await taskCheckbox.click()

    // Verify success toast
    await expect(page.getByText(/task completed/i)).toBeVisible()

    // Verify task has strikethrough styling
    const taskTitle = page.locator('.line-through').first()
    await expect(taskTitle).toBeVisible()
  })

  test.skip('should unmark completed task', async ({ page }) => {
    await page.goto('/')

    // Find a completed task (checked checkbox)
    const completedCheckbox = page.locator('[role="checkbox"][checked]').first()
    await completedCheckbox.click()

    // Verify success toast
    await expect(page.getByText(/task marked as pending/i)).toBeVisible()
  })
})

test.describe('Task Filtering', () => {
  test.skip('should filter tasks by status', async ({ page }) => {
    await page.goto('/')

    // Click status filter dropdown
    await page.getByLabel(/status/i).click()

    // Select "Completed"
    await page.getByRole('option', { name: /completed/i }).click()

    // Verify URL updated with filter
    await expect(page).toHaveURL(/.*status=COMPLETED/)

    // All visible tasks should be completed (have strikethrough)
    const tasks = page.locator('[data-testid="task-card"]')
    const count = await tasks.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(tasks.nth(i).locator('.line-through')).toBeVisible()
      }
    }
  })

  test.skip('should filter tasks by priority', async ({ page }) => {
    await page.goto('/')

    // Select HIGH priority filter
    await page.getByLabel(/priority/i).selectOption('HIGH')

    // Verify URL updated
    await expect(page).toHaveURL(/.*priority=HIGH/)

    // All visible tasks should have red border (HIGH priority)
    const tasks = page.locator('[data-testid="task-card"]')
    const count = await tasks.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(tasks.nth(i)).toHaveClass(/border-l-red-500/)
      }
    }
  })

  test.skip('should search tasks by title', async ({ page }) => {
    await page.goto('/')

    // Type in search box
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('meeting')

    // Wait for debounced search (300ms)
    await page.waitForTimeout(400)

    // All visible tasks should contain "meeting" in title
    const tasks = page.getByText(/meeting/i)
    await expect(tasks.first()).toBeVisible()
  })

  test.skip('should clear all filters', async ({ page }) => {
    await page.goto('/')

    // Apply some filters
    await page.getByLabel(/status/i).selectOption('COMPLETED')
    await page.getByLabel(/priority/i).selectOption('HIGH')

    // Click clear filters
    await page.getByRole('button', { name: /clear filters/i }).click()

    // Verify URL cleared
    await expect(page).toHaveURL('/')
  })
})

test.describe('Task Deletion', () => {
  test.skip('should delete a task with confirmation', async ({ page }) => {
    await page.goto('/')

    // Get the first task's title for verification
    const firstTaskTitle = await page.locator('[data-testid="task-card"]').first().textContent()

    // Click delete button (might be in hover menu)
    await page.locator('[data-testid="task-card"]').first().hover()
    await page.getByRole('button', { name: /delete/i }).first().click()

    // Confirm deletion in dialog
    page.once('dialog', dialog => dialog.accept())

    // Verify success toast
    await expect(page.getByText(/task deleted/i)).toBeVisible()

    // Verify task no longer exists
    await expect(page.getByText(firstTaskTitle || '')).not.toBeVisible()
  })
})

test.describe('Task Statistics', () => {
  test.skip('should display task statistics', async ({ page }) => {
    await page.goto('/')

    // Should show total tasks
    await expect(page.getByText(/total tasks/i)).toBeVisible()

    // Should show pending count
    await expect(page.getByText(/pending/i)).toBeVisible()

    // Should show completed count
    await expect(page.getByText(/completed/i)).toBeVisible()
  })
})
