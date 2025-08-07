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
          </ul>
        </div>
      </div>
      <div class="widget-area">
        <div v-if="activeWidget === 'quran'" class="quran-widget">
          <h3>Random Quran Verse</h3>
          <p class="verse-text">{{ quranVerse.text }}</p>
          <p class="verse-meaning">{{ quranVerse.meaning }}</p>
          <p class="verse-info">- {{ quranVerse.sura }}:{{ quranVerse.aya }}</p>
        </div>
        <note-taking-widget v-if="activeWidget === 'notes'"></note-taking-widget>
      </div>
    </main>
  </div>
</template>

<script>
import yaml from 'js-yaml';
import NoteTakingWidget from './components/NoteTakingWidget.vue';
import './components/styles/quranwidget.css';

export default {
  components: {
    NoteTakingWidget,
  },
  data() {
    return {
      activeWidget: 'quran', // or 'notes'
      pageInfo: {},
      appConfig: {},
      sections: [],
      currentTime: new Date().toLocaleTimeString(),
      currentDate: new Date().toLocaleDateString(),
      quranVerse: {
        text: '',
        meaning: '',
        sura: '',
        aya: ''
      },
      themes: [
        { name: 'Glow', value: 'Glow', icon: 'fas fa-lightbulb', color: '#0f0' },
        { name: 'Card', value: 'Card', icon: 'fas fa-credit-card', color: '#0ff' },
        { name: 'Fire', value: 'Fire', icon: 'fas fa-fire', color: '#ff6347' },
        { name: 'Minimal Squares', value: 'minimal-squares', icon: 'fas fa-square', color: '#fff' },
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
    this.fetchRandomQuranVerse();
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
      this.currentDate = new Date().toLocaleDateString();
    }, 1000);
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
    async fetchRandomQuranVerse() {
      try {
        const totalAyahs = 6236; // Total number of ayahs in the Quran
        const randomAyahId = Math.floor(Math.random() * totalAyahs) + 1;

        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahId}/en.sahih`);
        const data = await response.json();

        if (data.data) {
          this.quranVerse = {
            text: data.data.text,
            meaning: data.data.text, // The API returns the English translation in the 'text' field for the 'en.sahih' edition
            sura: data.data.surah.englishName,
            aya: data.data.numberInSurah
          };
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        console.error('Error fetching Quran verse:', error);
        this.quranVerse = {
          text: 'Failed to load verse.',
          meaning: 'Please check your internet connection or try again later.',
          sura: '',
          aya: ''
        };
      }
    },
    search(event) {
      const query = event.target.value;
      const searchEngine = this.sections.find(s => s.widgets?.find(w => w.type === 'search')).widgets.find(w => w.type === 'search').options.searchEngine;
      window.open(`https://www.${searchEngine}.com/search?q=${query}`, '_blank');
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
    }
  },
};
</script>
