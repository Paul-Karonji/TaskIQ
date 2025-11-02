import { getPriorityColorClass, getPriorityBadgeColor, scrollToTask } from '@/lib/utils'
import { Priority } from '@/types'

describe('Utils - Priority Color Functions', () => {
  describe('getPriorityColorClass', () => {
    it('should return correct color class for HIGH priority', () => {
      const result = getPriorityColorClass(Priority.HIGH)
      expect(result).toContain('border-l-red-500')
      expect(result).toContain('dark:border-l-red-400')
    })

    it('should return correct color class for MEDIUM priority', () => {
      const result = getPriorityColorClass(Priority.MEDIUM)
      expect(result).toContain('border-l-amber-500')
      expect(result).toContain('dark:border-l-amber-400')
    })

    it('should return correct color class for LOW priority', () => {
      const result = getPriorityColorClass(Priority.LOW)
      expect(result).toContain('border-l-emerald-500')
      expect(result).toContain('dark:border-l-emerald-400')
    })
  })

  describe('getPriorityBadgeColor', () => {
    it('should return correct badge variant for HIGH priority', () => {
      const result = getPriorityBadgeColor(Priority.HIGH)
      expect(result).toBe('destructive')
    })

    it('should return correct badge variant for MEDIUM priority', () => {
      const result = getPriorityBadgeColor(Priority.MEDIUM)
      expect(result).toBe('default')
    })

    it('should return correct badge variant for LOW priority', () => {
      const result = getPriorityBadgeColor(Priority.LOW)
      expect(result).toBe('secondary')
    })
  })

  describe('scrollToTask', () => {
    it('should attempt to scroll to element with given taskId', () => {
      const mockElement = {
        scrollIntoView: jest.fn(),
      }

      // Mock getElementById
      const getElementByIdSpy = jest.spyOn(document, 'getElementById')
      getElementByIdSpy.mockReturnValue(mockElement as any)

      scrollToTask('test-task-id')

      expect(getElementByIdSpy).toHaveBeenCalledWith('task-test-task-id')
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      })

      getElementByIdSpy.mockRestore()
    })

    it('should handle case when element is not found', () => {
      const getElementByIdSpy = jest.spyOn(document, 'getElementById')
      getElementByIdSpy.mockReturnValue(null)

      // Should not throw error
      expect(() => scrollToTask('non-existent-id')).not.toThrow()

      getElementByIdSpy.mockRestore()
    })
  })
})
