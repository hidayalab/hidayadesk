<template>
  <nav
    class="bottom-navigation"
    role="navigation"
    aria-label="Widget navigation"
    :style="{ paddingBottom: safeAreaBottom }"
  >
    <button
      v-for="widget in visibleWidgets"
      :key="widget.id"
      class="bottom-nav-btn"
      :class="{ active: activeWidget === widget.id }"
      @click="$emit('switch-widget', widget.id)"
      :aria-label="`Switch to ${widget.label}`"
      :aria-pressed="activeWidget === widget.id"
    >
      <i :class="widget.icon" class="bottom-nav-icon" aria-hidden="true"></i>
      <span class="bottom-nav-label">{{ widget.name }}</span>
      <span
        v-if="activeWidget === widget.id"
        class="bottom-nav-indicator"
        aria-hidden="true"
      ></span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeWidget: {
    type: String,
    required: true
  },
  availableWidgets: {
    type: Array,
    default: () => [
      { id: 'quran', name: 'Quran', icon: 'fas fa-book', label: 'Quran Widget' },
      { id: 'prayer', name: 'Prayer', icon: 'fas fa-mosque', label: 'Prayer Widget' },
      { id: 'notes', name: 'Notes', icon: 'fas fa-sticky-note', label: 'Notes Widget' }
    ]
  },
  visibleWidgetIds: {
    type: Array,
    default: () => ['quran', 'prayer', 'notes']
  }
})

const emit = defineEmits(['switch-widget'])

// Filter to show only visible widgets (respecting user preferences)
const visibleWidgets = computed(() => {
  return props.availableWidgets.filter(widget =>
    props.visibleWidgetIds.includes(widget.id)
  )
})

// Safe area support for iOS devices with home indicator
const safeAreaBottom = computed(() => 'var(--safe-area-bottom, 0px)')
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--color-border-primary);
  z-index: 999;
  height: 56px;
  min-height: 56px;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.3);
  padding-left: var(--safe-area-left, 0);
  padding-right: var(--safe-area-right, 0);
}

.bottom-nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: var(--touch-target-min);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

.bottom-nav-btn:hover,
.bottom-nav-btn:active {
  background: var(--color-button-background-hover);
  color: var(--color-text-secondary);
}

.bottom-nav-btn.active {
  color: var(--color-accent);
}

.bottom-nav-btn:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.bottom-nav-icon {
  font-size: 1.25rem;
  transition: all 0.2s ease;
}

.bottom-nav-btn.active .bottom-nav-icon {
  transform: scale(1.1);
}

.bottom-nav-label {
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.bottom-nav-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 3px;
  background: var(--color-accent);
  border-radius: 0 0 3px 3px;
}

/* Active state with haptic-like feedback */
.bottom-nav-btn:active {
  transform: scale(0.95);
}

/* Hardware acceleration */
.bottom-nav-btn {
  will-change: transform;
  transform: translateZ(0);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .bottom-nav-btn,
  .bottom-nav-icon {
    transition: none;
  }

  .bottom-nav-btn:active {
    transform: none;
  }

  .bottom-nav-btn.active .bottom-nav-icon {
    transform: none;
  }
}

/* Adjust for very small screens */
@media (max-width: 374px) {
  .bottom-nav-icon {
    font-size: 1.1rem;
  }

  .bottom-nav-label {
    font-size: 0.5625rem;
  }
}

/* Landscape mode on mobile - reduce height */
@media (orientation: landscape) and (max-height: 500px) {
  .bottom-navigation {
    height: 48px;
    min-height: 48px;
  }

  .bottom-nav-icon {
    font-size: 1.1rem;
  }

  .bottom-nav-label {
    font-size: 0.5625rem;
  }
}

/* Handle more than 3 widgets - make scrollable */
@media (max-width: 480px) {
  .bottom-navigation {
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .bottom-navigation::-webkit-scrollbar {
    display: none;
  }

  .bottom-nav-btn {
    flex: 0 0 auto;
    min-width: 80px;
  }
}
</style>
