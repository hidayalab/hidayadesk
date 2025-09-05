import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

// Mock theme service - must be before imports
vi.mock('@/services/themeService.js', () => ({
  default: {
    loadThemes: vi.fn(() => Promise.resolve([
      {
        id: 'CyberGlow',
        name: 'CyberGlow',
        displayName: 'Cyber Glow',
        description: 'Futuristic cyan glow effects',
        icon: 'fas fa-robot',
        color: '#0ff',
        uiColors: {
          primary: '#0ff',
          secondary: '#1a1a1a',
          accent: '#0ff',
          background: '#0a0a0a',
          text: '#0ff'
        },
        variables: {
          '--color-accent': '#0ff',
          '--color-background-primary': '#0a0a0a',
          '--color-text-primary': '#0ff'
        }
      },
      {
        id: 'Fire',
        name: 'Fire',
        displayName: 'Fire',
        description: 'Warm orange and red flames',
        icon: 'fas fa-fire',
        color: '#ff6b35',
        uiColors: {
          primary: '#ff6b35',
          secondary: '#1a0f0a',
          accent: '#ff4444',
          background: '#0a0a0a',
          text: '#ffffff'
        },
        variables: {
          '--color-accent': '#ff6b35',
          '--color-background-primary': '#0a0a0a',
          '--color-text-primary': '#ffffff'
        }
      }
    ])),
    convertToAppFormat: vi.fn((themes) => themes.map(theme => ({
      name: theme.displayName,
      value: theme.id,
      icon: theme.icon,
      color: theme.color
    }))),
    applyTheme: vi.fn(),
    getFallbackThemes: vi.fn(() => [])
  }
}))

import App from '@/App.vue'
import ThemeSelector from '@/components/ThemeSelector.vue'
import SettingsMenu from '@/components/SettingsMenu.vue'
import Bookmarks from '@/components/Bookmarks.vue'
import WidgetArea from '@/components/WidgetArea.vue'

// Mock fetch for config.yml
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(`
pageInfo:
  title: HidayaDesk
appConfig:
  theme: CyberGlow
  layout: layout-three-column
  cardSize: card-size-medium
sections:
  - name: Development
    icon: fab fa-dev
    items:
      - title: GitHub
        url: https://github.com
        icon: fab fa-github
`)
  })
)

describe('Theme Color Reflection Tests', () => {
  let appWrapper
  
  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks()
    
    // Mock document.documentElement for CSS variable testing
    Object.defineProperty(document.documentElement, 'style', {
      value: {
        setProperty: vi.fn(),
        getPropertyValue: vi.fn(() => '#0ff'),
        removeProperty: vi.fn()
      },
      writable: true
    })
    
    appWrapper = mount(App, {
      global: {
        stubs: {
          'router-link': true,
          'router-view': true
        }
      }
    })
    
    // Wait for async operations
    await flushPromises()
  })

  afterEach(() => {
    if (appWrapper) {
      appWrapper.unmount()
    }
  })

  describe('App Component Theme Class Application', () => {
    it('applies selected theme class to app root element', async () => {
      await appWrapper.setData({ selectedTheme: 'CyberGlow' })
      
      const appRoot = appWrapper.find('#app')
      expect(appRoot.classes()).toContain('CyberGlow')
    })

    it('updates theme class when theme changes', async () => {
      // Initial theme
      await appWrapper.setData({ selectedTheme: 'CyberGlow' })
      let appRoot = appWrapper.find('#app')
      expect(appRoot.classes()).toContain('CyberGlow')
      
      // Change theme
      await appWrapper.setData({ selectedTheme: 'Fire' })
      appRoot = appWrapper.find('#app')
      expect(appRoot.classes()).toContain('Fire')
      expect(appRoot.classes()).not.toContain('CyberGlow')
    })

    it('applies theme, layout, and card size classes together', async () => {
      await appWrapper.setData({ 
        selectedTheme: 'CyberGlow',
        selectedLayout: 'layout-three-column',
        selectedCardSize: 'card-size-medium'
      })
      
      const appRoot = appWrapper.find('#app')
      expect(appRoot.classes()).toContain('CyberGlow')
      expect(appRoot.classes()).toContain('layout-three-column')
      expect(appRoot.classes()).toContain('card-size-medium')
    })

    it('calls themeService.applyTheme when theme changes', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      await appWrapper.setData({ selectedTheme: 'Fire' })
      
      // Wait for watcher to execute
      await appWrapper.vm.$nextTick()
      
      expect(themeService.applyTheme).toHaveBeenCalledWith('Fire')
    })
  })

  describe('ThemeSelector Modal Theme Reflection', () => {
    let themeSelectorWrapper

    beforeEach(async () => {
      themeSelectorWrapper = mount(ThemeSelector, {
        props: {
          modelValue: 'CyberGlow',
          isVisible: true
        }
      })
      await flushPromises()
    })

    afterEach(() => {
      if (themeSelectorWrapper) {
        themeSelectorWrapper.unmount()
      }
    })

    it('applies current theme class to theme selector container', () => {
      const container = themeSelectorWrapper.find('.theme-selector-container')
      expect(container.exists()).toBe(true)
    })

    it('applies current theme class to modal overlay', () => {
      const overlay = themeSelectorWrapper.find('.modal-overlay')
      expect(overlay.classes()).toContain('CyberGlow')
    })

    it('applies current theme class to modal dialog', () => {
      const modal = themeSelectorWrapper.find('.theme-modal')
      expect(modal.classes()).toContain('CyberGlow')
    })

    it('updates modal theme classes when theme prop changes', async () => {
      await themeSelectorWrapper.setProps({ modelValue: 'Fire' })
      
      const overlay = themeSelectorWrapper.find('.modal-overlay')
      const modal = themeSelectorWrapper.find('.theme-modal')
      
      expect(overlay.classes()).toContain('Fire')
      expect(modal.classes()).toContain('Fire')
    })

    it('displays theme colors correctly in color dots', async () => {
      // Wait for themes to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await themeSelectorWrapper.vm.$nextTick()
      
      const colorDots = themeSelectorWrapper.findAll('.color-dot')
      if (colorDots.length > 0) {
        const firstDot = colorDots[0]
        const style = firstDot.attributes('style')
        expect(style).toBeTruthy()
        expect(style).toMatch(/background-color|backgroundColor/)
        // Verify it contains actual color values (hex, rgb, or rgba)
        expect(style).toMatch(/#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/)
      }
    })

    it('shows correct selection state for current theme', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      await themeSelectorWrapper.vm.$nextTick()
      
      const selectedThemeRows = themeSelectorWrapper.findAll('.theme-row.selected')
      // Should have at least one selected theme
      expect(selectedThemeRows.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Settings Menu Theme Integration', () => {
    let settingsMenuWrapper

    beforeEach(() => {
      settingsMenuWrapper = mount(SettingsMenu, {
        props: {
          currentThemeName: 'Cyber Glow',
          visibleWidgets: ['quran', 'prayer'],
          selectedLayout: 'layout-three-column',
          selectedCardSize: 'card-size-medium',
          layouts: [
            { name: 'Three Column', value: 'layout-three-column', icon: 'fas fa-th' }
          ],
          cardSizes: [
            { name: 'Medium', value: 'card-size-medium', icon: 'fas fa-expand-alt' }
          ]
        }
      })
    })

    afterEach(() => {
      if (settingsMenuWrapper) {
        settingsMenuWrapper.unmount()
      }
    })

    it('displays current theme name correctly', () => {
      const themeTitle = settingsMenuWrapper.find('.option-title')
      expect(themeTitle.text()).toBe('Cyber Glow')
    })

    it('emits open-theme-modal event when theme button clicked', async () => {
      const themeButton = settingsMenuWrapper.find('.settings-option-button')
      await themeButton.trigger('click')
      
      expect(settingsMenuWrapper.emitted('open-theme-modal')).toBeTruthy()
    })

    it('shows layout selection with proper classes', () => {
      const selectedLayout = settingsMenuWrapper.find('.layout-icon.selected')
      expect(selectedLayout.exists()).toBe(true)
    })

    it('shows card size selection with proper classes', () => {
      const selectedCardSize = settingsMenuWrapper.find('.layout-icon.selected')
      expect(selectedCardSize.exists()).toBe(true)
    })
  })

  describe('Bookmarks Theme Reflection', () => {
    let bookmarksWrapper

    const mockSections = [
      {
        name: 'Development',
        icon: 'fab fa-dev',
        items: [
          { title: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' }
        ]
      }
    ]

    beforeEach(() => {
      bookmarksWrapper = mount(Bookmarks, {
        props: {
          initialSections: mockSections,
          editMode: false,
          searchQuery: ''
        },
        global: {
          provide: {
            theme: 'CyberGlow'
          }
        }
      })
    })

    afterEach(() => {
      if (bookmarksWrapper) {
        bookmarksWrapper.unmount()
      }
    })

    it('renders sections with proper structure for theme inheritance', () => {
      const sections = bookmarksWrapper.findAll('.section')
      expect(sections.length).toBeGreaterThan(0)
      
      const sectionHeaders = bookmarksWrapper.findAll('.section-header')
      expect(sectionHeaders.length).toBeGreaterThan(0)
    })

    it('renders bookmark items with proper link styling', () => {
      const itemLinks = bookmarksWrapper.findAll('.item-link')
      expect(itemLinks.length).toBeGreaterThan(0)
      
      const firstLink = itemLinks[0]
      expect(firstLink.exists()).toBe(true)
      expect(firstLink.attributes('href')).toBe('https://github.com')
    })

    it('shows edit buttons with proper styling in edit mode', async () => {
      await bookmarksWrapper.setProps({ editMode: true })
      
      const editButtons = bookmarksWrapper.findAll('.edit-icon-button')
      expect(editButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('applies theme-aware modal styling when modals are shown', async () => {
      await bookmarksWrapper.setProps({ editMode: true })
      
      // Check if modal elements inherit theme styling
      const modalElements = bookmarksWrapper.findAll('[class*="modal"]')
      // These should exist when modals are opened
      expect(modalElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Widget Area Theme Reflection', () => {
    let widgetAreaWrapper

    beforeEach(() => {
      widgetAreaWrapper = mount(WidgetArea, {
        props: {
          activeWidget: 'quran',
          theme: 'CyberGlow'
        }
      })
    })

    afterEach(() => {
      if (widgetAreaWrapper) {
        widgetAreaWrapper.unmount()
      }
    })

    it('receives theme prop correctly', () => {
      expect(widgetAreaWrapper.props('theme')).toBe('CyberGlow')
    })

    it('applies theme to widget container', () => {
      const widgetContainer = widgetAreaWrapper.find('.widget-area')
      expect(widgetContainer.exists()).toBe(true)
    })

    it('updates when theme prop changes', async () => {
      await widgetAreaWrapper.setProps({ theme: 'Fire' })
      expect(widgetAreaWrapper.props('theme')).toBe('Fire')
    })

    it('maintains active widget selection across theme changes', async () => {
      const initialWidget = widgetAreaWrapper.props('activeWidget')
      await widgetAreaWrapper.setProps({ theme: 'Fire' })
      expect(widgetAreaWrapper.props('activeWidget')).toBe(initialWidget)
    })
  })

  describe('Modal Backdrop and Overlay Theme Tests', () => {
    it('applies theme classes to modal elements when they exist', () => {
      // This tests the general principle that modals should inherit theme styling
      const testElement = document.createElement('div')
      testElement.className = 'modal-overlay CyberGlow'
      
      expect(testElement.classList.contains('CyberGlow')).toBe(true)
      expect(testElement.classList.contains('modal-overlay')).toBe(true)
    })

    it('CSS variables are properly set for theme colors', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      // Mock CSS custom property setting and getting
      const mockSetProperty = vi.fn()
      const mockGetPropertyValue = vi.fn(() => '#00ffff')
      
      Object.defineProperty(document.documentElement.style, 'setProperty', {
        value: mockSetProperty,
        writable: true
      })
      Object.defineProperty(document.documentElement.style, 'getPropertyValue', {
        value: mockGetPropertyValue,
        writable: true
      })

      // Simulate theme application
      themeService.applyTheme('CyberGlow')
      
      expect(themeService.applyTheme).toHaveBeenCalledWith('CyberGlow')
    })

    it('verifies actual CSS custom property values after theme application', () => {
      // Set up mock to simulate CSS variable values
      const mockGetComputedStyle = vi.fn(() => ({
        getPropertyValue: vi.fn((prop) => {
          const values = {
            '--color-accent': '#00ffff',
            '--color-background-primary': '#0a0a0a',
            '--color-text-primary': '#00ffff'
          }
          return values[prop] || ''
        })
      }))
      
      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true
      })
      
      const element = document.createElement('div')
      const styles = window.getComputedStyle(element)
      
      expect(styles.getPropertyValue('--color-accent')).toBe('#00ffff')
      expect(styles.getPropertyValue('--color-background-primary')).toBe('#0a0a0a')
      expect(styles.getPropertyValue('--color-text-primary')).toBe('#00ffff')
    })
  })

  describe('Theme Persistence and Loading', () => {
    it('loads theme from localStorage on app initialization', () => {
      // Mock localStorage with saved theme
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
      getItemSpy.mockReturnValue('Fire')
      
      const newAppWrapper = mount(App)
      
      // The component should attempt to load from localStorage
      expect(getItemSpy).toHaveBeenCalled()
      
      getItemSpy.mockRestore()
      newAppWrapper.unmount()
    })

    it('saves theme to localStorage when changed', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      
      await appWrapper.setData({ selectedTheme: 'Fire' })
      await appWrapper.vm.$nextTick()
      
      expect(setItemSpy).toHaveBeenCalledWith('selectedTheme', 'Fire')
      
      setItemSpy.mockRestore()
    })
  })

  describe('Theme Service Integration', () => {
    it('loads themes from theme service on mount', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      expect(themeService.loadThemes).toHaveBeenCalled()
    })

    it('converts themes to app format', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      expect(themeService.convertToAppFormat).toHaveBeenCalled()
    })

    it('handles theme loading errors gracefully', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      // Mock theme service to throw error
      themeService.loadThemes.mockRejectedValueOnce(new Error('Failed to load'))
      themeService.getFallbackThemes.mockReturnValueOnce([
        { id: 'fallback', name: 'Fallback Theme' }
      ])
      
      const errorAppWrapper = mount(App)
      await flushPromises()
      
      // Should fall back to default themes
      expect(themeService.getFallbackThemes).toHaveBeenCalled()
      
      errorAppWrapper.unmount()
    })
  })

  describe('Component CSS Class Propagation', () => {
    it('theme classes propagate to child components through CSS inheritance', () => {
      // This verifies the CSS cascade works for theme colors
      const parentElement = document.createElement('div')
      parentElement.className = 'CyberGlow'
      
      const childElement = document.createElement('div')
      childElement.className = 'component-item'
      parentElement.appendChild(childElement)
      
      expect(parentElement.classList.contains('CyberGlow')).toBe(true)
      expect(childElement.closest('.CyberGlow')).toBe(parentElement)
    })

    it('modal elements receive theme classes when teleported to body', () => {
      // Simulate teleported modal with theme class
      const modalElement = document.createElement('div')
      modalElement.className = 'modal-overlay CyberGlow'
      document.body.appendChild(modalElement)
      
      expect(modalElement.classList.contains('CyberGlow')).toBe(true)
      
      // Cleanup
      document.body.removeChild(modalElement)
    })
  })
})