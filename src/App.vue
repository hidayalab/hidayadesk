<template>
  <div id="app" class="container-fluid" :class="[selectedTheme, selectedLayout, selectedCardSize]">
    <header class="header">
      <div class="logo-and-title">
        <h1 class="title">{{ pageInfo.title }}</h1>
      </div>
      <div class="controls">
        <div class="theme-selector custom-dropdown">
          <label>Theme:</label>
          <div class="selected-option" @click="toggleDropdown('theme')">
            <i :class="['icon', currentThemeIcon]"></i>
            <span>{{ currentThemeName }}</span>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
          </div>
          <ul class="options-list" v-show="showThemeDropdown">
            <li v-for="theme in themes" :key="theme.name" @click="selectOption('theme', theme.value)">
              <i :class="['icon', theme.icon]" :style="{ color: theme.color }"></i>
              <span>{{ theme.name }}</span>
            </li>
          </ul>
        </div>
        <div class="layout-selector">
          <label>Layout</label>
          <div class="layout-icons">
            <div v-for="layout in layouts" :key="layout.name"
                 class="layout-icon"
                 :class="{ 'selected': selectedLayout === layout.value }"
                 @click="selectOption('layout', layout.value)">
              <i :class="['icon', layout.icon]"></i>
            </div>
          </div>
        </div>
        <div class="card-size-selector">
          <label>Card Size</label>
          <div class="layout-icons">
            <div v-for="size in cardSizes" :key="size.name"
                 class="layout-icon"
                 :class="{ 'selected': selectedCardSize === size.value }"
                 @click="selectOption('cardSize', size.value)">
              <i :class="['icon', size.icon]"></i>
            </div>
          </div>
        </div>

        <div class="widget-toggle">
          <button @click="activeWidget = 'quran'" :class="{ 'selected': activeWidget === 'quran' }">Quran Verse</button>
          <button @click="activeWidget = 'notes'" :class="{ 'selected': activeWidget === 'notes' }">Notes</button>
        </div>

        <nav class="nav-links">
          <a v-for="link in pageInfo.navLinks" :key="link.title" :href="link.path" target="_blank">{{ link.title }}</a>
        </nav>
      </div>
    </header>
    <main class="dashboard-grid">
      <div class="main-content">
        <div v-for="section in sections" :key="section.name" class="section">
          <h2 class="section-title">{{ section.name }}</h2>
          <div class="widget-grid">
      
          </div>
          <ul class="item-list">
            <li v-for="item in section.items" :key="item.title" class="list-item">
              <a :href="item.url" target="_blank" class="item-link">
                <i :class="['icon', item.icon]"></i>
                <p class="item-title">{{ item.title }}</p>
              </a>
            </li>
            <li class="list-item add-item-button" @click="showAddItemModal()">
              <a target="_blank" class="item-link">
                <i class="icon fa fa-plus" aria-hidden="true"></i>
                <p class="item-title">Add</p>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="widget-area">
        <quran-widget v-if="activeWidget === 'quran'"></quran-widget>
        <note-taking-widget v-if="activeWidget === 'notes'"></note-taking-widget>
      </div>
    </main>

    <!-- Add Item Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>Add New Item</h3>
        <form @submit.prevent="addItem">
          <div class="form-group">
            <label for="item-title">Title:</label>
            <input type="text" id="item-title" v-model="newItem.title" required>
          </div>
          <div class="form-group">
            <label for="item-url">URL:</label>
            <input type="url" id="item-url" v-model="newItem.url" required>
          </div>
          <div class="form-group">
            <label for="item-icon">Icon (Font Awesome class, e.g., fas fa-star):</label>
            <input type="text" id="item-icon" v-model="newItem.icon">
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-button">Add Item</button>
            <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import yaml from 'js-yaml';
import NoteTakingWidget from './components/NoteTakingWidget.vue';
import QuranWidget from './components/QuranWidget.vue';
import './components/styles/quranwidget.css';

export default {
  components: {
    NoteTakingWidget,
    QuranWidget,
  },
  data() {
    return {
      activeWidget: 'quran', // or 'notes'
      pageInfo: {},
      appConfig: {},
      sections: [],
      currentTime: new Date().toLocaleTimeString(),
      currentDate: new Date().toLocaleDateString(),
      themes: [
        { name: 'Glow', value: 'Glow', icon: 'fas fa-lightbulb', color: '#0f0' },
        { name: 'CyberGlow', value: 'CyberGlow', icon: 'fas fa-eye	', color: '#0ff' },
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
      selectedTheme: 'dashy-dark',
      selectedLayout: 'layout-three-column',
      selectedCardSize: 'card-size-medium',
      showThemeDropdown: false,
      showLayoutDropdown: false,
      showCardSizeDropdown: false,
      showModal: false,
      newItem: {
        title: '',
        url: '',
        icon: '',
      },
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
    currentLayoutName() {
      const layout = this.layouts.find(l => l.value === this.selectedLayout);
      return layout ? layout.name : '';
    },
    currentLayoutIcon() {
      const layout = this.layouts.find(l => l.value === this.selectedLayout);
      return layout ? layout.icon : '';
    },
    currentCardSizeName() {
      const size = this.cardSizes.find(s => s.value === this.selectedCardSize);
      return size ? size.name : '';
    },
    currentCardSizeIcon() {
      const size = this.cardSizes.find(s => s.value === this.selectedCardSize);
      return size ? size.icon : '';
    },
  },
  watch: {
    selectedTheme(newTheme, oldTheme) {
      localStorage.setItem('selectedTheme', newTheme);
      this.updateThemeStylesheet(newTheme, oldTheme);
    },
    selectedLayout(newLayout) {
      localStorage.setItem('selectedLayout', newLayout);
    },
    selectedCardSize(newSize) {
      localStorage.setItem('selectedCardSize', newSize);
    },
  },
  mounted() {
    this.fetchConfig();
    this.selectedTheme = localStorage.getItem('selectedTheme') || this.selectedTheme;
    this.updateThemeStylesheet(this.selectedTheme);
    this.selectedLayout = localStorage.getItem('selectedLayout') || this.selectedLayout;
    this.selectedCardSize = localStorage.getItem('selectedCardSize') || this.selectedCardSize;
  },
  methods: {
    async fetchConfig() {
      try {
        const response = await fetch('/conf.yml');
        const configText = await response.text();
        const config = yaml.load(configText);
        this.pageInfo = config.pageInfo;
        this.appConfig = config.appConfig;
        this.sections = config.sections;
        // Initial theme and layout from config, overridden by localStorage if present
        this.selectedTheme = localStorage.getItem('selectedTheme') || this.appConfig.theme || 'dashy-dark';
        this.selectedLayout = localStorage.getItem('selectedLayout') || this.appConfig.layout || 'layout-three-column';
        this.selectedCardSize = localStorage.getItem('selectedCardSize') || this.appConfig.cardSize || 'card-size-medium';
      } catch (error) {
        console.error('Error fetching or parsing config:', error);
      }
    },
    toggleDropdown(type) {
      this[`show${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`] = !this[`show${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`];
    },
    selectOption(type, value) {
      this[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`] = value;
      if (type !== 'layout' && type !== 'cardSize') {
        this.toggleDropdown(type);
      }
    },
    updateThemeStylesheet(newTheme) {
      const themeName = newTheme.toLowerCase().replace(' ', '-');
      let themeUrl = `/src/assets/themes/${themeName}.css`;

      // Check if a theme stylesheet link already exists
      let themeLink = document.getElementById('theme-stylesheet');

      if (!themeLink) {
        // If it doesn't exist, create it
        themeLink = document.createElement('link');
        themeLink.id = 'theme-stylesheet';
        themeLink.rel = 'stylesheet';
        document.head.appendChild(themeLink);
      }
      
      // Set the href to the new theme's stylesheet
      themeLink.href = themeUrl;
    },
    showAddItemModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    addItem() {
      // Basic validation
      if (!this.newItem.title || !this.newItem.url) {
        alert('Title and URL are required.');
        return;
      }

      // Find the target section (e.g., the first section)
      // You might want a more sophisticated way to select the section
      const targetSection = this.sections[0];
      if (targetSection) {
        targetSection.items.push({
          ...this.newItem,
          // Ensure the icon has a default if not provided
          icon: this.newItem.icon || 'fas fa-link',
        });
      }

      // Reset the form and close the modal
      this.newItem = { title: '', url: '', icon: '' };
      this.closeModal();
    },
  },
};
</script>
