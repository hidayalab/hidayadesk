<template>
  <div class="theme-selector-container" data-testid="theme-selector">
    <!-- Compact Theme Selection Modal -->
    <Transition name="modal">
      <div 
        v-if="isVisible"
        class="modal-overlay" 
        :class="currentThemeClass"
        @click="closeModal"
      >
        <div class="theme-modal compact-modal" :class="currentThemeClass" @click.stop role="dialog" aria-labelledby="theme-modal-title" aria-modal="true">
          <div class="modal-header">
            <h2 id="theme-modal-title" class="modal-title">Choose Your Theme</h2>
            <button 
              class="modal-close-btn" 
              @click="closeModal" 
              aria-label="Close theme selection"
              type="button"
            >
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="themes-list" role="radiogroup" aria-label="Available themes">
              <div 
                v-for="theme in enhancedThemes" 
                :key="theme.id"
                class="theme-row"
                :class="{ 
                  'selected': selectedTheme === theme.id,
                  'focused': focusedTheme === theme.id
                }"
                @click="selectTheme(theme.id)"
                @keydown="handleKeyNavigation"
                :tabindex="selectedTheme === theme.id ? 0 : -1"
                role="radio"
                :aria-checked="selectedTheme === theme.id"
                :aria-label="`${theme.name} theme: ${theme.description}`"
              >
                <!-- Theme Gradient Background -->
                <div 
                  class="theme-gradient-bg"
                  :style="{ 
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`
                  }"
                ></div>
                
                <!-- Theme Content -->
                <div class="theme-content">
                  <!-- Left: Icon and Name -->
                  <div class="theme-left">
                    <div class="theme-icon" :style="{ color: theme.colors.primary }" aria-hidden="true">
                      <i :class="theme.icon"></i>
                    </div>
                    <div class="theme-info">
                      <h3 class="theme-name">{{ theme.name }}</h3>
                      <p class="theme-description">{{ theme.description }}</p>
                    </div>
                  </div>
                  
                  <!-- Center: Color Palette -->
                  <div class="theme-colors">
                    <div class="color-dots">
                      <div 
                        class="color-dot"
                        :style="{ backgroundColor: theme.colors.primary }"
                        :title="`Primary: ${theme.colors.primary}`"
                      ></div>
                      <div 
                        class="color-dot"
                        :style="{ backgroundColor: theme.colors.secondary }"
                        :title="`Secondary: ${theme.colors.secondary}`"
                      ></div>
                      <div 
                        class="color-dot"
                        :style="{ backgroundColor: theme.colors.accent }"
                        :title="`Accent: ${theme.colors.accent}`"
                      ></div>
                      <div 
                        class="color-dot"
                        :style="{ backgroundColor: theme.colors.background }"
                        :title="`Background: ${theme.colors.background}`"
                      ></div>
                    </div>
                  </div>
                  
                  <!-- Right: Selection Status -->
                  <div class="theme-right">
                    <div class="selection-indicator" v-if="selectedTheme === theme.id" aria-hidden="true">
                      <i class="fas fa-check"></i>
                    </div>
                    <div class="theme-popularity">{{ theme.popularity }}</div>
                  </div>
                </div>
                
                <!-- Focus Ring -->
                <div class="focus-ring" v-if="focusedTheme === theme.id"></div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              class="btn btn-secondary" 
              @click="closeModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-primary" 
              @click="applyTheme"
              type="button"
            >
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import themeService from '../services/themeService.js'
import './styles/theme-selector.css'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: 'CyberGlow'
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'close', 'apply'])

// Reactive state
const selectedTheme = ref(props.modelValue)
const focusedTheme = ref(props.modelValue)

// Computed properties
const currentThemeClass = computed(() => {
  return props.modelValue
})

// Enhanced theme data - loaded from JSON with UI enhancements
const enhancedThemes = ref([])


// Load themes from service and enhance with UI data
const loadThemes = async () => {
  try {
    const themes = await themeService.loadThemes()
    enhancedThemes.value = themes.map(theme => ({
      id: theme.id,
      name: theme.displayName || theme.name,
      description: theme.description, // From JSON
      icon: theme.icon,
      colors: theme.uiColors || {
        // Fallback colors if uiColors not defined
        primary: theme.color,
        secondary: '#333333',
        accent: theme.color,
        background: '#000000',
        text: '#ffffff'
      },
      popularity: theme.popularity || 'New' // From JSON
    }))
  } catch (error) {
    console.error('Failed to load themes in ThemeSelector:', error)
    // Fall back to empty array - component will handle gracefully
    enhancedThemes.value = []
  }
}

// Initialize themes on component mount
onMounted(() => {
  loadThemes()
})

// Methods
const selectTheme = (themeId) => {
  selectedTheme.value = themeId
  focusedTheme.value = themeId
  emit('update:modelValue', themeId)
}

const closeModal = () => {
  emit('close')
}

const applyTheme = () => {
  emit('apply', selectedTheme.value)
  closeModal()
}

const handleKeyNavigation = (event) => {
  const themes = enhancedThemes.value
  const currentIndex = themes.findIndex(theme => theme.id === focusedTheme.value)
  
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault()
      const nextIndex = (currentIndex + 1) % themes.length
      focusedTheme.value = themes[nextIndex].id
      event.target.parentElement.children[nextIndex].focus()
      break
      
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault()
      const prevIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1
      focusedTheme.value = themes[prevIndex].id
      event.target.parentElement.children[prevIndex].focus()
      break
      
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectTheme(focusedTheme.value)
      break
      
    case 'Escape':
      event.preventDefault()
      closeModal()
      break
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  selectedTheme.value = newValue
  focusedTheme.value = newValue
})

watch(() => props.isVisible, (isVisible) => {
  console.log('ThemeSelector visibility changed:', isVisible)
  if (isVisible) {
    // Focus management for accessibility
    setTimeout(() => {
      const firstTheme = document.querySelector('.theme-card[aria-checked="true"]')
      if (firstTheme) {
        firstTheme.focus()
      }
    }, 100)
  }
})
</script>

