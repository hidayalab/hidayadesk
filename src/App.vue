<template>
  <div id="app" class="container-fluid" :class="[selectedTheme, selectedLayout, selectedCardSize]">
    <header class="header">
      <div class="logo-and-title">
        <h1 class="title">{{ pageInfo.title }}</h1>
      </div>
      <div class="controls">
        <div class="theme-selector">
          <label for="theme-select">Theme:</label>
          <select id="theme-select" v-model="selectedTheme">
            <option v-for="theme in themes" :key="theme.name" :value="theme.value">{{ theme.name }}</option>
          </select>
        </div>
        <div class="layout-selector">
          <label for="layout-select">Layout:</label>
          <select id="layout-select" v-model="selectedLayout">
            <option v-for="layout in layouts" :key="layout.name" :value="layout.value">{{ layout.name }}</option>
          </select>
        </div>
        <div class="card-size-selector">
          <label for="card-size-select">Card Size:</label>
          <select id="card-size-select" v-model="selectedCardSize">
            <option v-for="size in cardSizes" :key="size.name" :value="size.value">{{ size.name }}</option>
          </select>
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
      <div class="quran-widget">
        <h3>Random Quran Verse</h3>
        <p class="verse-text">{{ quranVerse.text }}</p>
        <p class="verse-meaning">{{ quranVerse.meaning }}</p>
        <p class="verse-info">- {{ quranVerse.sura }}:{{ quranVerse.aya }}</p>
      </div>
    </main>
  </div>
</template>

<script>
import yaml from 'js-yaml';

export default {
  data() {
    return {
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
        
        
        
        
        { name: 'Glow', value: 'Glow' },
        { name: 'Card', value: 'Card' },
        { name: 'Fire', value: 'Fire' },
        { name: 'Minimal Squares', value: 'minimal-squares' },
        { name: 'MonoFire', value: 'MonoFire' },
        { name: 'Square', value: 'Square' },
      ],
      layouts: [
        { name: 'Two Column', value: 'layout-two-column' },
        { name: 'Three Column', value: 'layout-three-column' },
        { name: 'Single Column', value: 'layout-compact' },
      ],
      cardSizes: [
        { name: 'Small', value: 'card-size-small' },
        { name: 'Medium', value: 'card-size-medium' },
        { name: 'Large', value: 'card-size-large' },
        { name: 'List', value: 'card-size-list' },
      ],
      selectedTheme: 'dashy-dark',
      selectedLayout: 'layout-three-column',
      selectedCardSize: 'card-size-medium',
    };
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
  },
};
</script>
