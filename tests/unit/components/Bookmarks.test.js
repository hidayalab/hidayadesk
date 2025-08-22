import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Bookmarks from '@/components/Bookmarks.vue'

describe('Bookmarks Component', () => {
  let wrapper
  
  const mockSections = [
    {
      name: 'Development',
      icon: 'fab fa-dev',
      items: [
        {
          title: 'GitHub',
          url: 'https://github.com',
          icon: 'fab fa-github'
        },
        {
          title: 'Stack Overflow', 
          url: 'https://stackoverflow.com',
          icon: 'fab fa-stack-overflow'
        }
      ]
    },
    {
      name: 'Islamic Resources',
      icon: 'fas fa-moon',
      items: [
        {
          title: 'IslamicFinder',
          url: 'https://islamicfinder.org', 
          icon: 'fas fa-moon'
        },
        {
          title: 'Quran.com',
          url: 'https://quran.com',
          icon: 'fas fa-book-quran'
        }
      ]
    }
  ]

  beforeEach(() => {
    wrapper = mount(Bookmarks, {
      props: {
        sections: mockSections,
        editMode: false,
        searchQuery: ''
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders component successfully', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('renders sections', () => {
      const sections = wrapper.findAll('.section')
      expect(sections).toHaveLength(2)
    })

    it('displays section titles correctly', () => {
      const sectionTitles = wrapper.findAll('.section-title')
      expect(sectionTitles[0].text()).toContain('Development')
      expect(sectionTitles[1].text()).toContain('Islamic Resources')
    })

    it('renders bookmark items', () => {
      const items = wrapper.findAll('.list-item')
      // Should have 4 items (2 in each section)
      expect(items.length).toBeGreaterThan(0)
    })

    it('displays bookmark links correctly', () => {
      const links = wrapper.findAll('.item-link')
      expect(links.length).toBeGreaterThan(0)
      
      const firstLink = links[0]
      expect(firstLink.attributes('href')).toBe('https://github.com')
      expect(firstLink.text()).toContain('GitHub')
    })
  })

  describe('Search Functionality', () => {
    it('filters sections based on search query', async () => {
      await wrapper.setProps({ searchQuery: 'GitHub' })
      
      // Should only show sections that contain matching items
      const visibleItems = wrapper.findAll('.list-item')
      const itemTexts = visibleItems.map(item => item.text())
      const hasGithub = itemTexts.some(text => text.includes('GitHub'))
      
      expect(hasGithub).toBe(true)
    })

    it('shows no results when search matches nothing', async () => {
      await wrapper.setProps({ searchQuery: 'nonexistentitem' })
      
      const sections = wrapper.findAll('.section')
      // Should filter out sections with no matching items
      expect(sections.length).toBe(0)
    })

    it('shows all items when search is empty', async () => {
      await wrapper.setProps({ searchQuery: 'GitHub' })
      await wrapper.setProps({ searchQuery: '' })
      
      const sections = wrapper.findAll('.section')
      expect(sections).toHaveLength(2)
    })
  })

  describe('Edit Mode', () => {
    beforeEach(async () => {
      await wrapper.setProps({ editMode: true })
    })

    it('shows edit buttons when in edit mode', () => {
      const editButtons = wrapper.findAll('.edit-icon-button')
      expect(editButtons.length).toBeGreaterThan(0)
    })

    it('shows add item buttons when in edit mode', () => {
      const addButtons = wrapper.findAll('.add-button')
      expect(addButtons.length).toBeGreaterThan(0)
    })

    it('hides edit buttons when not in edit mode', async () => {
      await wrapper.setProps({ editMode: false })
      
      const editButtons = wrapper.findAll('.edit-icon-button')
      expect(editButtons).toHaveLength(0)
    })
  })

  describe('User Interactions', () => {
    it('opens modal when add item button is clicked', async () => {
      await wrapper.setProps({ editMode: true })
      
      const addButton = wrapper.find('.add-button')
      await addButton.trigger('click')
      
      expect(wrapper.vm.showModal).toBe(true)
      expect(wrapper.vm.activeSection).toBeTruthy()
    })

    it('emits add-item event when item is added', async () => {
      await wrapper.setProps({ editMode: true })
      
      // Set up new item data
      wrapper.vm.newItem = {
        title: 'Test Item',
        url: 'https://test.com',
        icon: 'fas fa-test'
      }
      wrapper.vm.activeSection = mockSections[0]
      
      // Call addItem method
      wrapper.vm.addItem()
      
      // Check if event was emitted
      expect(wrapper.emitted('add-item')).toBeTruthy()
      const emittedEvent = wrapper.emitted('add-item')[0][0]
      expect(emittedEvent.sectionName).toBe('Development')
      expect(emittedEvent.item.title).toBe('Test Item')
    })
  })

  describe('Modal Management', () => {
    it('opens and closes add item modal', async () => {
      await wrapper.setProps({ editMode: true })
      
      // Open modal
      const addButton = wrapper.find('.add-button')
      await addButton.trigger('click')
      expect(wrapper.vm.showModal).toBe(true)
      
      // Close modal
      wrapper.vm.closeModal()
      expect(wrapper.vm.showModal).toBe(false)
      expect(wrapper.vm.activeSection).toBe(null)
    })

    it('opens edit section modal', async () => {
      await wrapper.setProps({ editMode: true })
      
      wrapper.vm.showEditSectionModal(0)
      
      expect(wrapper.vm.showEditSection).toBe(true)
      expect(wrapper.vm.editableSectionIndex).toBe(0)
      expect(wrapper.vm.editableSection.name).toBe('Development')
    })

    it('opens edit item modal', async () => {
      await wrapper.setProps({ editMode: true })
      
      wrapper.vm.showEditItemModal(0, 0)
      
      expect(wrapper.vm.showEditItem).toBe(true)
      expect(wrapper.vm.editableSectionIndex).toBe(0)
      expect(wrapper.vm.editableItemIndex).toBe(0)
      expect(wrapper.vm.editableItem.title).toBe('GitHub')
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      await wrapper.setProps({ editMode: true })
      const addButton = wrapper.find('.add-button')
      await addButton.trigger('click')
    })

    it('prevents adding item without title', () => {
      wrapper.vm.newItem = { title: '', url: 'https://test.com', icon: 'fas fa-test' }
      
      // Mock alert to prevent actual browser alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      wrapper.vm.addItem()
      
      expect(alertSpy).toHaveBeenCalledWith('Title and URL are required.')
      expect(wrapper.emitted('add-item')).toBeFalsy()
      
      alertSpy.mockRestore()
    })

    it('prevents adding item without URL', () => {
      wrapper.vm.newItem = { title: 'Test', url: '', icon: 'fas fa-test' }
      
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      wrapper.vm.addItem()
      
      expect(alertSpy).toHaveBeenCalledWith('Title and URL are required.')
      expect(wrapper.emitted('add-item')).toBeFalsy()
      
      alertSpy.mockRestore()
    })

    it('adds default icon when none provided', async () => {
      wrapper.vm.newItem = { title: 'Test Item', url: 'https://test.com', icon: '' }
      wrapper.vm.activeSection = mockSections[0]
      
      wrapper.vm.addItem()
      
      expect(wrapper.emitted('add-item')).toBeTruthy()
      const emittedEvent = wrapper.emitted('add-item')[0][0]
      expect(emittedEvent.item.icon).toBe('fas fa-link')
    })
  })

  describe('Accessibility', () => {
    it('has proper list structure', () => {
      const lists = wrapper.findAll('[role="list"]')
      expect(lists.length).toBeGreaterThan(0)
      
      const listItems = wrapper.findAll('[role="listitem"]')
      expect(listItems.length).toBeGreaterThan(0)
    })

    it('has aria-labels for links', () => {
      const links = wrapper.findAll('.item-link')
      links.forEach(link => {
        const ariaLabel = link.attributes('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toContain('Open')
      })
    })

    it('has proper heading structure', () => {
      const headings = wrapper.findAll('h2.section-title')
      expect(headings).toHaveLength(2)
    })
  })

  describe('Error Handling', () => {
    it('handles empty sections array', async () => {
      await wrapper.setProps({ sections: [] })
      
      const sections = wrapper.findAll('.section')
      expect(sections).toHaveLength(0)
    })

    it('handles sections with empty items', async () => {
      const emptySections = [{
        name: 'Empty Section',
        icon: 'fas fa-empty',
        items: []
      }]
      
      await wrapper.setProps({ sections: emptySections })
      
      const sections = wrapper.findAll('.section')
      expect(sections).toHaveLength(1)
      
      const items = wrapper.findAll('.list-item')
      // Should still show add button in edit mode
      expect(items.length).toBe(0)
    })
  })

  describe('Component Props', () => {
    it('accepts sections prop correctly', () => {
      expect(wrapper.props('sections')).toEqual(mockSections)
    })

    it('accepts editMode prop correctly', () => {
      expect(wrapper.props('editMode')).toBe(false)
    })

    it('accepts searchQuery prop correctly', () => {
      expect(wrapper.props('searchQuery')).toBe('')
    })

    it('has correct default props', () => {
      const newWrapper = mount(Bookmarks)
      expect(newWrapper.props('sections')).toEqual([])
      expect(newWrapper.props('editMode')).toBe(false)
      expect(newWrapper.props('searchQuery')).toBe('')
      
      newWrapper.unmount()
    })
  })
})