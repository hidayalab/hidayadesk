<template>
  <div id="app" class="container-fluid" :class="[selectedTheme, selectedLayout, selectedCardSize]">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <header class="header" role="banner">
      <div class="header-left">
        <div class="logo-and-title">
          <img src="/logo.png" alt="FaithNotes Logo" class="logo">
          <h1 class="title">{{ pageInfo.title }}</h1>
        </div>
      </div>

      <div class="header-center">
        <div class="search-bar">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search..."
            aria-label="Search bookmarks"
          >
        </div>
      </div>

      <div class="header-right">
        <!-- Essential Controls - Always Visible -->
        <div class="widget-selector">
          <div class="widget-toggle" role="radiogroup" aria-label="Widget selection">
            <button 
              v-for="widget in availableWidgets.filter(w => visibleWidgets.includes(w.id))"
              :key="widget.id"
              @click="activeWidget = widget.id" 
              :class="{ 'selected': activeWidget === widget.id }"
              role="radio"
              :aria-checked="activeWidget === widget.id"
              :aria-label="widget.label"
              class="widget-btn"
            >
              <i :class="widget.icon" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <!-- Edit Button -->
        <div class="edit-icon-button">
          <button 
            @click="toggleEditMode" 
            class="edit-button"
            :class="{ 'active': isEditMode }"
            :aria-label="isEditMode ? 'Exit edit mode' : 'Enter edit mode'"
          >
            <i class="fas fa-pencil-alt" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Settings Menu Button -->
        <div class="settings-menu">
          <button 
            @click="showSettingsMenu = !showSettingsMenu"
            class="settings-btn"
            :class="{ 'active': showSettingsMenu }"
            aria-label="Settings menu"
          >
            ⚙️
          </button>

          <!-- Expandable Settings Panel -->
          <div class="settings-panel" v-show="showSettingsMenu">
            <div class="settings-section">
              <label>Theme</label>
              <button 
                class="settings-option-button" 
                @click="openThemeModal"
                aria-label="Select theme"
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
                @click="openWidgetModal"
                aria-label="Select visible widgets"
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
                    @click="selectOption('layout', layout.value)"
                    tabindex="0"
                    role="radio"
                    :aria-checked="selectedLayout === layout.value"
                    :aria-label="layout.name"
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
                    @click="selectOption('cardSize', size.value)"
                    tabindex="0"
                    role="radio"
                    :aria-checked="selectedCardSize === size.value"
                    :aria-label="size.name"
                  >
                    <i :class="['icon', size.icon]" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main id="main-content" class="dashboard-grid" role="main">
      <div class="bookmark-area">
        <Bookmarks :sections="sections" :search-query="searchQuery" :edit-mode="isEditMode" @add-item="handleAddItem"
          @add-section="handleAddSection" @update-section="handleUpdateSection" @update-item="handleUpdateItem"
          @delete-section="handleDeleteSection" @delete-item="handleDeleteItem" />
      </div>
      <div class="widget-area" role="region" :aria-label="`${activeWidget} widget`">
        <keep-alive>
          <quran-widget v-if="activeWidget === 'quran'"></quran-widget>
          <note-taking-widget v-else-if="activeWidget === 'notes'" :theme="selectedTheme"></note-taking-widget>
          <prayer-time-widget v-else-if="activeWidget === 'prayer'"></prayer-time-widget>
          <hadith-widget v-else-if="activeWidget === 'hadith'" :theme="selectedTheme"></hadith-widget>
        </keep-alive>
      </div>
    </main>

    <!-- Enhanced Theme Selection Modal -->
    <ThemeSelector 
      v-model="selectedTheme"
      :is-visible="showThemeModal"
      @close="closeThemeModal"
      @apply="handleThemeApply"
    />

    <!-- Widget Selection Modal -->
    <div class="modal-overlay" v-show="showWidgetModal" @click="closeWidgetModal">
      <div class="selection-modal widget-modal" @click.stop>
        <div class="modal-header">
          <h3>Select Widgets</h3>
          <button class="modal-close" @click="closeWidgetModal" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="selection-list">
            <div 
              v-for="widget in availableWidgets" 
              :key="widget.id"
              class="selection-item"
              :class="{ 
                'selected': visibleWidgets.includes(widget.id),
                'permanent': widget.id === 'quran'
              }"
              @click="widget.id !== 'quran' ? toggleWidgetSelection(widget.id) : null"
            >
              <div class="item-content">
                <div class="item-info">
                  <span class="item-title">{{ widget.name }}</span>
                  <span class="item-description">{{ getWidgetDescription(widget.id) }}</span>
                </div>
                <span v-if="widget.id === 'quran'" class="permanent-badge">Always Visible</span>
              </div>
              <div class="selection-checkbox">
                <input 
                  type="checkbox" 
                  :checked="visibleWidgets.includes(widget.id)"
                  :disabled="widget.id === 'quran'"
                  readonly
                >
                <span class="checkmark"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-button secondary" @click="closeWidgetModal">Cancel</button>
          <button class="modal-button primary" @click="closeWidgetModal">Apply</button>
        </div>
      </div>
    </div>

  </div>
  <app-footer />
</template>

<style scoped>
#app {
  padding-bottom: 60px; /* Height of the footer */
}
</style>

<script>
import yaml from 'js-yaml';
import './assets/themes/cyberglow.css';
import './assets/themes/fire.css';
import './assets/themes/glow.css';
import './assets/themes/monofire.css';
import './assets/themes/slate.css';
import './assets/themes/square.css';
import Bookmarks from './components/Bookmarks.vue';
import NoteTakingWidget from './components/NoteTakingWidget.vue';
import QuranWidget from './components/QuranWidget.vue';
import PrayerTimeWidget from './components/PrayerTimeWidget.vue';
import HadithWidget from './components/HadithWidget.vue';
import AppFooter from './components/AppFooter.vue';
import ThemeSelector from './components/ThemeSelector.vue';
import './components/styles/notetakingwidget.css';
import './components/styles/quranwidget.css';
import './components/styles/hadithwidget.css';

export default {
  components: {
    NoteTakingWidget,
    QuranWidget,
    Bookmarks,
    PrayerTimeWidget,
    HadithWidget,
    AppFooter,
    ThemeSelector
  },

  data() {
    return {
      isEditMode: true,
      activeWidget: 'quran',
      searchQuery: '',
      showMoreWidgets: false,
      showSettingsMenu: false,
      visibleWidgets: ['quran', 'notes', 'prayer', 'hadith'], // User can customize this
      pageInfo: {},
      appConfig: {},
      sections: [],
      themes: [
        { name: 'Glow', value: 'Glow', icon: 'fas fa-lightbulb', color: '#0f0' },
        { name: 'CyberGlow', value: 'CyberGlow', icon: 'fas fa-eye', color: '#0ff' },
        { name: 'Fire', value: 'Fire', icon: 'fas fa-fire', color: '#ff6347' },
        { name: 'Slate', value: 'slate', icon: 'fas fa-square', color: '#fff' },
        { name: 'MonoFire', value: 'MonoFire', icon: 'fas fa-fire-alt', color: '#fff' },
        { name: 'Square', value: 'Square', icon: 'fas fa-th-large', color: '#1a1a1a' },
      ],
      layouts: [
        { name: 'Single Column', value: 'layout-compact', icon: 'fas fa-list' },
        { name: 'Two Column', value: 'layout-two-column', icon: 'fas fa-columns' },
        { name: 'Three Column', value: 'layout-three-column', icon: 'fas fa-th' },
      ],
      cardSizes: [
        { name: 'Small', value: 'card-size-small', icon: 'fas fa-compress-alt' },
        { name: 'Medium', value: 'card-size-medium', icon: 'fas fa-expand-alt' },
        { name: 'List', value: 'card-size-list', icon: 'fas fa-bars' },
      ],
      selectedTheme: 'CyberGlow',
      selectedLayout: 'layout-three-column',
      selectedCardSize: 'card-size-medium',
      showThemeDropdown: false,
      showWidgetDropdown: false,
      showThemeModal: false,
      showWidgetModal: false,
    };
  },
  computed: {
    currentThemeName() {
      const theme = this.themes.find(t => t.value === this.selectedTheme);
      return theme ? theme.name : '';
    },
    currentThemeIcon() {
      const theme = this.themes.find(t => t.value === this.selectedTheme);
      return theme ? theme.icon : '';
    },
    currentThemeColor() {
      const theme = this.themes.find(t => t.value === this.selectedTheme);
      return theme ? theme.color : '';
    },
    availableWidgets() {
      return [
        { id: 'quran', name: 'Quran Verses', icon: 'fas fa-book', label: 'Quran Widget' },
        { id: 'notes', name: 'Notes', icon: 'fas fa-sticky-note', label: 'Notes Widget' },
        { id: 'prayer', name: 'Prayer Times', icon: 'fas fa-mosque', label: 'Prayer Widget' },
        { id: 'hadith', name: 'Hadith', icon: 'fas fa-book-open', label: 'Hadith Widget' }
      ];
    }
  },
  watch: {
    selectedTheme(newTheme) {
      localStorage.setItem('selectedTheme', newTheme);
    },
    selectedLayout(newLayout) {
      localStorage.setItem('selectedLayout', newLayout);
    },
    selectedCardSize(newSize) {
      localStorage.setItem('selectedCardSize', newSize);
    },
    visibleWidgets(newWidgets) {
      localStorage.setItem('visibleWidgets', JSON.stringify(newWidgets));
      // If current widget is hidden, switch to first visible widget
      if (!newWidgets.includes(this.activeWidget) && newWidgets.length > 0) {
        this.activeWidget = newWidgets[0];
      }
    },
  },
  mounted() {
    this.fetchConfig();
    // Add click outside listener to close dropdowns
    document.addEventListener('click', this.handleClickOutside);
    // Add keyboard navigation
    document.addEventListener('keydown', this.handleKeyNavigation);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyNavigation);
  },
  methods: {
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
    },
    handleAddItem(payload) {
      const section = this.sections.find(s => s.name === payload.sectionName);
      if (section) {
        section.items.push(payload.item);
        this.saveSectionsToLocalStorage();
      }
    },
    handleAddSection(sectionName) {
      this.sections.push({ name: sectionName, items: [] });
      this.saveSectionsToLocalStorage();
    },
    handleUpdateSection(payload) {
      this.sections[payload.index] = payload.section;
      this.saveSectionsToLocalStorage();
    },
    handleUpdateItem(payload) {
      this.sections[payload.sectionIndex].items[payload.itemIndex] = payload.item;
      this.saveSectionsToLocalStorage();
    },
    handleDeleteSection(sectionIndex) {
      this.sections.splice(sectionIndex, 1);
      this.saveSectionsToLocalStorage();
    },
    handleDeleteItem(payload) {
      this.sections[payload.sectionIndex].items.splice(payload.itemIndex, 1);
      this.saveSectionsToLocalStorage();
    },
    saveSectionsToLocalStorage() {
      localStorage.setItem('userSections', JSON.stringify(this.sections));
    },
    async fetchConfig() {
      try {
        const configUrl = import.meta.env.BASE_URL + 'config.yml';
        const response = await fetch(configUrl);
        const configText = await response.text();
        const config = yaml.load(configText);
        this.pageInfo = config.pageInfo;
        this.appConfig = config.appConfig;

        const savedSections = localStorage.getItem('userSections');
        if (savedSections) {
          this.sections = JSON.parse(savedSections);
        } else {
          this.sections = config.sections;
        }

        // Initial theme and layout from config, overridden by localStorage if present
        this.selectedTheme = localStorage.getItem('selectedTheme') || this.appConfig.theme || 'CyberGlow';
        this.selectedLayout = localStorage.getItem('selectedLayout') || this.appConfig.layout || 'layout-three-column';
        this.selectedCardSize = localStorage.getItem('selectedCardSize') || this.appConfig.cardSize || 'card-size-medium';
        
        // Load visible widgets from localStorage
        const savedVisibleWidgets = localStorage.getItem('visibleWidgets');
        if (savedVisibleWidgets) {
          this.visibleWidgets = JSON.parse(savedVisibleWidgets);
        }
      } catch (error) {
        console.error('Error fetching or parsing config:', error);
      }
    },
    toggleDropdown(type) {
      if (type === 'widgets') {
        this.showWidgetDropdown = !this.showWidgetDropdown;
      } else {
        this[`show${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`] = !this[`show${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`];
      }
    },
    handleClickOutside(event) {
      // Close dropdowns and menus if clicking outside
      if (!event.target.closest('.theme-selector')) {
        this.showThemeDropdown = false;
      }
      if (!event.target.closest('.widget-multiselect')) {
        this.showWidgetDropdown = false;
      }
      if (!event.target.closest('.settings-menu')) {
        this.showSettingsMenu = false;
      }
    },
    selectOption(type, value) {
      if (type === 'theme') {
        this.selectedTheme = value;
        this.showThemeDropdown = false;
      } else if (type === 'layout') {
        this.selectedLayout = value;
      } else if (type === 'cardSize') {
        this.selectedCardSize = value;
      }
    },
    
    handleKeyNavigation(event) {
      // Close dropdowns and modals with Escape key
      if (event.key === 'Escape') {
        this.showThemeDropdown = false;
        this.showWidgetDropdown = false;
        this.showThemeModal = false;
        this.showWidgetModal = false;
      }
      
      // Widget switching with number keys
      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        switch (event.key) {
          case '1':
            this.activeWidget = 'quran';
            event.preventDefault();
            break;
          case '2':
            if (this.showMoreWidgets) {
              this.activeWidget = 'notes';
              event.preventDefault();
            }
            break;
          case '3':
            if (this.showMoreWidgets) {
              this.activeWidget = 'prayer';
              event.preventDefault();
            }
            break;
          case '4':
            if (this.showMoreWidgets) {
              this.activeWidget = 'hadith';
              event.preventDefault();
            }
            break;
          case 'e':
          case 'E':
            if (event.ctrlKey || event.metaKey) {
              this.toggleEditMode();
              event.preventDefault();
            }
            break;
        }
      }
    },
    
    toggleWidgetVisibility(widgetId) {
      // Don't allow toggling the Quran widget - it's always visible
      if (widgetId === 'quran') {
        return;
      }
      
      const index = this.visibleWidgets.indexOf(widgetId);
      if (index > -1) {
        this.visibleWidgets.splice(index, 1);
      } else {
        this.visibleWidgets.push(widgetId);
      }
    },
    
    toggleWidgetSelection(widgetId) {
      // Don't allow toggling the Quran widget - it's always visible
      if (widgetId === 'quran') {
        return;
      }
      this.toggleWidgetVisibility(widgetId);
    },
    
    getWidgetById(widgetId) {
      return this.availableWidgets.find(widget => widget.id === widgetId);
    },
    
    // Modal methods
    openThemeModal() {
      this.showThemeModal = true;
      this.showSettingsMenu = false;
    },
    
    closeThemeModal() {
      this.showThemeModal = false;
    },
    
    openWidgetModal() {
      this.showWidgetModal = true;
      this.showSettingsMenu = false;
    },
    
    closeWidgetModal() {
      this.showWidgetModal = false;
    },
    
    selectTheme(themeValue) {
      this.selectedTheme = themeValue;
      this.closeThemeModal();
    },
    
    handleThemeApply(themeValue) {
      this.selectedTheme = themeValue;
      this.closeThemeModal();
    },
    
    getThemeDescription(themeValue) {
      const descriptions = {
        'CyberGlow': 'Futuristic cyan glow effects',
        'Fire': 'Warm orange and red tones',
        'Glow': 'Vibrant green illumination',
        'slate': 'Professional gray palette',
        'MonoFire': 'Classic black and white',
        'Square': 'Clean minimal design'
      };
      return descriptions[themeValue] || '';
    },
    
    getWidgetDescription(widgetId) {
      const descriptions = {
        'quran': 'Display verses from the Holy Quran',
        'notes': 'Personal notes and thoughts',
        'prayer': 'Prayer times and reminders',
        'hadith': 'Islamic traditions and sayings'
      };
      return descriptions[widgetId] || '';
    }
  },
};
</script>
