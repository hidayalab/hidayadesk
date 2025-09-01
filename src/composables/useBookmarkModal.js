import { ref } from 'vue'

export function useBookmarkModal() {
  const showModal = ref(false)
  const showAddSectionModal = ref(false)
  const showEditSection = ref(false)
  const showEditItem = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  
  const newItem = ref({
    title: '',
    url: '',
    icon: '',
    iconType: 'font',
  })
  
  const newSectionName = ref('')
  const activeSection = ref(null)
  const editableSection = ref(null)
  const editableItem = ref(null)
  const editableSectionIndex = ref(null)
  const editableItemIndex = ref(null)

  const showAddItemModal = (section) => {
    activeSection.value = section
    showModal.value = true
    clearError()
  }

  const closeModal = () => {
    showModal.value = false
    activeSection.value = null
    newItem.value = { title: '', url: '', icon: '', iconType: 'font' }
    clearError()
  }

  const showEditSectionModal = (sectionIndex, sections) => {
    editableSectionIndex.value = sectionIndex
    editableSection.value = { ...sections[sectionIndex] }
    showEditSection.value = true
    clearError()
  }

  const showEditItemModal = (sectionIndex, itemIndex, sections) => {
    editableSectionIndex.value = sectionIndex
    editableItemIndex.value = itemIndex
    editableItem.value = { ...sections[sectionIndex].items[itemIndex] }
    showEditItem.value = true
    clearError()
  }

  const closeEditModal = () => {
    showEditSection.value = false
    showEditItem.value = false
    editableSection.value = null
    editableItem.value = null
    editableSectionIndex.value = null
    editableItemIndex.value = null
    clearError()
  }

  const clearError = () => {
    error.value = null
  }

  return {
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
    showEditSectionModal,
    showEditItemModal,
    closeEditModal,
    clearError
  }
}