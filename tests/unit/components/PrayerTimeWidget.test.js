import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PrayerTimeWidget from '@/components/PrayerTimeWidget.vue'

// Mock the notification service
vi.mock('@/services/notificationService.js', () => ({
  default: {
    scheduleAllPrayerNotifications: vi.fn(),
    clearAllScheduledNotifications: vi.fn(),
    requestPermission: vi.fn(() => Promise.resolve(true)),
    showNotification: vi.fn(),
    getPermissionStatus: vi.fn(() => 'granted'),
    permission: 'granted'
  }
}))

describe('PrayerTimeWidget Component', () => {
  let wrapper
  
  const mockLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York'
  }

  // Mock fetch API
  beforeEach(() => {
    global.fetch = vi.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve({
          code: 200,
          data: {
            timings: {
              Fajr: '05:30',
              Sunrise: '06:45',
              Dhuhr: '12:30',
              Asr: '15:45',
              Maghrib: '18:15',
              Isha: '19:30'
            }
          }
        })
      })
    )

    wrapper = mount(PrayerTimeWidget, {
      props: {
        location: mockLocation
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    wrapper?.unmount()
  })

  describe('Component Rendering', () => {
    it('renders component successfully', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('renders prayer widget container', () => {
      expect(wrapper.find('.prayer-time-widget').exists()).toBe(true)
    })

    it('shows notification controls', () => {
      expect(wrapper.find('.notification-controls').exists()).toBe(true)
    })

    it('shows enable notifications button when notifications disabled', () => {
      expect(wrapper.find('.enable-btn').exists()).toBe(true)
      expect(wrapper.find('.enable-btn').text()).toContain('Enable Prayer Notifications')
    })
  })

  describe('Prayer Times Display', () => {
    beforeEach(async () => {
      // Simulate successful API response
      wrapper.vm.prayerTimes = {
        Fajr: '05:30',
        Sunrise: '06:45', 
        Dhuhr: '12:30',
        Asr: '15:45',
        Maghrib: '18:15',
        Isha: '19:30'
      }
      await wrapper.vm.$nextTick()
    })

    it('displays prayer times when available', () => {
      const prayerList = wrapper.find('.prayer-list')
      expect(prayerList.exists()).toBe(true)
      
      const prayerItems = wrapper.findAll('.prayer-item')
      expect(prayerItems.length).toBe(5) // 5 major prayers
    })

    it('displays correct prayer names and times', () => {
      const prayerItems = wrapper.findAll('.prayer-item')
      
      // Check first prayer item (Fajr)
      const fajrItem = prayerItems.find(item => 
        item.find('.prayer-name').text() === 'Fajr'
      )
      expect(fajrItem).toBeTruthy()
      expect(fajrItem.find('.prayer-time').text()).toBe('05:30')
    })

    it('shows next prayer countdown', () => {
      const nextPrayerContainer = wrapper.find('.next-prayer-container')
      expect(nextPrayerContainer.exists()).toBe(true)
      
      const nextPrayerLabel = wrapper.find('.next-prayer-label')
      expect(nextPrayerLabel.text()).toBe('Next Prayer In')
      
      const nextPrayerTime = wrapper.find('.next-prayer-time')
      expect(nextPrayerTime.exists()).toBe(true)
    })

    it('displays prayer icons correctly', () => {
      const prayerItems = wrapper.findAll('.prayer-item')
      
      prayerItems.forEach(item => {
        const icon = item.find('.prayer-icon')
        expect(icon.exists()).toBe(true)
        expect(icon.classes()).toContain('fas')
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when API fails', async () => {
      wrapper.vm.error = 'Failed to fetch prayer times'
      await wrapper.vm.$nextTick()
      
      const errorMessage = wrapper.find('.error-message')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('Failed to fetch prayer times')
    })

    it('hides prayer list when there is an error', async () => {
      wrapper.vm.error = 'Network error'
      await wrapper.vm.$nextTick()
      
      const prayerList = wrapper.find('.prayer-list')
      expect(prayerList.exists()).toBe(false)
    })
  })

  describe('Notification System', () => {
    it('shows enable button when notifications are disabled', () => {
      expect(wrapper.vm.notificationsEnabled).toBe(false)
      
      const enableBtn = wrapper.find('.enable-btn')
      expect(enableBtn.exists()).toBe(true)
    })

    it('shows notification status when notifications are enabled', async () => {
      wrapper.vm.notificationsEnabled = true
      await wrapper.vm.$nextTick()
      
      const notificationStatus = wrapper.find('.notification-status')
      expect(notificationStatus.exists()).toBe(true)
      expect(notificationStatus.text()).toContain('Notifications On')
    })

    it('toggles notification settings', async () => {
      wrapper.vm.notificationsEnabled = true
      await wrapper.vm.$nextTick()
      
      const settingsBtn = wrapper.find('.settings-btn')
      await settingsBtn.trigger('click')
      
      expect(wrapper.vm.showNotificationSettings).toBe(true)
      
      const notificationSettings = wrapper.find('.notification-settings')
      expect(notificationSettings.exists()).toBe(true)
    })

    it('enables notifications when enable button is clicked', async () => {
      const enableBtn = wrapper.find('.enable-btn')
      await enableBtn.trigger('click')
      
      expect(wrapper.vm.notificationsEnabled).toBe(true)
    })

    it('disables notifications when disable button is clicked', async () => {
      wrapper.vm.notificationsEnabled = true
      await wrapper.vm.$nextTick()
      
      const disableBtn = wrapper.find('.disable-btn')
      await disableBtn.trigger('click')
      
      expect(wrapper.vm.notificationsEnabled).toBe(false)
    })
  })

  describe('Notification Configuration', () => {
    beforeEach(async () => {
      wrapper.vm.notificationsEnabled = true
      wrapper.vm.showNotificationSettings = true
      await wrapper.vm.$nextTick()
    })

    it('shows notification configuration options', () => {
      const exactTimeCheckbox = wrapper.find('input[type="checkbox"]')
      expect(exactTimeCheckbox.exists()).toBe(true)
      
      const advanceSelect = wrapper.find('select')
      expect(advanceSelect.exists()).toBe(true)
    })

    it('updates exact time notification setting', async () => {
      const exactTimeCheckbox = wrapper.findAll('input[type="checkbox"]')[0]
      
      await exactTimeCheckbox.setChecked(false)
      expect(wrapper.vm.notificationConfig.exactTime).toBe(false)
    })

    it('updates advance notification setting', async () => {
      const advanceCheckbox = wrapper.findAll('input[type="checkbox"]')[1]
      
      await advanceCheckbox.setChecked(true)
      expect(wrapper.vm.notificationConfig.advanceNotification).toBe(true)
    })

    it('updates advance notification minutes', async () => {
      // First, enable advance notifications so the select is not disabled
      wrapper.vm.notificationConfig.advanceNotification = true
      await wrapper.vm.$nextTick()
      
      const advanceSelect = wrapper.find('select')
      expect(advanceSelect.attributes('disabled')).toBeFalsy()
      
      await advanceSelect.setValue('15')
      await wrapper.vm.$nextTick()
      
      // The v-model binding should update the value
      const actualValue = wrapper.vm.notificationConfig.advanceMinutes
      expect(actualValue).toBe('15')
    })
  })

  describe('API Integration', () => {
    it('calls fetchPrayerTimes when location changes', async () => {
      const fetchSpy = vi.spyOn(wrapper.vm, 'fetchPrayerTimes')
      
      await wrapper.setProps({
        location: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      })
      
      expect(fetchSpy).toHaveBeenCalled()
    })

    it('handles successful API response', async () => {
      await wrapper.vm.fetchPrayerTimes(40.7128, -74.0060)
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.aladhan.com/v1/timings')
      )
      
      expect(wrapper.vm.prayerTimes.Fajr).toBe('05:30')
      expect(wrapper.vm.prayerTimes.Dhuhr).toBe('12:30')
    })

    it('handles API error gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
      
      await wrapper.vm.fetchPrayerTimes(40.7128, -74.0060)
      
      expect(wrapper.vm.error).toBeTruthy()
    })
  })

  describe('Computed Properties', () => {
    beforeEach(() => {
      wrapper.vm.prayerTimes = {
        Fajr: '05:30',
        Sunrise: '06:45',
        Dhuhr: '12:30',
        Asr: '15:45',
        Maghrib: '18:15',
        Isha: '19:30',
        Midnight: '00:30' // Should be filtered out
      }
    })

    it('filters prayer times to show only major prayers', () => {
      const filtered = wrapper.vm.filteredPrayerTimes
      
      expect(filtered).toHaveLength(5)
      expect(filtered.map(p => p.name)).toEqual(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'])
    })

    it('adds icons to prayer times', () => {
      const filtered = wrapper.vm.filteredPrayerTimes
      
      filtered.forEach(prayer => {
        expect(prayer.icon).toBeTruthy()
        expect(prayer.icon).toContain('fas')
      })
    })
  })

  describe('Component Methods', () => {
    it('has enableNotifications method', () => {
      expect(typeof wrapper.vm.enableNotifications).toBe('function')
    })

    it('has disableNotifications method', () => {
      expect(typeof wrapper.vm.disableNotifications).toBe('function')
    })

    it('has toggleNotificationSettings method', () => {
      expect(typeof wrapper.vm.toggleNotificationSettings).toBe('function')
    })

    it('has fetchPrayerTimes method', () => {
      expect(typeof wrapper.vm.fetchPrayerTimes).toBe('function')
    })
  })

  describe('Geolocation Integration', () => {
    it('calls geolocation when getLocation is called', () => {
      // Mock geolocation
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => success({
          coords: { latitude: 40.7128, longitude: -74.0060 }
        }))
      }
      
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      })
      
      wrapper.vm.getLocation()
      
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
      expect(wrapper.emitted('location-updated')).toBeTruthy()
    })

    it('handles geolocation not supported', () => {
      // Mock console.error to prevent test output noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Remove geolocation support
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true
      })
      
      wrapper.vm.getLocation()
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Geolocation is not supported by this browser.'
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Component Props', () => {
    it('accepts location prop correctly', () => {
      expect(wrapper.props('location')).toEqual(mockLocation)
    })

    it('requires location prop', () => {
      const componentOptions = wrapper.vm.$options
      expect(componentOptions.props.location.required).toBe(true)
    })
  })

  describe('Component Data', () => {
    it('has correct initial data', () => {
      // Create fresh wrapper without automatic location prop fetch
      const freshWrapper = mount(PrayerTimeWidget, {
        props: {
          location: { latitude: 0, longitude: 0 }
        }
      })
      
      expect(freshWrapper.vm.error).toBe(null)
      expect(freshWrapper.vm.notificationsEnabled).toBe(false)
      expect(freshWrapper.vm.showNotificationSettings).toBe(false)
      
      freshWrapper.unmount()
    })

    it('has notification configuration', () => {
      expect(wrapper.vm.notificationConfig).toEqual({
        exactTime: true,
        advanceNotification: false,
        advanceMinutes: 10
      })
    })

    it('has prayer icons configuration', () => {
      expect(wrapper.vm.prayerIcons.Fajr).toBe('fas fa-cloud-sun')
      expect(wrapper.vm.prayerIcons.Dhuhr).toBe('fas fa-sun')
      expect(wrapper.vm.prayerIcons.Maghrib).toBe('fas fa-cloud-moon')
    })
  })
})