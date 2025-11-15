<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="isOpen"
        class="settings-drawer-overlay"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div
          ref="drawerContent"
          class="settings-drawer-content"
          :style="{ paddingTop: safeAreaTop, paddingBottom: safeAreaBottom }"
          @click.stop
        >
          <!-- Drawer Header -->
          <div class="settings-drawer-header">
            <h2 id="settings-title" class="settings-drawer-title">Settings</h2>
            <button
              class="settings-drawer-close"
              @click="closeDrawer"
              aria-label="Close settings"
            >
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>

          <!-- Drawer Content -->
          <div class="settings-drawer-body">
            <!-- Theme Selection -->
            <div class="settings-section">
              <h3 class="settings-section-title">Appearance</h3>
              <button
                class="settings-option-button"
                @click="$emit('open-theme-modal')"
              >
                <div class="option-info">
                  <div class="option-title">Theme</div>
                  <div class="option-description">{{ currentThemeName }}</div>
                </div>
                <i class="fas fa-chevron-right option-arrow" aria-hidden="true"></i>
              </button>
            </div>

            <!-- Layout Selection -->
            <div class="settings-section">
              <h3 class="settings-section-title">Layout</h3>
              <div class="layout-grid">
                <button
                  v-for="layout in layouts"
                  :key="layout.value"
                  class="layout-option"
                  :class="{ active: selectedLayout === layout.value }"
                  @click="$emit('select-layout', layout.value)"
                  :aria-label="layout.name"
                  :aria-pressed="selectedLayout === layout.value"
                >
                  <i :class="layout.icon" class="layout-icon" aria-hidden="true"></i>
                  <span class="layout-name">{{ layout.name }}</span>
                </button>
              </div>
            </div>

            <!-- Card Size Selection -->
            <div class="settings-section">
              <h3 class="settings-section-title">Card Size</h3>
              <div class="layout-grid">
                <button
                  v-for="size in cardSizes"
                  :key="size.value"
                  class="layout-option"
                  :class="{ active: selectedCardSize === size.value }"
                  @click="$emit('select-card-size', size.value)"
                  :aria-label="size.name"
                  :aria-pressed="selectedCardSize === size.value"
                >
                  <i :class="size.icon" class="layout-icon" aria-hidden="true"></i>
                  <span class="layout-name">{{ size.name }}</span>
                </button>
              </div>
            </div>

            <!-- Widget Visibility -->
            <div class="settings-section">
              <h3 class="settings-section-title">Widgets</h3>
              <button
                class="settings-option-button"
                @click="$emit('open-widget-modal')"
              >
                <div class="option-info">
                  <div class="option-title">Manage Widgets</div>
                  <div class="option-description">{{ visibleWidgetCount }} visible</div>
                </div>
                <i class="fas fa-chevron-right option-arrow" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTouchGestures } from '../../composables/useTouchGestures'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentThemeName: {
    type: String,
    default: 'CyberGlow'
  },
  visibleWidgets: {
    type: Array,
    default: () => []
  },
  selectedLayout: {
    type: String,
    default: 'layout-three-column'
  },
  selectedCardSize: {
    type: String,
    default: 'card-size-medium'
  },
  layouts: {
    type: Array,
    default: () => [
      { name: 'Single Column', value: 'layout-compact', icon: 'fas fa-list' },
      { name: 'Two Column', value: 'layout-two-column', icon: 'fas fa-columns' },
      { name: 'Three Column', value: 'layout-three-column', icon: 'fas fa-th' }
    ]
  },
  cardSizes: {
    type: Array,
    default: () => [
      { name: 'Small', value: 'card-size-small', icon: 'fas fa-compress-alt' },
      { name: 'Medium', value: 'card-size-medium', icon: 'fas fa-expand-alt' },
      { name: 'List', value: 'card-size-list', icon: 'fas fa-bars' }
    ]
  }
})

const emit = defineEmits([
  'close',
  'open-theme-modal',
  'open-widget-modal',
  'select-layout',
  'select-card-size'
])

const drawerContent = ref(null)

// Safe area support
const safeAreaTop = computed(() => 'var(--safe-area-top, 0px)')
const safeAreaBottom = computed(() => 'var(--safe-area-bottom, 0px)')

// Count visible widgets
const visibleWidgetCount = computed(() => props.visibleWidgets.length)

// Close drawer
const closeDrawer = () => {
  emit('close')
}

// Handle backdrop click
const handleBackdropClick = () => {
  closeDrawer()
}

// Setup swipe-to-close gesture
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && drawerContent.value) {
    useTouchGestures(drawerContent, {
      onSwipeRight: () => {
        closeDrawer()
      },
      threshold: 50
    })
  }
})

// Focus trap implementation
const focusableElements = ref([])
const firstFocusableElement = ref(null)
const lastFocusableElement = ref(null)

const setupFocusTrap = () => {
  if (!drawerContent.value) return

  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  focusableElements.value = drawerContent.value.querySelectorAll(focusableSelector)

  if (focusableElements.value.length > 0) {
    firstFocusableElement.value = focusableElements.value[0]
    lastFocusableElement.value = focusableElements.value[focusableElements.value.length - 1]

    setTimeout(() => {
      firstFocusableElement.value?.focus()
    }, 100)
  }
}

const handleTabKey = (e) => {
  if (!props.isOpen) return

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
  if (e.key === 'Escape' && props.isOpen) {
    closeDrawer()
  }
}

// Watch for drawer open/close
watch(() => props.isOpen, (isOpen) => {
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
.settings-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.settings-drawer-content {
  width: 85vw;
  max-width: 380px;
  background: var(--color-background-primary);
  border-left: 1px solid var(--color-border-primary);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  will-change: transform;
}

/* Drawer Header */
.settings-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-background-secondary);
  flex-shrink: 0;
  gap: var(--spacing-md);
}

.settings-drawer-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.2;
}

.settings-drawer-close {
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

.settings-drawer-close:hover,
.settings-drawer-close:active {
  background: var(--color-button-background-hover);
  border-color: var(--color-button-border-hover);
  color: var(--color-text-primary);
}

/* Drawer Body */
.settings-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  -webkit-overflow-scrolling: touch;
}

.settings-drawer-body::-webkit-scrollbar {
  width: 6px;
}

.settings-drawer-body::-webkit-scrollbar-track {
  background: transparent;
}

.settings-drawer-body::-webkit-scrollbar-thumb {
  background: var(--color-border-primary);
  border-radius: 3px;
}

/* Settings Sections */
.settings-section {
  margin-bottom: var(--spacing-xl);
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section-title {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* Settings Option Button */
.settings-option-button {
  width: 100%;
  background: var(--color-button-background);
  border: 1px solid var(--color-button-border);
  border-radius: 12px;
  padding: var(--spacing-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  text-align: left;
  color: inherit;
  font-family: inherit;
  min-height: var(--touch-target-comfortable);
}

.settings-option-button:hover,
.settings-option-button:active {
  background: var(--color-button-background-hover);
  border-color: var(--color-button-border-hover);
  transform: translateX(-4px);
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 0;
}

.option-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

.option-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-arrow {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.settings-option-button:hover .option-arrow {
  color: var(--color-text-secondary);
  transform: translateX(2px);
}

/* Layout Grid */
.layout-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

.layout-option {
  background: var(--color-button-background);
  border: 2px solid var(--color-button-border);
  border-radius: 10px;
  padding: var(--spacing-md) var(--spacing-sm);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  transition: all 0.2s ease;
  min-height: 80px;
  color: var(--color-text-secondary);
  font-family: inherit;
}

.layout-option:hover,
.layout-option:active {
  background: var(--color-button-background-hover);
  border-color: var(--color-button-border-hover);
  transform: translateY(-2px);
}

.layout-option.active {
  background: var(--color-button-background-active);
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.layout-icon {
  font-size: 1.5rem;
  transition: all 0.2s ease;
}

.layout-option.active .layout-icon {
  transform: scale(1.1);
}

.layout-name {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-enter-active .settings-drawer-content,
.drawer-leave-active .settings-drawer-content {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .settings-drawer-content {
  transform: translateX(100%);
}

.drawer-leave-to .settings-drawer-content {
  transform: translateX(100%);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .drawer-enter-active,
  .drawer-leave-active,
  .drawer-enter-active .settings-drawer-content,
  .drawer-leave-active .settings-drawer-content,
  .settings-option-button,
  .layout-option {
    transition: none;
  }

  .layout-option.active .layout-icon {
    transform: none;
  }
}

/* Very small screens */
@media (max-width: 374px) {
  .settings-drawer-content {
    width: 90vw;
  }

  .layout-grid {
    grid-template-columns: 1fr;
  }

  .layout-option {
    flex-direction: row;
    justify-content: flex-start;
    min-height: var(--touch-target-comfortable);
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-md);
  }

  .layout-icon {
    font-size: 1.25rem;
  }

  .layout-name {
    font-size: var(--font-size-sm);
    text-align: left;
  }
}
</style>
