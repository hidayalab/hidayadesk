<template>
  <div v-for="(section, sectionIndex) in filteredSections" :key="section.name" class="section">
    <h2 class="section-title">
      {{ section.name }}
      <button
        v-if="editMode"
        class="edit-icon-button"
        @click="showEditSectionModalWrapper(sectionIndex)"
        :aria-label="`Edit ${section.name} section`"
      >
        <i class="fas fa-edit" aria-hidden="true"></i>
      </button>
    </h2>
    <div class="widget-grid"></div>
    <ul class="item-list" role="list">
      <li v-for="(item, itemIndex) in section.items" :key="item.title" class="list-item" role="listitem">
        <a :href="item.url" target="_blank" class="item-link" :aria-label="`Open ${item.title}`" rel="noopener noreferrer">
          <i v-if="!item.iconType || item.iconType === 'font'" :class="['icon', item.icon]" aria-hidden="true"></i>
          <img v-else :src="item.icon" :alt="`${item.title} icon`" class="icon favicon" aria-hidden="true" />
          <p class="item-title">{{ item.title }}</p>
        </a>
        <button
          v-if="editMode"
          class="edit-icon-button item-edit-button"
          @click="showEditItemModalWrapper(sectionIndex, itemIndex)"
          :aria-label="`Edit ${item.title}`"
        >
          <i class="fas fa-edit" aria-hidden="true"></i>
        </button>
      </li>
      <li v-if="editMode" class="list-item add-item-button" role="listitem">
        <button class="item-link add-button" @click="showAddItemModal(section)" :aria-label="`Add item to ${section.name}`">
          <i class="icon fa fa-plus" aria-hidden="true"></i>
          <p class="item-title">Add</p>
        </button>
      </li>
    </ul>
  </div>
  <div v-if="editMode" class="add-section-button">
    <button class="item-link add-button" @click="showAddSectionModal = true" aria-label="Add new section">
      <i class="icon fa fa-plus" aria-hidden="true"></i>
      <p class="item-title">Add New Section</p>
    </button>
  </div>
  <!-- Add Item Modal -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Add New Item</h3>

      <!-- Error Display -->
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
        <button @click="clearError" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <form @submit.prevent="addItem">
        <div class="form-group">
          <label for="item-title">Title:</label>
          <input type="text" id="item-title" v-model="newItem.title" required :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label for="item-url">URL:</label>
          <input
            type="text"
            id="item-url"
            v-model="newItem.url"
            required
            placeholder="e.g., https://example.com or example.com"
            :disabled="isLoading"
          />
        </div>
        <div class="form-group">
          <label for="item-icon">Icon (Font Awesome class, e.g., fas fa-star):</label>
          <input type="text" id="item-icon" v-model="newItem.icon" :disabled="isLoading" />
          <small>Leave empty to auto-detect icon from URL</small>
        </div>
        <div class="modal-actions">
          <button type="submit" class="save-button" :disabled="isLoading">
            <span v-if="isLoading">Adding...</span>
            <span v-else>Add Item</span>
          </button>
          <button type="button" @click="closeModal" class="cancel-button" :disabled="isLoading">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Add Section Modal -->
  <div v-if="showAddSectionModal" class="modal-overlay" @click.self="showAddSectionModal = false">
    <div class="modal-content">
      <h3>Add New Section</h3>

      <!-- Error Display -->
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
        <button @click="clearError" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <form @submit.prevent="addSection">
        <div class="form-group">
          <label for="section-name">Section Name:</label>
          <input type="text" id="section-name" v-model="newSectionName" required />
        </div>
        <div class="modal-actions">
          <button type="submit" class="save-button">Add Section</button>
          <button type="button" @click="showAddSectionModal = false" class="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Edit Section Modal -->
  <div v-if="showEditSection" class="modal-overlay" @click.self="closeEditModal">
    <div class="modal-content">
      <h3>Edit Section</h3>

      <!-- Error Display -->
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
        <button @click="clearError" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <form @submit.prevent="updateSection">
        <div class="form-group">
          <label for="edit-section-name">Section Name:</label>
          <input type="text" id="edit-section-name" v-model="editableSection.name" required />
        </div>
        <div class="modal-actions">
          <button type="button" @click="deleteSection" class="delete-button">Delete</button>
          <div>
            <button type="submit" class="save-button">Save Changes</button>
            <button type="button" @click="closeEditModal" class="cancel-button">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <!-- Edit Item Modal -->
  <div v-if="showEditItem" class="modal-overlay" @click.self="closeEditModal">
    <div class="modal-content">
      <h3>Edit Item</h3>

      <!-- Error Display -->
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
        <button @click="clearError" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <form @submit.prevent="updateItem">
        <div class="form-group">
          <label for="edit-item-title">Title:</label>
          <input type="text" id="edit-item-title" v-model="editableItem.title" required :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label for="edit-item-url">URL:</label>
          <input
            type="text"
            id="edit-item-url"
            v-model="editableItem.url"
            required
            placeholder="e.g., https://example.com or example.com"
            :disabled="isLoading"
          />
        </div>
        <div class="form-group">
          <label for="edit-item-icon">Icon:</label>
          <input type="text" id="edit-item-icon" v-model="editableItem.icon" :disabled="isLoading" />
          <small>Leave empty to auto-detect icon from URL</small>
        </div>
        <div class="modal-actions">
          <button type="button" @click="deleteItem" class="delete-button" :disabled="isLoading">Delete</button>
          <div>
            <button type="submit" class="save-button" :disabled="isLoading">
              <span v-if="isLoading">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
            <button type="button" @click="closeEditModal" class="cancel-button" :disabled="isLoading">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBookmarkModal } from '../composables/useBookmarkModal'
import { useIconService } from '../composables/useIconService'
import './styles/bookmark.css'
import './styles/bookmark-enhancements.css'

// Props
const props = defineProps({
  sections: {
    type: Array,
    default: () => []
  },
  searchQuery: {
    type: String,
    default: ''
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'add-item',
  'add-section', 
  'update-section',
  'update-item',
  'delete-section',
  'delete-item'
])

// Composables
const { getIconForDomain, fetchWebsiteIcon, normalizeUrl } = useIconService()

const {
  showModal,
  showAddSectionModal,
  showEditSection,
  showEditItem,
  newItem,
  newSectionName,
  activeSection,
  editableSection,
  editableItem,
  editableSectionIndex,
  editableItemIndex,
  isLoading,
  error,
  showAddItemModal,
  closeModal,
  showEditSectionModal: showEditSectionModalBase,
  showEditItemModal: showEditItemModalBase,
  closeEditModal,
  clearError
} = useBookmarkModal()

// Wrapper functions to pass sections
const showEditSectionModalWrapper = (sectionIndex) => {
  showEditSectionModalBase(sectionIndex, props.sections)
}

const showEditItemModalWrapper = (sectionIndex, itemIndex) => {
  showEditItemModalBase(sectionIndex, itemIndex, props.sections)
}

// Computed
const filteredSections = computed(() => {
  if (!props.searchQuery) {
    return props.sections
  }
  const query = props.searchQuery.toLowerCase()
  return props.sections
    .map(section => {
      const filteredItems = section.items.filter(item => 
        item.title.toLowerCase().includes(query)
      )
      return { ...section, items: filteredItems }
    })
    .filter(section => section.items.length > 0)
})

// Validation functions
const validateItem = (item) => {
  if (!item.title?.trim()) return 'Title is required'
  if (!item.url?.trim()) return 'URL is required'
  return null
}

const validateSection = (name) => {
  if (!name.trim()) return 'Section name is required'
  return null
}

// Methods
const addItem = async () => {
  try {
    clearError()
    
    const validation = validateItem(newItem.value)
    if (validation) {
      error.value = validation
      return
    }

    isLoading.value = true
    newItem.value.url = normalizeUrl(newItem.value.url)

    if (!newItem.value.icon) {
      const mappedIcon = getIconForDomain(newItem.value.url)
      if (mappedIcon !== 'fas fa-link') {
        newItem.value.icon = mappedIcon
        newItem.value.iconType = 'font'
      } else {
        const faviconUrl = await fetchWebsiteIcon(newItem.value.url)
        if (faviconUrl.startsWith('https')) {
          newItem.value.iconType = 'image'
          newItem.value.icon = faviconUrl
        } else {
          newItem.value.icon = faviconUrl
          newItem.value.iconType = 'font'
        }
      }
    } else {
      newItem.value.iconType = 'font'
    }

    if (activeSection.value) {
      emit('add-item', {
        sectionName: activeSection.value.name,
        item: {
          ...newItem.value,
          icon: newItem.value.icon || 'fas fa-link',
          iconType: newItem.value.iconType || 'font',
        },
      })
    }

    newItem.value = { title: '', url: '', icon: '', iconType: 'font' }
    closeModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add item'
  } finally {
    isLoading.value = false
  }
}

const addSection = () => {
  try {
    clearError()
    
    const validation = validateSection(newSectionName.value)
    if (validation) {
      error.value = validation
      return
    }
    
    emit('add-section', newSectionName.value)
    newSectionName.value = ''
    showAddSectionModal.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add section'
  }
}

const updateSection = () => {
  try {
    clearError()
    
    if (!editableSection.value) return
    
    const validation = validateSection(editableSection.value.name)
    if (validation) {
      error.value = validation
      return
    }
    
    emit('update-section', {
      index: editableSectionIndex.value,
      section: editableSection.value,
    })
    closeEditModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update section'
  }
}

const updateItem = async () => {
  try {
    clearError()
    
    if (!editableItem.value) return
    
    const validation = validateItem(editableItem.value)
    if (validation) {
      error.value = validation
      return
    }

    isLoading.value = true
    editableItem.value.url = normalizeUrl(editableItem.value.url)
    
    if (!editableItem.value.icon || editableItem.value.icon === 'fas fa-link') {
      const mappedIcon = getIconForDomain(editableItem.value.url)
      if (mappedIcon !== 'fas fa-link') {
        editableItem.value.icon = mappedIcon
        editableItem.value.iconType = 'font'
      } else {
        try {
          const faviconUrl = await fetchWebsiteIcon(editableItem.value.url)
            editableItem.value.icon = faviconUrl
          if (faviconUrl.startsWith('https')) {
            editableItem.value.iconType = 'image'
          } else {
            editableItem.value.iconType = 'font'
          }
        } catch {
          editableItem.value.icon = 'fas fa-link'
          editableItem.value.iconType = 'font'
        }
      }
    }

    if (!editableItem.value.iconType) {
      editableItem.value.iconType = editableItem.value.icon?.startsWith('http') ? 'image' : 'font'
    }

    emit('update-item', {
      sectionIndex: editableSectionIndex.value,
      itemIndex: editableItemIndex.value,
      item: editableItem.value,
    })
    closeEditModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update item'
  } finally {
    isLoading.value = false
  }
}

const deleteSection = () => {
  if (confirm('Are you sure you want to delete this section?')) {
    emit('delete-section', editableSectionIndex.value)
    closeEditModal()
  }
}

const deleteItem = () => {
  if (confirm('Are you sure you want to delete this item?')) {
    emit('delete-item', {
      sectionIndex: editableSectionIndex.value,
      itemIndex: editableItemIndex.value,
    })
    closeEditModal()
  }
}
</script>
