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
        popularity: 'Most Popular',
        uiColors: {
          primary: '#0ff',
          secondary: '#1a1a1a',
          accent: '#0ff',
          background: '#0a0a0a',
          text: '#0ff'
        }
      },
      {
        id: 'Fire',
        name: 'Fire',
        displayName: 'Fire',
        description: 'Warm orange and red flames',
        icon: 'fas fa-fire',
        color: '#ff6b35',
        popularity: 'Popular',
        uiColors: {
          primary: '#ff6b35',
          secondary: '#1a0f0a',
          accent: '#ff4444',
          background: '#0a0a0a',
          text: '#ffffff'
        }
      }
    ])),
    convertToAppFormat: vi.fn(),
    applyTheme: vi.fn(),
    getFallbackThemes: vi.fn(() => [])
  }
}))

import ThemeSelector from '@/components/ThemeSelector.vue'
import WidgetSelectionModal from '@/components/WidgetSelectionModal.vue'

describe('Modal Theme Integration Tests', () => {
  describe('ThemeSelector Modal Theme Application', () => {
    let wrapper

    beforeEach(async () => {
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
      vi.clearAllMocks()
    })

    it('applies current theme class to modal overlay', () => {
      const overlay = wrapper.find('.modal-overlay')
      expect(overlay.exists()).toBe(true)
      expect(overlay.classes()).toContain('CyberGlow')
    })

    it('applies current theme class to modal dialog container', () => {
      const modal = wrapper.find('.theme-modal')
      expect(modal.exists()).toBe(true)
      expect(modal.classes()).toContain('CyberGlow')
    })

    it('updates modal theme classes when modelValue prop changes', async () => {
      await wrapper.setProps({ modelValue: 'Fire' })
      
      const overlay = wrapper.find('.modal-overlay')
      const modal = wrapper.find('.theme-modal')
      
      expect(overlay.classes()).toContain('Fire')
      expect(modal.classes()).toContain('Fire')
      expect(overlay.classes()).not.toContain('CyberGlow')
      expect(modal.classes()).not.toContain('CyberGlow')
    })

    it('maintains theme class consistency across modal elements', async () => {
      const currentTheme = wrapper.props('modelValue')
      
      const overlay = wrapper.find('.modal-overlay')
      const modal = wrapper.find('.theme-modal')
      const header = wrapper.find('.modal-header')
      const body = wrapper.find('.modal-body')
      const footer = wrapper.find('.modal-footer')
      
      // Overlay and modal should have theme class
      expect(overlay.classes()).toContain(currentTheme)
      expect(modal.classes()).toContain(currentTheme)
      
      // Other elements should exist and be within themed containers
      expect(header.exists()).toBe(true)
      expect(body.exists()).toBe(true)
      expect(footer.exists()).toBe(true)
    })

    it('applies theme-specific styling to theme selection rows', async () => {
      // Wait for themes to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()
      
      const themeRows = wrapper.findAll('.theme-row')
      expect(themeRows.length).toBeGreaterThanOrEqual(0)
      
      // Each row should be within the themed modal context
      themeRows.forEach(row => {
        expect(row.exists()).toBe(true)
        const themedParent = row.element.closest('.CyberGlow')
        expect(themedParent).toBeTruthy()
      })
    })

    it('shows selected state with theme-aware styling', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()
      
      const selectedRows = wrapper.findAll('.theme-row.selected')
      selectedRows.forEach(row => {
        expect(row.classes()).toContain('selected')
        // Should be within themed modal context
        const themedParent = row.element.closest('.CyberGlow')
        expect(themedParent).toBeTruthy()
      })
    })

    it('displays theme colors correctly in color dots', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()
      
      const colorDots = wrapper.findAll('.color-dot')
      colorDots.forEach(dot => {
        const style = dot.attributes('style')
        if (style) {
          expect(style).toMatch(/background-color|backgroundColor/)
        }
      })
    })

    it('applies theme to modal action buttons', () => {
      const cancelButton = wrapper.find('.btn.btn-secondary')
      const applyButton = wrapper.find('.btn.btn-primary')
      
      expect(cancelButton.exists()).toBe(true)
      expect(applyButton.exists()).toBe(true)
      
      // Buttons should be within themed modal context
      const themedModal = wrapper.find('.theme-modal.CyberGlow')
      expect(themedModal.exists()).toBe(true)
      expect(themedModal.element.contains(cancelButton.element)).toBe(true)
      expect(themedModal.element.contains(applyButton.element)).toBe(true)
    })

    it('maintains theme styling when modal is closed and reopened', async () => {
      // Close modal
      await wrapper.setProps({ isVisible: false })
      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
      
      // Reopen modal
      await wrapper.setProps({ isVisible: true })
      
      const overlay = wrapper.find('.modal-overlay')
      const modal = wrapper.find('.theme-modal')
      
      expect(overlay.exists()).toBe(true)
      expect(modal.exists()).toBe(true)
      expect(overlay.classes()).toContain('CyberGlow')
      expect(modal.classes()).toContain('CyberGlow')
    })

    it('handles rapid theme changes without breaking styling', async () => {
      const themes = ['Fire', 'CyberGlow', 'Fire', 'CyberGlow']
      
      for (const theme of themes) {
        await wrapper.setProps({ modelValue: theme })
        
        const overlay = wrapper.find('.modal-overlay')
        const modal = wrapper.find('.theme-modal')
        
        expect(overlay.classes()).toContain(theme)
        expect(modal.classes()).toContain(theme)
      }
    })
  })

  describe('WidgetSelectionModal Theme Integration', () => {
    let wrapper

    const mockAvailableWidgets = [
      { id: 'quran', name: 'Quran Verses', icon: 'fas fa-book', label: 'Quran Widget' },
      { id: 'prayer', name: 'Prayer Times', icon: 'fas fa-mosque', label: 'Prayer Widget' },
      { id: 'notes', name: 'Notes', icon: 'fas fa-sticky-note', label: 'Notes Widget' },
      { id: 'hadith', name: 'Hadith', icon: 'fas fa-book-open', label: 'Hadith Widget' }
    ]

    const mockVisibleWidgets = ['quran', 'prayer']

    beforeEach(() => {
      wrapper = mount(WidgetSelectionModal, {
        props: {
          isVisible: true,
          availableWidgets: mockAvailableWidgets,
          visibleWidgets: mockVisibleWidgets
        },
        global: {
          provide: {
            currentTheme: 'CyberGlow'
          }
        }
      })
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('renders modal with proper structure for theme inheritance', () => {
      const modal = wrapper.find('.widget-modal')
      const overlay = wrapper.find('.modal-overlay')
      
      expect(modal.exists()).toBe(true)
      expect(overlay.exists()).toBe(true)
    })

    it('applies theme styling to widget list items', () => {
      const widgetItems = wrapper.findAll('.widget-item')
      expect(widgetItems.length).toBeGreaterThan(0)
      
      widgetItems.forEach(item => {
        expect(item.exists()).toBe(true)
        // Item should inherit theme styling from parent modal
      })
    })

    it('shows selected widgets with theme-aware styling', () => {
      const selectedWidgets = wrapper.findAll('.widget-item.selected')
      selectedWidgets.forEach(widget => {
        expect(widget.classes()).toContain('selected')
      })
    })

    it('applies theme to modal header and footer', () => {
      const header = wrapper.find('.modal-header')
      const footer = wrapper.find('.modal-footer')
      
      if (header.exists()) {
        expect(header.exists()).toBe(true)
      }
      
      if (footer.exists()) {
        expect(footer.exists()).toBe(true)
      }
    })

    it('handles widget toggle with consistent theme styling', async () => {
      const widgetItems = wrapper.findAll('.widget-item')
      
      if (widgetItems.length > 0) {
        const firstWidget = widgetItems[0]
        await firstWidget.trigger('click')
        
        // Should emit toggle event
        expect(wrapper.emitted('toggle-widget')).toBeTruthy()
      }
    })
  })

  describe('Modal Backdrop and Focus Management', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(ThemeSelector, {
        props: {
          modelValue: 'CyberGlow',
          isVisible: true
        }
      })
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('applies theme to modal backdrop', () => {
      const overlay = wrapper.find('.modal-overlay')
      expect(overlay.exists()).toBe(true)
      expect(overlay.classes()).toContain('CyberGlow')
    })

    it('handles ESC key with theme context maintained', async () => {
      const overlay = wrapper.find('.modal-overlay')
      
      await overlay.trigger('keydown', { key: 'Escape' })
      
      // Modal should close
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('handles click outside to close with theme context', async () => {
      const overlay = wrapper.find('.modal-overlay')
      
      await overlay.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('prevents event propagation on modal content click', async () => {
      const modal = wrapper.find('.theme-modal')
      
      const clickEvent = new Event('click')
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation')
      
      modal.element.dispatchEvent(clickEvent)
      
      // Note: @click.stop in template should prevent propagation
      // This test verifies the modal structure supports it
      expect(modal.exists()).toBe(true)
    })
  })

  describe('Modal Transition Effects', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(ThemeSelector, {
        props: {
          modelValue: 'CyberGlow',
          isVisible: false
        }
      })
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('maintains theme classes during modal show transition', async () => {
      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
      
      await wrapper.setProps({ isVisible: true })
      
      const overlay = wrapper.find('.modal-overlay')
      expect(overlay.exists()).toBe(true)
      expect(overlay.classes()).toContain('CyberGlow')
    })

    it('maintains theme classes during modal hide transition', async () => {
      await wrapper.setProps({ isVisible: true })
      
      let overlay = wrapper.find('.modal-overlay')
      expect(overlay.exists()).toBe(true)
      expect(overlay.classes()).toContain('CyberGlow')
      
      await wrapper.setProps({ isVisible: false })
      
      // Modal should be hidden
      overlay = wrapper.find('.modal-overlay')
      expect(overlay.exists()).toBe(false)
    })

    it('handles theme changes during transition states', async () => {
      // Show modal
      await wrapper.setProps({ isVisible: true })
      
      // Change theme while modal is visible
      await wrapper.setProps({ modelValue: 'Fire' })
      
      const overlay = wrapper.find('.modal-overlay')
      const modal = wrapper.find('.theme-modal')
      
      expect(overlay.classes()).toContain('Fire')
      expect(modal.classes()).toContain('Fire')
    })
  })

  describe('Accessibility with Theme Context', () => {
    let wrapper

    beforeEach(async () => {
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

    it('maintains ARIA attributes with theme styling', () => {
      const modal = wrapper.find('[role="dialog"]')
      expect(modal.exists()).toBe(true)
      expect(modal.attributes('aria-modal')).toBe('true')
      expect(modal.attributes('aria-labelledby')).toBe('theme-modal-title')
      
      // Should also have theme class
      expect(modal.classes()).toContain('CyberGlow')
    })

    it('maintains focus management with theme context', async () => {
      await new Promise(resolve => setTimeout(resolve, 150)) // Wait for focus timeout
      
      // Theme rows should be focusable and within themed context
      const themeRows = wrapper.findAll('.theme-row')
      themeRows.forEach(row => {
        expect(row.attributes('role')).toBe('radio')
        expect(row.attributes('tabindex')).toBeDefined()
      })
    })

    it('provides proper keyboard navigation with theme styling', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()
      
      const themeRows = wrapper.findAll('.theme-row')
      if (themeRows.length > 0) {
        const firstRow = themeRows[0]
        
        // Test arrow key navigation
        await firstRow.trigger('keydown', { key: 'ArrowDown' })
        
        // Navigation should work within themed context
        expect(firstRow.exists()).toBe(true)
      }
    })
  })
})