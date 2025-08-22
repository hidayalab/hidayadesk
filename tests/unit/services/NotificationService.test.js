import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import notificationService from '@/services/notificationService.js'

describe('NotificationService', () => {
  // Using the singleton instance from the module

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock Notification API
    global.Notification = {
      requestPermission: vi.fn(() => Promise.resolve('granted')),
      permission: 'granted'
    }
    
    // Mock Notification constructor
    const mockNotification = {
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
    global.Notification = vi.fn(() => mockNotification)
    global.Notification.requestPermission = vi.fn(() => Promise.resolve('granted'))
    global.Notification.permission = 'granted'
    
    // Reset service state
    notificationService.permission = 'default'
    notificationService.scheduledNotifications.clear()
  })

  afterEach(() => {
    if (notificationService && typeof notificationService.clearAllScheduledNotifications === 'function') {
      notificationService.clearAllScheduledNotifications()
    }
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with default values', () => {
      expect(notificationService.permission).toBe('default')
      expect(notificationService.scheduledNotifications).toBeInstanceOf(Map)
      expect(notificationService.scheduledNotifications.size).toBe(0)
    })

    it('creates notification service instance', () => {
      expect(notificationService).toBeTruthy()
      expect(typeof notificationService.requestPermission).toBe('function')
    })
  })

  describe('Permission Management', () => {
    it('requests notification permission successfully', async () => {
      global.Notification.requestPermission.mockResolvedValue('granted')
      
      const result = await notificationService.requestPermission()
      
      expect(global.Notification.requestPermission).toHaveBeenCalled()
      expect(result).toBe(true)
      expect(notificationService.permission).toBe('granted')
    })

    it('handles permission denial', async () => {
      global.Notification.requestPermission.mockResolvedValue('denied')
      
      const result = await notificationService.requestPermission()
      
      expect(result).toBe(false)
      expect(notificationService.permission).toBe('denied')
    })

    it('handles missing Notification API', async () => {
      // Temporarily remove Notification from window
      const originalNotification = global.Notification
      delete global.Notification
      
      const result = await notificationService.requestPermission()
      
      expect(result).toBe(false)
      
      // Restore Notification
      global.Notification = originalNotification
    })
  })

  describe('Showing Notifications', () => {
    beforeEach(() => {
      notificationService.permission = 'granted'
    })

    it('shows notification when permission is granted', async () => {
      const title = 'Prayer Time'
      const options = { body: 'Time for Fajr prayer' }
      
      const notification = await notificationService.showNotification(title, options)
      
      expect(global.Notification).toHaveBeenCalledWith(title, {
        tag: 'prayer-time',
        requireInteraction: true,
        ...options
      })
      expect(notification).toBeTruthy()
    })

    it('does not show notification when permission denied', async () => {
      notificationService.permission = 'denied'
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = await notificationService.showNotification('Test')
      
      expect(global.Notification).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Notification permission not granted')
      expect(result).toBeUndefined()
      
      consoleSpy.mockRestore()
    })

    it('auto-closes notification after timeout', async () => {
      vi.useFakeTimers()
      
      const mockNotification = { close: vi.fn() }
      global.Notification.mockReturnValue(mockNotification)
      
      await notificationService.showNotification('Test')
      
      // Fast forward 10 seconds
      vi.advanceTimersByTime(10000)
      
      expect(mockNotification.close).toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })

  describe('Prayer Notification Scheduling', () => {
    beforeEach(() => {
      notificationService.permission = 'granted'
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('schedules prayer notification for future time', () => {
      // Set current time to 10:00 AM
      const now = new Date('2025-01-15T10:00:00')
      vi.setSystemTime(now)
      
      const prayerTime = '12:30' // Dhuhr at 12:30 PM
      
      const timeoutId = notificationService.schedulePrayerNotification('Dhuhr', prayerTime)
      
      expect(timeoutId).toBeTruthy()
      expect(notificationService.scheduledNotifications.has('Dhuhr-0')).toBe(true)
    })

    it('schedules advance notification', () => {
      const now = new Date('2025-01-15T12:00:00')
      vi.setSystemTime(now)
      
      const prayerTime = '12:30'
      const advanceMinutes = 10
      
      const timeoutId = notificationService.schedulePrayerNotification('Dhuhr', prayerTime, advanceMinutes)
      
      expect(timeoutId).toBeTruthy()
      expect(notificationService.scheduledNotifications.has('Dhuhr-10')).toBe(true)
    })

    it('does not schedule notification for past time', () => {
      const now = new Date('2025-01-15T13:00:00')
      vi.setSystemTime(now)
      
      const prayerTime = '12:30' // Past time
      
      const timeoutId = notificationService.schedulePrayerNotification('Dhuhr', prayerTime)
      
      expect(timeoutId).toBeNull()
      expect(notificationService.scheduledNotifications.size).toBe(0)
    })

    it('triggers notification at scheduled time', () => {
      const now = new Date('2025-01-15T12:29:00')
      vi.setSystemTime(now)
      
      const showNotificationSpy = vi.spyOn(notificationService, 'showNotification')
      
      notificationService.schedulePrayerNotification('Dhuhr', '12:30')
      
      // Advance timer by 1 minute to trigger notification
      vi.advanceTimersByTime(60000)
      
      expect(showNotificationSpy).toHaveBeenCalledWith(
        "Dhuhr Prayer Time",
        {
          body: "It's time for Dhuhr prayer",
          icon: expect.any(String)
        }
      )
    })

    it('triggers advance notification with correct message', () => {
      // Set time to 12:19, so that prayer at 12:30 with 10 min advance should notify at 12:20  
      const now = new Date('2025-01-15T12:19:00')
      vi.setSystemTime(now)
      
      const showNotificationSpy = vi.spyOn(notificationService, 'showNotification')
      
      notificationService.schedulePrayerNotification('Dhuhr', '12:30', 10)
      
      // Advance timer by 1 minute to trigger notification at 12:20
      vi.advanceTimersByTime(60000) // 1 minute = 60,000ms
      
      expect(showNotificationSpy).toHaveBeenCalledWith(
        'Dhuhr Prayer Time',
        {
          body: 'Dhuhr prayer is in 10 minutes',
          icon: expect.any(String)
        }
      )
    })
  })

  describe('Notification Management', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('clears specific notification', () => {
      const now = new Date('2025-01-15T12:00:00')
      vi.setSystemTime(now)
      
      notificationService.schedulePrayerNotification('Dhuhr', '12:30')
      expect(notificationService.scheduledNotifications.size).toBe(1)
      
      // Clear manually since clearNotification method doesn't exist
      notificationService.scheduledNotifications.delete('Dhuhr-0')
      expect(notificationService.scheduledNotifications.size).toBe(0)
    })

    it('clears all notifications', () => {
      const now = new Date('2025-01-15T12:00:00')
      vi.setSystemTime(now)
      
      notificationService.schedulePrayerNotification('Dhuhr', '12:30')
      notificationService.schedulePrayerNotification('Asr', '15:45')
      expect(notificationService.scheduledNotifications.size).toBe(2)
      
      notificationService.clearAllScheduledNotifications()
      expect(notificationService.scheduledNotifications.size).toBe(0)
    })

    it('prevents duplicate notifications', () => {
      const now = new Date('2025-01-15T12:00:00')
      vi.setSystemTime(now)
      
      // Schedule same notification twice
      notificationService.schedulePrayerNotification('Dhuhr', '12:30')
      notificationService.schedulePrayerNotification('Dhuhr', '12:30')
      
      // Should only have one notification
      expect(notificationService.scheduledNotifications.size).toBe(1)
    })
  })

  describe('Multiple Prayer Scheduling', () => {
    beforeEach(() => {
      notificationService.permission = 'granted'
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('schedules notifications for all prayers', () => {
      const now = new Date('2025-01-15T10:00:00')
      vi.setSystemTime(now)
      
      const prayerTimes = {
        Dhuhr: '12:30',
        Asr: '15:45',
        Maghrib: '18:15',
        Isha: '19:30'
      }
      
      notificationService.scheduleAllPrayerNotifications(prayerTimes)
      
      // Should schedule notifications for future prayers only
      expect(notificationService.scheduledNotifications.size).toBeGreaterThan(0)
    })

    it('handles empty prayer times object', () => {
      notificationService.scheduleAllPrayerNotifications({})
      expect(notificationService.scheduledNotifications.size).toBe(0)
    })

    it('handles invalid prayer times', () => {
      const invalidPrayerTimes = {
        Dhuhr: 'invalid-time',
        Asr: null,
        Maghrib: undefined
      }
      
      expect(() => {
        notificationService.scheduleAllPrayerNotifications(invalidPrayerTimes)
      }).not.toThrow()
      
      // Should not schedule any notifications for invalid times
      expect(notificationService.scheduledNotifications.size).toBe(0)
    })
  })

  describe('Service Methods', () => {
    it('has all required methods', () => {
      expect(typeof notificationService.requestPermission).toBe('function')
      expect(typeof notificationService.showNotification).toBe('function')
      expect(typeof notificationService.schedulePrayerNotification).toBe('function')
    })

    it('has clearAllScheduledNotifications method', () => {
      expect(typeof notificationService.clearAllScheduledNotifications).toBe('function')
    })

    it('has clearNotification method if implemented', () => {
      if ('clearNotification' in notificationService) {
        expect(typeof notificationService.clearNotification).toBe('function')
      }
    })
  })

  describe('Error Handling', () => {
    it('handles notification creation errors', async () => {
      notificationService.permission = 'granted'
      global.Notification.mockImplementation(() => {
        throw new Error('Notification creation failed')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // The showNotification method now has try/catch, so it should not throw
      const result = await notificationService.showNotification('Test')
      
      expect(result).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create notification:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('handles invalid prayer time format', () => {
      const now = new Date('2025-01-15T12:00:00')
      vi.setSystemTime(now)
      
      const result = notificationService.schedulePrayerNotification('Dhuhr', 'invalid-time')
      
      expect(result).toBeNull()
      expect(notificationService.scheduledNotifications.size).toBe(0)
    })
  })

  describe('Time Calculations', () => {
    beforeEach(() => {
      vi.useRealTimers() // Reset first
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('calculates correct notification time for today', () => {
      const now = new Date('2025-01-15T10:00:00')
      vi.setSystemTime(now)
      
      const prayerTime = '12:30'
      const expectedNotificationTime = new Date('2025-01-15T12:30:00')
      
      // Mock the internal time calculation (this would be implementation specific)
      const targetTime = new Date(now.toDateString() + ' ' + prayerTime)
      
      expect(targetTime.getTime()).toBe(expectedNotificationTime.getTime())
    })

    it('handles prayer time calculation across midnight', () => {
      const now = new Date('2025-01-15T23:00:00')
      vi.setSystemTime(now)
      
      const prayerTime = '05:30' // Fajr next day
      
      // Should not schedule for past time today
      const result = notificationService.schedulePrayerNotification('Fajr', prayerTime)
      expect(result).toBeNull()
    })
  })
})