<template>
  <div id="app" class="container-fluid" :class="[selectedTheme, selectedLayout, selectedCardSize]">
    <header class="header">
      <div class="logo-and-title">
        <h1 class="title">{{ pageInfo.title }}</h1>
      </div>
      <div class="controls">
        <div class="search-bar">
          <i class="fas fa-search search-icon"></i>
          <input type="text" v-model="searchQuery" placeholder="Search...">
        </div>
        <div class="theme-selector custom-dropdown">
          <label>Theme:</label>
          <div class="selected-option" @click="toggleDropdown('theme')">
            <i :class="['icon', currentThemeIcon]" :style="{ color: currentThemeColor }"></i>
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
            <div v-for="layout in layouts" :key="layout.name" class="layout-icon"
              :class="{ 'selected': selectedLayout === layout.value }" @click="selectOption('layout', layout.value)">
              <i :class="['icon', layout.icon]"></i>
            </div>
          </div>
        </div>
        <div class="card-size-selector">
          <label>Card Size</label>
          <div class="layout-icons">
            <div v-for="size in cardSizes" :key="size.name" class="layout-icon"
              :class="{ 'selected': selectedCardSize === size.value }" @click="selectOption('cardSize', size.value)">
              <i :class="['icon', size.icon]"></i>
            </div>
          </div>
        </div>

        <div class="widget-selector">
          <label>Widget</label>
          <div class="widget-toggle">
          <button @click="activeWidget = 'quran'" :class="{ 'selected': activeWidget === 'quran' }">Quran Verse</button>
          <button @click="activeWidget = 'notes'" :class="{ 'selected': activeWidget === 'notes' }">Notes</button>
          
          <button @click="activeWidget = 'prayer'" :class="{ 'selected': activeWidget === 'prayer' }">Prayer</button>
        </div>
        </div>

        <nav class="nav-links">
          <a v-for="link in pageInfo.navLinks" :key="link.title" :href="link.path" target="_blank">{{ link.title }}</a>
        </nav>
      </div>
    </header>
    <main class="dashboard-grid">
      <div class="bookmark-area">
        <Bookmarks :sections="sections" :search-query="searchQuery" />

      </div>
      <div class="widget-area">
        <quran-widget v-if="activeWidget === 'quran'"></quran-widget>
        <note-taking-widget v-if="activeWidget === 'notes'" :theme="selectedTheme"></note-taking-widget>
        
        <prayer-time-widget v-if="activeWidget === 'prayer'" :location="location"></prayer-time-widget>
      </div>
    </main>


  </div>
</template>

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
import './components/styles/notetakingwidget.css';
import './components/styles/quranwidget.css';

export default {
  components: {
    NoteTakingWidget,
    QuranWidget,
    Bookmarks,
    PrayerTimeWidget
  },

  data() {
    return {
      activeWidget: 'quran', // or 'notes',
      location: null,
      searchQuery: '',
      pageInfo: {},
      appConfig: {},
      sections: [],
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
  },
  mounted() {
    this.fetchConfig();
    this.selectedTheme = localStorage.getItem('selectedTheme') || this.selectedTheme;
    this.selectedLayout = localStorage.getItem('selectedLayout') || this.selectedLayout;
    this.selectedCardSize = localStorage.getItem('selectedCardSize') || this.selectedCardSize;
    this.getLocation();
  },
  methods: {
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    },
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
    }
  },
};
</script>
