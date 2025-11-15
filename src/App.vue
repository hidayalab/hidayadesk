<template>
  <div id="app" class="container-fluid" :class="[selectedTheme, selectedLayout, selectedCardSize]" data-testid="app-root">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Mobile Header (< 768px) -->
    <mobile-header
      v-if="isMobileView"
      :title="pageInfo.title || 'FaithNotes'"
      :logo="baseUrl + 'logo.png'"
      :menu-open="showMobileMenu"
      @toggle-menu="toggleMobileMenu"
      @toggle-theme="openThemeModal"
    />

    <!-- Desktop Header (>= 768px) -->
    <header v-else class="header" role="banner">
      <div class="header-left">
        <div class="logo-and-title">
          <img :src="baseUrl + 'logo.png'" alt="HidayaDesk Logo" class="logo">
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
              :title="widget.label"
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
            :title="isEditMode ? 'Exit edit mode' : 'Enter edit mode'"
          >
            <i class="fas fa-pencil-alt" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Settings Menu Component -->
        <settings-menu 
          :current-theme-name="currentThemeName"
          :visible-widgets="visibleWidgets"
          :selected-layout="selectedLayout"
          :selected-card-size="selectedCardSize"
          :layouts="layouts"
          :card-sizes="cardSizes"
          @open-theme-modal="openThemeModal"
          @open-widget-modal="openWidgetModal"
          @select-layout="value => selectOption('layout', value)"
          @select-card-size="value => selectOption('cardSize', value)"
        />
      </div>
    </header>
    <main id="main-content" class="dashboard-grid" role="main">
      <div class="bookmark-area">
        <Bookmarks :initial-sections="sections" :search-query="searchQuery" :edit-mode="isEditMode" />
      </div>
      <!-- Widget Area Component with swipe support -->
      <div ref="widgetAreaContainer" class="widget-area-wrapper">
        <widget-area
          :active-widget="activeWidget"
          :theme="selectedTheme"
        />
      </div>
    </main>

    <!-- Enhanced Theme Selection Modal -->
    <ThemeSelector 
      v-model="selectedTheme"
      :is-visible="showThemeModal"
      @close="closeThemeModal"
      @apply="handleThemeApply"
    />

    <!-- Widget Selection Modal Component -->
    <widget-selection-modal
      :is-visible="showWidgetModal"
      :available-widgets="availableWidgets"
      :visible-widgets="visibleWidgets"
      @close="closeWidgetModal"
      @toggle-widget="toggleWidgetSelection"
    />

    <!-- Mobile Components -->
    <!-- Hamburger Menu -->
    <hamburger-menu
      :is-open="showMobileMenu"
      :app-title="pageInfo.title || 'FaithNotes'"
      :subtitle="'Your Islamic Dashboard'"
      :logo="baseUrl + 'logo.png'"
      :search-query="searchQuery"
      :is-edit-mode="isEditMode"
      @close="closeMobileMenu"
      @toggle-edit="toggleEditMode"
      @open-settings="openSettingsFromMenu"
      @update:search-query="searchQuery = $event"
    />

    <!-- Settings Drawer -->
    <settings-drawer
      :is-open="showMobileSettings"
      :current-theme-name="currentThemeName"
      :visible-widgets="visibleWidgets"
      :selected-layout="selectedLayout"
      :selected-card-size="selectedCardSize"
      :layouts="layouts"
      :card-sizes="cardSizes"
      @close="closeMobileSettings"
      @open-theme-modal="openThemeModal"
      @open-widget-modal="openWidgetModal"
      @select-layout="value => selectOption('layout', value)"
      @select-card-size="value => selectOption('cardSize', value)"
    />

    <!-- Bottom Navigation (Mobile only) -->
    <bottom-navigation
      v-if="isMobileView"
      :active-widget="activeWidget"
      :available-widgets="availableWidgets"
      :visible-widget-ids="visibleWidgets"
      @switch-widget="switchWidget"
    />

    <app-footer />

  </div>
</template>

<script>
import yaml from 'js-yaml';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Bookmarks from './components/Bookmarks.vue';
import AppFooter from './components/AppFooter.vue';
import ThemeSelector from './components/ThemeSelector.vue';
import WidgetSelectionModal from './components/WidgetSelectionModal.vue';
import WidgetArea from './components/WidgetArea.vue';
import SettingsMenu from './components/SettingsMenu.vue';
import MobileHeader from './components/mobile/MobileHeader.vue';
import HamburgerMenu from './components/mobile/HamburgerMenu.vue';
import BottomNavigation from './components/mobile/BottomNavigation.vue';
import SettingsDrawer from './components/mobile/SettingsDrawer.vue';
import { useViewport } from './composables/useViewport';
import { useTouchGestures } from './composables/useTouchGestures';
import themeService from './services/themeService.js';
import './components/styles/notetakingwidget.css';
import './components/styles/quranwidget.css';
import './components/styles/hadithwidget.css';

export default {
  components: {
    Bookmarks,
    AppFooter,
    ThemeSelector,
    WidgetSelectionModal,
    WidgetArea,
    SettingsMenu,
    MobileHeader,
    HamburgerMenu,
    BottomNavigation,
    SettingsDrawer
  },

  data() {
    return {
      baseUrl: import.meta.env.BASE_URL,
      isEditMode: true,
      activeWidget: 'quran',
      searchQuery: '',
      showMoreWidgets: false,
      visibleWidgets: ['quran', 'notes', 'prayer', 'hadith'], // User can customize this
      pageInfo: {},
      appConfig: {},
      sections: [], // Initial sections loaded from config
      themes: [], // Will be loaded from JSON files
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
      // Mobile-specific state
      showMobileMenu: false,
      showMobileSettings: false,
      isMobile: false,
      widgetAreaRef: null,
    };
  },
  setup() {
    const { isMobile, isTablet } = useViewport();
    return {
      isMobileView: isMobile,
      isTabletView: isTablet
    };
  },
  computed: {
    currentThemeName() {
      const theme = this.themes.find(t => t.value === this.selectedTheme);
      return theme ? theme.name : this.selectedTheme || 'Loading...';
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
      // Apply theme CSS variables from JSON
      themeService.applyTheme(newTheme);
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
    this.loadThemes();
    // Add click outside listener to close dropdowns
    document.addEventListener('click', this.handleClickOutside);

    // Setup swipe gestures for widget switching on mobile
    this.$nextTick(() => {
      this.setupSwipeGestures();
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
    },
    async fetchConfig() {
      try {
        const configUrl = import.meta.env.BASE_URL + 'config.yml';
        const response = await fetch(configUrl);
        const configText = await response.text();
        const config = yaml.load(configText);
        this.pageInfo = config.pageInfo;
        this.appConfig = config.appConfig;

        // Set initial sections from config (Bookmarks component handles localStorage)
        this.sections = config.sections;

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
    },
    
    closeThemeModal() {
      this.showThemeModal = false;
    },
    
    openWidgetModal() {
      this.showWidgetModal = true;
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
    
    

    async loadThemes() {
      try {
        console.log('Starting to load themes...');
        const loadedThemes = await themeService.loadThemes();
        console.log('Raw loaded themes:', loadedThemes);
        this.themes = themeService.convertToAppFormat(loadedThemes);
        console.log('Converted themes for App.vue:', this.themes);
        console.log('Current selected theme:', this.selectedTheme);

        // Apply initial theme CSS variables
        if (this.selectedTheme) {
          themeService.applyTheme(this.selectedTheme);
        }

        // Force reactivity update
        this.$forceUpdate();
      } catch (error) {
        console.error('Failed to load themes:', error);
        // Use fallback themes from service
        const fallbackThemes = themeService.getFallbackThemes();
        this.themes = themeService.convertToAppFormat(fallbackThemes);
        console.log('Using fallback themes:', this.themes);
      }
    },

    // Mobile-specific methods
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
    },

    closeMobileMenu() {
      this.showMobileMenu = false;
    },

    toggleMobileSettings() {
      this.showMobileSettings = !this.showMobileSettings;
    },

    closeMobileSettings() {
      this.showMobileSettings = false;
    },

    openSettingsFromMenu() {
      this.showMobileSettings = true;
    },

    switchWidget(widgetId) {
      this.activeWidget = widgetId;
    },

    setupSwipeGestures() {
      const widgetArea = this.$refs.widgetAreaContainer;
      if (!widgetArea || !this.isMobileView) return;

      useTouchGestures(widgetArea, {
        onSwipeLeft: () => {
          this.swipeToNextWidget();
        },
        onSwipeRight: () => {
          this.swipeToPrevWidget();
        },
        threshold: 80
      });
    },

    swipeToNextWidget() {
      const currentIndex = this.visibleWidgets.indexOf(this.activeWidget);
      if (currentIndex < this.visibleWidgets.length - 1) {
        this.activeWidget = this.visibleWidgets[currentIndex + 1];
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    },

    swipeToPrevWidget() {
      const currentIndex = this.visibleWidgets.indexOf(this.activeWidget);
      if (currentIndex > 0) {
        this.activeWidget = this.visibleWidgets[currentIndex - 1];
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    }
  },
};
</script>
