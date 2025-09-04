<template>
  <!-- Settings Menu Button -->
  <div class="settings-menu">
    <button 
      @click="showMenu = !showMenu"
      class="settings-btn"
      :class="{ 'active': showMenu }"
      aria-label="Settings menu"
      title="Settings menu"
    >
      ⚙️
    </button>

    <!-- Expandable Settings Panel -->
    <div class="settings-panel" v-show="showMenu">
      <div class="settings-section">
        <label>Theme</label>
        <button 
          class="settings-option-button" 
          @click="$emit('open-theme-modal')"
          aria-label="Select theme"
          title="Select theme"
        >
          <div class="option-info">
            <span class="option-title">{{ currentThemeName }}</span>
            <span class="option-description">Change app appearance</span>
          </div>
          <i class="fas fa-chevron-right option-arrow" aria-hidden="true"></i>
        </button>
      </div>

      <div class="settings-section">
        <label>Visible Widgets</label>
        <button 
          class="settings-option-button" 
          @click="$emit('open-widget-modal')"
          aria-label="Select visible widgets"
          title="Select visible widgets"
        >
          <div class="option-info">
            <span class="option-title">{{ visibleWidgets.length }} {{ visibleWidgets.length === 1 ? 'Widget' : 'Widgets' }} Selected</span>
            <span class="option-description">Choose which widgets to display</span>
          </div>
          <i class="fas fa-chevron-right option-arrow" aria-hidden="true"></i>
        </button>
      </div>

      <div class="settings-section">
        <label>Layout</label>
        <div class="layout-controls">
          <div class="layout-icons" role="radiogroup" aria-label="Layout options">
            <div 
              v-for="layout in layouts" 
              :key="layout.name" 
              class="layout-icon"
              :class="{ 'selected': selectedLayout === layout.value }" 
              @click="$emit('select-layout', layout.value)"
              tabindex="0"
              role="radio"
              :aria-checked="selectedLayout === layout.value"
              :aria-label="layout.name"
              :title="layout.name"
            >
              <i :class="['icon', layout.icon]" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <label>Card Size</label>
        <div class="card-size-controls">
          <div class="layout-icons" role="radiogroup" aria-label="Card size options">
            <div 
              v-for="size in cardSizes" 
              :key="size.name" 
              class="layout-icon"
              :class="{ 'selected': selectedCardSize === size.value }" 
              @click="$emit('select-card-size', size.value)"
              tabindex="0"
              role="radio"
              :aria-checked="selectedCardSize === size.value"
              :aria-label="size.name"
              :title="size.name"
            >
              <i :class="['icon', size.icon]" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsMenu',
  props: {
    currentThemeName: {
      type: String,
      required: true
    },
    visibleWidgets: {
      type: Array,
      required: true
    },
    selectedLayout: {
      type: String,
      required: true
    },
    selectedCardSize: {
      type: String,
      required: true
    },
    layouts: {
      type: Array,
      required: true
    },
    cardSizes: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showMenu: false
    };
  },
  emits: [
    'open-theme-modal',
    'open-widget-modal', 
    'select-layout',
    'select-card-size'
  ],
  mounted() {
    // Add click outside listener to close menu
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    handleClickOutside(event) {
      // Close menu if clicking outside
      if (!event.target.closest('.settings-menu')) {
        this.showMenu = false;
      }
    }
  }
};
</script>