<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="mobile-modal-overlay"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div
          ref="modalContent"
          class="mobile-modal-content"
          @click.stop
          :style="contentStyles"
        >
          <!-- Modal Header -->
          <div class="mobile-modal-header">
            <h2 :id="titleId" class="mobile-modal-title">{{ title }}</h2>
            <button
              class="mobile-modal-close"
              @click="closeModal"
              aria-label="Close modal"
            >
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="mobile-modal-body">
            <slot></slot>
          </div>

          <!-- Modal Footer (optional) -->
          <div v-if="$slots.footer" class="mobile-modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  maxHeight: {
    type: String,
    default: '90vh'
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'confirm'])

const modalContent = ref(null)
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)

// Safe area support
const contentStyles = computed(() => ({
  paddingTop: 'calc(var(--safe-area-top, 0px) + var(--spacing-md))',
  paddingBottom: 'calc(var(--safe-area-bottom, 0px) + var(--spacing-md))',
  maxHeight: props.maxHeight
}))

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

// Handle backdrop click
const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    closeModal()
  }
}

// Focus trap implementation
const focusableElements = ref([])
const firstFocusableElement = ref(null)
const lastFocusableElement = ref(null)

const setupFocusTrap = () => {
  if (!modalContent.value) return

  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  focusableElements.value = modalContent.value.querySelectorAll(focusableSelector)

  if (focusableElements.value.length > 0) {
    firstFocusableElement.value = focusableElements.value[0]
    lastFocusableElement.value = focusableElements.value[focusableElements.value.length - 1]

    // Focus first element after modal opens
    setTimeout(() => {
      firstFocusableElement.value?.focus()
    }, 100)
  }
}

const handleTabKey = (e) => {
  if (!props.modelValue) return

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement.value) {
        e.preventDefault()
        lastFocusableElement.value?.focus()
      }
    } else {
      if (document.activeElement === lastFocusableElement.value) {
        e.preventDefault()
        firstFocusableElement.value?.focus()
      }
    }
  }
}

const handleEscapeKey = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    closeModal()
  }
}

// Watch for modal open/close
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    setupFocusTrap()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Setup keyboard listeners
onMounted(() => {
  document.addEventListener('keydown', handleTabKey)
  document.addEventListener('keydown', handleEscapeKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleTabKey)
  document.removeEventListener('keydown', handleEscapeKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.mobile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

.mobile-modal-content {
  width: 100%;
  max-width: 100vw;
  background: var(--color-background-primary);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  will-change: transform;
}

/* Modal Header */
.mobile-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-background-secondary);
  flex-shrink: 0;
  gap: var(--spacing-md);
}

.mobile-modal-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-modal-close {
  background: var(--color-button-background);
  border: 1px solid var(--color-button-border);
  border-radius: 8px;
  color: var(--color-text-muted);
  cursor: pointer;
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
  font-size: 1.2rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mobile-modal-close:hover,
.mobile-modal-close:active {
  background: var(--color-button-background-hover);
  border-color: var(--color-button-border-hover);
  color: var(--color-text-primary);
}

/* Modal Body */
.mobile-modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md);
  -webkit-overflow-scrolling: touch;
}

.mobile-modal-body::-webkit-scrollbar {
  width: 6px;
}

.mobile-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.mobile-modal-body::-webkit-scrollbar-thumb {
  background: var(--color-border-primary);
  border-radius: 3px;
}

/* Modal Footer */
.mobile-modal-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-background-secondary);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  flex-shrink: 0;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .mobile-modal-content,
.modal-leave-active .mobile-modal-content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .mobile-modal-content {
  transform: translateY(100%);
}

.modal-leave-to .mobile-modal-content {
  transform: translateY(100%);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .mobile-modal-content,
  .modal-leave-active .mobile-modal-content {
    transition: none;
  }
}

/* Tablet and larger - center the modal instead of slide from bottom */
@media (min-width: 768px) {
  .mobile-modal-overlay {
    align-items: center;
    padding: var(--spacing-lg);
  }

  .mobile-modal-content {
    max-width: 600px;
    border-radius: 16px;
    max-height: 90vh;
  }

  .modal-enter-from .mobile-modal-content,
  .modal-leave-to .mobile-modal-content {
    transform: scale(0.9) translateY(20px);
  }
}
</style>
