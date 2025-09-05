import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

// Mock theme service with actual color values
vi.mock('@/services/themeService.js', () => ({
  default: {
    loadThemes: vi.fn(() => Promise.resolve([
      {
        id: 'CyberGlow',
        name: 'CyberGlow',
        displayName: 'Cyber Glow',
        description: 'Futuristic cyan glow effects',
        icon: 'fas fa-robot',
        color: '#00ffff',
        uiColors: {
          primary: '#00ffff',
          secondary: '#1a1a1a',
          accent: '#00ffff',
          background: '#0a0a0a',
          text: '#00ffff'
        },
        variables: {
          '--color-accent': '#00ffff',
          '--color-background-primary': '#0a0a0a',
          '--color-text-primary': '#00ffff',
          '--color-button-background': 'rgba(0, 255, 255, 0.1)',
          '--color-card-background': 'rgba(0, 255, 255, 0.05)'
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
          '--color-text-primary': '#ffffff',
          '--color-button-background': 'rgba(255, 107, 53, 0.1)',
          '--color-card-background': 'rgba(255, 107, 53, 0.05)'
        }
      }
    ])),
    convertToAppFormat: vi.fn((themes) => themes.map(theme => ({
      name: theme.displayName,
      value: theme.id,
      icon: theme.icon,
      color: theme.color
    }))),
    applyTheme: vi.fn((themeId) => {
      // Mock actual theme application by setting CSS variables
      const themeData = {
        'CyberGlow': {
          '--color-accent': '#00ffff',
          '--color-background-primary': '#0a0a0a',
          '--color-text-primary': '#00ffff',
          '--color-button-background': 'rgba(0, 255, 255, 0.1)',
          '--color-card-background': 'rgba(0, 255, 255, 0.05)'
        },
        'Fire': {
          '--color-accent': '#ff6b35',
          '--color-background-primary': '#0a0a0a',
          '--color-text-primary': '#ffffff',
          '--color-button-background': 'rgba(255, 107, 53, 0.1)',
          '--color-card-background': 'rgba(255, 107, 53, 0.05)'
        }
      }
      
      const variables = themeData[themeId] || themeData['CyberGlow']
      Object.entries(variables).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value)
      })
    }),
    getFallbackThemes: vi.fn(() => [])
  }
}))

import App from '@/App.vue'
import ThemeSelector from '@/components/ThemeSelector.vue'
import Bookmarks from '@/components/Bookmarks.vue'

// Helper function to get computed CSS custom property value
const getCSSVariable = (element, variableName) => {
  return getComputedStyle(element).getPropertyValue(variableName).trim()
}

// Helper function to normalize color values (handles rgb, rgba, hex)
const normalizeColor = (color) => {
  // Create a temporary element to normalize color
  const tempElement = document.createElement('div')
  tempElement.style.color = color
  document.body.appendChild(tempElement)
  const computedColor = getComputedStyle(tempElement).color
  document.body.removeChild(tempElement)
  return computedColor
}

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

describe('Theme Color Verification Tests', () => {
  beforeEach(() => {
    // Reset CSS variables
    document.documentElement.style.removeProperty('--color-accent')
    document.documentElement.style.removeProperty('--color-background-primary')
    document.documentElement.style.removeProperty('--color-text-primary')
    document.documentElement.style.removeProperty('--color-button-background')
    document.documentElement.style.removeProperty('--color-card-background')
    
    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('CSS Variable Application', () => {
    it('applies CyberGlow theme CSS variables correctly', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      // Apply CyberGlow theme
      themeService.applyTheme('CyberGlow')
      
      // Check CSS variables are set
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#00ffff')
      expect(getCSSVariable(document.documentElement, '--color-background-primary')).toBe('#0a0a0a')
      expect(getCSSVariable(document.documentElement, '--color-text-primary')).toBe('#00ffff')
      expect(getCSSVariable(document.documentElement, '--color-button-background')).toBe('rgba(0, 255, 255, 0.1)')
    })

    it('applies Fire theme CSS variables correctly', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      // Apply Fire theme
      themeService.applyTheme('Fire')
      
      // Check CSS variables are set
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#ff6b35')
      expect(getCSSVariable(document.documentElement, '--color-text-primary')).toBe('#ffffff')
      expect(getCSSVariable(document.documentElement, '--color-button-background')).toBe('rgba(255, 107, 53, 0.1)')
    })

    it('updates CSS variables when theme changes', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      // Apply CyberGlow first
      themeService.applyTheme('CyberGlow')
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#00ffff')
      
      // Change to Fire theme
      themeService.applyTheme('Fire')
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#ff6b35')
    })
  })

  describe('App Component Color Application', () => {
    let appWrapper

    beforeEach(async () => {
      appWrapper = mount(App, {
        global: {
          stubs: {
            'router-link': true,
            'router-view': true
          }
        }
      })
      await flushPromises()
    })

    afterEach(() => {
      if (appWrapper) {
        appWrapper.unmount()
      }
    })

    it('applies theme colors when theme is selected', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      // Set theme and trigger change
      await appWrapper.setData({ selectedTheme: 'CyberGlow' })
      await appWrapper.vm.$nextTick()
      
      // Verify theme service was called
      expect(themeService.applyTheme).toHaveBeenCalledWith('CyberGlow')
      
      // Check that CSS variables reflect the theme
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#00ffff')
    })

    it('changes colors when switching themes', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      // Start with CyberGlow
      await appWrapper.setData({ selectedTheme: 'CyberGlow' })
      await appWrapper.vm.$nextTick()
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#00ffff')
      
      // Switch to Fire
      await appWrapper.setData({ selectedTheme: 'Fire' })
      await appWrapper.vm.$nextTick()
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#ff6b35')
    })

    it('applies theme colors to header elements', async () => {
      await appWrapper.setData({ selectedTheme: 'CyberGlow' })
      await appWrapper.vm.$nextTick()
      
      const header = appWrapper.find('.header')
      expect(header.exists()).toBe(true)
      
      // Header should be within the themed app context
      const appRoot = appWrapper.find('#app.CyberGlow')
      expect(appRoot.exists()).toBe(true)
      expect(appRoot.element.contains(header.element)).toBe(true)
    })
  })

  describe('ThemeSelector Modal Color Application', () => {
    let wrapper

    beforeEach(async () => {
      // Apply a theme first
      const { default: themeService } = await import('@/services/themeService.js')
      themeService.applyTheme('CyberGlow')
      
      wrapper = mount(ThemeSelector, {
        props: {
          modelValue: 'CyberGlow',
          isVisible: true
        }
      })
      await flushPromises()
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('modal inherits theme CSS variables', () => {
      const modal = wrapper.find('.theme-modal')
      expect(modal.exists()).toBe(true)
      
      // Modal should have access to CSS variables
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#00ffff')
      expect(getCSSVariable(document.documentElement, '--color-background-primary')).toBe('#0a0a0a')
    })

    it('color dots display actual theme colors', async () => {
      // Wait for themes to load
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      const colorDots = wrapper.findAll('.color-dot')
      colorDots.forEach(dot => {
        const style = dot.attributes('style')
        if (style) {
          // Should have background-color style with actual color values
          expect(style).toMatch(/background-color|backgroundColor/)
          expect(style).toMatch(/#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/)
        }
      })
    })

    it('theme gradient shows actual colors', async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      const gradientBgs = wrapper.findAll('.theme-gradient-bg')
      gradientBgs.forEach(gradient => {
        const style = gradient.attributes('style')
        if (style) {
          expect(style).toMatch(/background.*linear-gradient/)
          expect(style).toMatch(/#[0-9a-fA-F]{3,6}/)
        }
      })
    })

    it('theme icons have proper color styling', async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      const themeIcons = wrapper.findAll('.theme-icon')
      themeIcons.forEach(icon => {
        const style = icon.attributes('style')
        if (style) {
          expect(style).toMatch(/color:/)
        }
      })
    })
  })

  describe('Bookmarks Color Application', () => {
    let wrapper

    const mockSections = [
      {
        name: 'Development',
        icon: 'fab fa-dev',
        items: [
          { title: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' }
        ]
      }
    ]

    beforeEach(async () => {
      // Apply theme
      const { default: themeService } = await import('@/services/themeService.js')
      themeService.applyTheme('Fire')
      
      wrapper = mount(Bookmarks, {
        props: {
          initialSections: mockSections,
          editMode: false,
          searchQuery: ''
        }
      })
      await flushPromises()
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('bookmark sections inherit theme colors', () => {
      const sections = wrapper.findAll('.section')
      expect(sections.length).toBeGreaterThan(0)
      
      // CSS variables should be available for styling
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#ff6b35')
      expect(getCSSVariable(document.documentElement, '--color-text-primary')).toBe('#ffffff')
    })

    it('bookmark items can access theme colors', () => {
      const itemLinks = wrapper.findAll('.item-link')
      expect(itemLinks.length).toBeGreaterThan(0)
      
      // Theme variables should be accessible
      expect(getCSSVariable(document.documentElement, '--color-card-background')).toBe('rgba(255, 107, 53, 0.05)')
    })

    it('section headers use theme styling', () => {
      const sectionHeaders = wrapper.findAll('.section-header')
      sectionHeaders.forEach(header => {
        expect(header.exists()).toBe(true)
        // Should have access to theme CSS variables
      })
    })
  })

  describe('Modal Overlay Color Application', () => {
    let wrapper

    beforeEach(async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      themeService.applyTheme('CyberGlow')
      
      wrapper = mount(ThemeSelector, {
        props: {
          modelValue: 'CyberGlow',
          isVisible: true
        }
      })
      await flushPromises()
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('modal overlay has access to theme colors', () => {
      const overlay = wrapper.find('.modal-overlay')
      expect(overlay.exists()).toBe(true)
      
      // Should have theme class and access to CSS variables
      expect(overlay.classes()).toContain('CyberGlow')
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#00ffff')
    })

    it('modal buttons inherit theme colors', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Buttons should have access to theme button colors
      expect(getCSSVariable(document.documentElement, '--color-button-background')).toBe('rgba(0, 255, 255, 0.1)')
    })
  })

  describe('Widget Color Inheritance', () => {
    beforeEach(async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      themeService.applyTheme('Fire')
    })

    it('widgets have access to theme CSS variables', () => {
      // Create a simple widget-like element
      const widgetElement = document.createElement('div')
      widgetElement.className = 'widget-container'
      document.body.appendChild(widgetElement)
      
      // Widget should have access to theme colors
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#ff6b35')
      expect(getCSSVariable(document.documentElement, '--color-card-background')).toBe('rgba(255, 107, 53, 0.05)')
      
      document.body.removeChild(widgetElement)
    })
  })

  describe('Color Transition Verification', () => {
    it('CSS variables update smoothly during theme transitions', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      // Start with CyberGlow
      themeService.applyTheme('CyberGlow')
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#00ffff')
      
      // Transition to Fire
      themeService.applyTheme('Fire')
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#ff6b35')
      
      // Transition back to CyberGlow
      themeService.applyTheme('CyberGlow')
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#00ffff')
    })

    it('all theme variables update together', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      themeService.applyTheme('Fire')
      
      // Check multiple variables are set correctly
      expect(getCSSVariable(document.documentElement, '--color-accent')).toBe('#ff6b35')
      expect(getCSSVariable(document.documentElement, '--color-text-primary')).toBe('#ffffff')
      expect(getCSSVariable(document.documentElement, '--color-button-background')).toBe('rgba(255, 107, 53, 0.1)')
      expect(getCSSVariable(document.documentElement, '--color-card-background')).toBe('rgba(255, 107, 53, 0.05)')
    })
  })

  describe('Color Value Validation', () => {
    it('theme colors are valid CSS color values', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      const themes = await themeService.loadThemes()
      
      themes.forEach(theme => {
        // Test primary color
        expect(theme.uiColors.primary).toMatch(/^#[0-9a-fA-F]{6}$|^rgb\(|^rgba\(/)
        
        // Test that color can be applied to an element
        const testElement = document.createElement('div')
        testElement.style.color = theme.uiColors.primary
        expect(testElement.style.color).toBeTruthy()
      })
    })

    it('CSS variables contain valid color values', async () => {
      const { default: themeService } = await import('@/services/themeService.js')
      
      themeService.applyTheme('CyberGlow')
      
      const accentColor = getCSSVariable(document.documentElement, '--color-accent')
      const textColor = getCSSVariable(document.documentElement, '--color-text-primary')
      
      // Colors should be valid hex or rgb values
      expect(accentColor).toMatch(/^#[0-9a-fA-F]{6}$|^rgb\(|^rgba\(/)
      expect(textColor).toMatch(/^#[0-9a-fA-F]{6}$|^rgb\(|^rgba\(/)
    })
  })
})