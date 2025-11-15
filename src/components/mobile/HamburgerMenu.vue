<template>
  <Teleport to="body">
    <Transition name="menu">
      <div
        v-if="isOpen"
        class="hamburger-menu-overlay"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        <div
          ref="menuDrawer"
          class="hamburger-menu-drawer"
          :style="{ paddingTop: safeAreaTop, paddingBottom: safeAreaBottom }"
          @click.stop
        >
          <!-- Menu Header -->
          <div class="menu-header">
            <div class="menu-logo-area">
              <img
                v-if="logo"
                :src="logo"
                alt=""
                class="menu-logo"
              >
              <div class="menu-app-info">
                <h2 id="menu-title" class="menu-app-title">{{ appTitle }}</h2>
                <p class="menu-app-subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <button
              class="menu-close-btn"
              @click="closeMenu"
              aria-label="Close menu"
            >
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>

          <!-- Menu Content -->
          <nav class="menu-content" aria-label="Main navigation">
            <!-- Search -->
            <div class="menu-section">
              <div class="menu-search">
                <i class="fas fa-search menu-search-icon"></i>
                <input
                  type="text"
                  :value="searchQuery"
                  @input="$emit('update:search-query', $event.target.value)"
                  placeholder="Search bookmarks..."
                  aria-label="Search bookmarks"
                  class="menu-search-input"
                >
              </div>
            </div>

            <!-- Edit Mode Toggle -->
            <div class="menu-section">
              <button
                class="menu-item"
                @click="$emit('toggle-edit')"
                :class="{ active: isEditMode }"
              >
                <i class="fas fa-pencil-alt menu-item-icon" aria-hidden="true"></i>
                <span class="menu-item-text">{{ isEditMode ? 'Exit Edit Mode' : 'Edit Bookmarks' }}</span>
                <i
                  v-if="isEditMode"
                  class="fas fa-check menu-item-badge"
                  aria-hidden="true"
                ></i>
              </button>
            </div>

            <!-- Settings Button -->
            <div class="menu-section">
              <button
                class="menu-item"
                @click="handleSettingsClick"
              >
                <i class="fas fa-cog menu-item-icon" aria-hidden="true"></i>
                <span class="menu-item-text">Settings</span>
                <i class="fas fa-chevron-right menu-item-arrow" aria-hidden="true"></i>
              </button>
            </div>

            <!-- App Info -->
            <div class="menu-section menu-footer">
              <div class="menu-info">
                <p class="menu-info-text">FaithNotes Dashboard</p>
                <p class="menu-info-subtext">Version 1.0.0</p>
              </div>
            </div>
          </nav>
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
  appTitle: {
    type: String,
    default: 'FaithNotes'
  },
  subtitle: {
    type: String,
    default: 'Your Islamic Dashboard'
  },
  logo: {
    type: String,
    default: '/logo.png'
  },
  searchQuery: {
    type: String,
    default: ''
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'toggle-edit', 'open-settings', 'update:search-query'])

const menuDrawer = ref(null)

// Safe area support
const safeAreaTop = computed(() => 'var(--safe-area-top, 0px)')
const safeAreaBottom = computed(() => 'var(--safe-area-bottom, 0px)')

// Close menu function
const closeMenu = () => {
  emit('close')
}

// Handle backdrop click
const handleBackdropClick = () => {
  closeMenu()
}

// Handle settings click
const handleSettingsClick = () => {
  emit('open-settings')
  closeMenu()
}

// Focus trap: Keep focus within menu when open
const focusableElements = ref([])
const firstFocusableElement = ref(null)
const lastFocusableElement = ref(null)

const setupFocusTrap = () => {
  if (!menuDrawer.value) return

  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  focusableElements.value = menuDrawer.value.querySelectorAll(focusableSelector)

  if (focusableElements.value.length > 0) {
    firstFocusableElement.value = focusableElements.value[0]
    lastFocusableElement.value = focusableElements.value[focusableElements.value.length - 1]

    // Focus first element
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
    closeMenu()
  }
}

// Track gesture cleanup function
let gestureCleanup = null

// Consolidated watch for menu open state changes - prevents memory leaks
watch(() => props.isOpen, (isOpen) => {
  // Clean up previous gesture handler if exists
  if (gestureCleanup) {
    gestureCleanup()
    gestureCleanup = null
  }

  if (isOpen) {
    // Setup focus trap
    setupFocusTrap()

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    // Setup swipe-to-close gesture with cleanup
    if (menuDrawer.value) {
      const { cleanup } = useTouchGestures(menuDrawer, {
        onSwipeLeft: () => {
          closeMenu()
        },
        threshold: 50
      })
      gestureCleanup = cleanup
    }
  } else {
    // Restore body scroll
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

  // Clean up gesture handlers
  if (gestureCleanup) {
    gestureCleanup()
    gestureCleanup = null
  }
})
</script>

<style scoped>
.hamburger-menu-overlay {
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
}

.hamburger-menu-drawer {
  width: 85vw;
  max-width: 320px;
  background: var(--color-background-primary);
  border-right: 1px solid var(--color-border-primary);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  will-change: transform;
}

/* Menu Header */
.menu-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-background-secondary);
  gap: var(--spacing-md);
}

.menu-logo-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.menu-logo {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 8px;
}

.menu-app-info {
  flex: 1;
  min-width: 0;
}

.menu-app-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-app-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-close-btn {
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

.menu-close-btn:hover,
.menu-close-btn:active {
  background: var(--color-button-background-hover);
  border-color: var(--color-button-border-hover);
  color: var(--color-text-primary);
}

/* Menu Content */
.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.menu-section {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-primary);
}

.menu-section:last-child {
  border-bottom: none;
}

/* Search */
.menu-search {
  position: relative;
  display: flex;
  align-items: center;
}

.menu-search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--color-text-muted);
  pointer-events: none;
}

.menu-search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) calc(var(--spacing-md) * 2.5);
  background: var(--color-input-background);
  border: 1px solid var(--color-input-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  min-height: var(--touch-target-min);
  transition: all 0.2s ease;
}

.menu-search-input:focus {
  outline: none;
  background: var(--color-input-background-focus);
  border-color: var(--color-input-border-focus);
}

.menu-search-input::placeholder {
  color: var(--color-input-placeholder);
}

/* Menu Items */
.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-button-background);
  border: 1px solid var(--color-button-border);
  border-radius: 10px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: var(--touch-target-comfortable);
  text-align: left;
  font-family: inherit;
  font-size: var(--font-size-base);
}

.menu-item:hover,
.menu-item:active {
  background: var(--color-button-background-hover);
  border-color: var(--color-button-border-hover);
  transform: translateX(4px);
}

.menu-item.active {
  background: var(--color-button-background-active);
  border-color: var(--color-accent);
}

.menu-item-icon {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.menu-item-text {
  flex: 1;
  font-weight: 500;
}

.menu-item-arrow {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.menu-item-badge {
  color: var(--color-accent);
  font-size: 1rem;
  flex-shrink: 0;
}

/* Menu Footer */
.menu-footer {
  margin-top: auto;
}

.menu-info {
  text-align: center;
  padding: var(--spacing-md) 0;
}

.menu-info-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: 500;
}

.menu-info-subtext {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

/* Transitions */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.25s ease;
}

.menu-enter-active .hamburger-menu-drawer,
.menu-leave-active .hamburger-menu-drawer {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

.menu-enter-from .hamburger-menu-drawer {
  transform: translateX(-100%);
}

.menu-leave-to .hamburger-menu-drawer {
  transform: translateX(-100%);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .menu-enter-active,
  .menu-leave-active,
  .menu-enter-active .hamburger-menu-drawer,
  .menu-leave-active .hamburger-menu-drawer,
  .menu-item {
    transition: none;
  }
}
</style>
