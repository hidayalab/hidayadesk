<template>
  <header
    class="mobile-header"
    role="banner"
    :style="{ paddingTop: safeAreaTop }"
  >
    <button
      class="mobile-header-btn hamburger-btn"
      @click="$emit('toggle-menu')"
      aria-label="Open menu"
      :aria-expanded="menuOpen"
    >
      <i class="fas fa-bars" aria-hidden="true"></i>
    </button>

    <div class="mobile-header-title">
      <img
        v-if="logo"
        :src="logo"
        alt=""
        class="mobile-header-logo"
      >
      <h1 class="mobile-title">{{ title }}</h1>
    </div>

    <button
      class="mobile-header-btn theme-btn"
      @click="$emit('toggle-theme')"
      aria-label="Change theme"
    >
      <i class="fas fa-palette" aria-hidden="true"></i>
    </button>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'FaithNotes'
  },
  logo: {
    type: String,
    default: '/logo.png'
  },
  menuOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-menu', 'toggle-theme'])

// Safe area support for iOS notched devices
const safeAreaTop = computed(() => {
  return 'var(--safe-area-top, 0px)'
})
</script>

<style scoped>
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border-primary);
  z-index: 1000;
  height: 56px;
  min-height: 56px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  gap: var(--spacing-md);
}

.mobile-header-btn {
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

.mobile-header-btn:hover,
.mobile-header-btn:active {
  background: var(--color-button-background-hover);
  border-color: var(--color-button-border-hover);
  color: var(--color-text-primary);
}

.mobile-header-btn:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.mobile-header-title {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 0;
  gap: var(--spacing-sm);
}

.mobile-header-logo {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.mobile-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  line-height: 1;
}

/* Hardware acceleration for better performance */
.mobile-header-btn {
  will-change: transform;
  transform: translateZ(0);
}

/* Active state with slight press effect */
.mobile-header-btn:active {
  transform: scale(0.95) translateZ(0);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .mobile-header-btn {
    transition: none;
  }
}

/* Very small screens adjustments */
@media (max-width: 374px) {
  .mobile-title {
    font-size: var(--font-size-sm);
  }

  .mobile-header-logo {
    width: 24px;
    height: 24px;
  }

  .mobile-header-btn {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    font-size: 1rem;
  }
}
</style>
