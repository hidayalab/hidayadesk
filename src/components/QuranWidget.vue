<template>
  <div class="quran-widget">
    <!-- Header -->
    <div class="quran-widget-header">
      <div class="widget-title-row">
        <h3>{{ widgetTitle }}</h3>
      </div>
      
      <div class="verse-controls-row">
        <div class="verse-controls">
          <button 
            @click="fetchRandomVerse" 
            class="control-btn"
            :class="{ active: mode === 'random' }"
            :disabled="loading"
            title="Get Random Verse"
          >
            🎲 Random
          </button>
          <button 
            @click="fetchVerseOfTheDay" 
            class="control-btn"
            :class="{ active: mode === 'daily' }"
            :disabled="loading"
            title="Verse of the Day"
          >
            ⭐ Daily
          </button>
        </div>
      </div>

      <div class="font-selector-row">
        <label class="font-selector-label">Arabic Font</label>
        <select 
          v-model="selectedArabicFont" 
          class="font-dropdown-full"
          @change="savePreferences"
          title="Select Arabic Font"
        >
          <option value="amiri">Amiri - Classical Arabic Calligraphy</option>
          <option value="noto">Noto Sans Arabic - Modern & Clean</option>
          <option value="cairo">Cairo - Contemporary Arabic</option>
          <option value="scheherazade">Scheherazade New - Traditional Script</option>
          <option value="uthmanic">Uthmanic - Quranic Manuscript Style</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading verse...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="retryFetch" class="retry-btn">Try Again</button>
    </div>

    <!-- Verse Content -->
    <div v-else-if="currentVerse" class="verse-content">
      <div class="verse-scroll-container">
        <!-- Arabic Text -->
        <div 
          :class="[
            'arabic-verse', 
            `font-${selectedArabicFont}`,
            getVerseLengthClass(currentVerse.arabic.text)
          ]"
          dir="rtl"
        >
          {{ currentVerse.arabic.text }}
        </div>

        <!-- English Translation -->
        <div 
          :class="[
            'english-translation',
            getVerseLengthClass(currentVerse.english.text)
          ]"
        >
          {{ currentVerse.english.text }}
        </div>
      </div>

      <!-- Static Verse Reference Footer -->
      <div class="verse-reference-footer">
        <div class="reference-text">
          Quran {{ currentVerse.reference.surahNumber }}:{{ currentVerse.reference.ayah }}
        </div>
        <div class="surah-info">
          <div class="surah-arabic">{{ currentVerse.reference.surahArabic }}</div>
          <div class="surah-english">{{ currentVerse.reference.surah }}</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="loading-state">
      <p class="loading-text">No verse loaded</p>
    </div>
  </div>
</template>

<script>
import quranService from '../services/quranService.js'

export default {
  name: 'QuranWidget',
  data() {
    return {
      currentVerse: null,
      loading: false,
      error: null,
      mode: 'random', // 'random' or 'daily'
      selectedArabicFont: 'amiri',
      lastFetchTime: null,
      retryCount: 0,
      maxRetries: 3
    }
  },
  computed: {
    widgetTitle() {
      switch (this.mode) {
        case 'daily':
          return 'Daily Quran Verse'
        case 'random':
        default:
          return 'Random Quran Verse'
      }
    }
  },
  mounted() {
    this.loadPreferences()
    this.initializeWidget()
  },
  methods: {
    async initializeWidget() {
      // Load verse based on current mode
      if (this.mode === 'daily') {
        await this.fetchVerseOfTheDay()
      } else {
        await this.fetchRandomVerse()
      }
    },

    async fetchRandomVerse() {
      if (this.loading) return
      
      this.loading = true
      this.error = null
      this.mode = 'random'
      
      try {
        const verse = await quranService.getRandomVerse()
        this.currentVerse = verse
        this.lastFetchTime = Date.now()
        this.retryCount = 0
        this.savePreferences()
      } catch (error) {
        console.error('Error fetching random verse:', error)
        this.handleFetchError('Failed to fetch random verse')
      } finally {
        this.loading = false
      }
    },

    async fetchVerseOfTheDay() {
      if (this.loading) return
      
      this.loading = true
      this.error = null
      this.mode = 'daily'
      
      try {
        const verse = await quranService.getVerseOfTheDay()
        this.currentVerse = verse
        this.lastFetchTime = Date.now()
        this.retryCount = 0
        this.savePreferences()
      } catch (error) {
        console.error('Error fetching verse of the day:', error)
        this.handleFetchError('Failed to fetch verse of the day')
      } finally {
        this.loading = false
      }
    },

    async fetchSpecificVerse(ayahId) {
      if (this.loading) return
      
      this.loading = true
      this.error = null
      
      try {
        const verse = await quranService.getVerseById(ayahId)
        this.currentVerse = verse
        this.lastFetchTime = Date.now()
        this.retryCount = 0
      } catch (error) {
        console.error(`Error fetching verse ${ayahId}:`, error)
        this.handleFetchError(`Failed to fetch verse ${ayahId}`)
      } finally {
        this.loading = false
      }
    },

    handleFetchError(message) {
      this.error = message
      this.retryCount++
      
      // If we've reached max retries, show a more helpful error
      if (this.retryCount >= this.maxRetries) {
        this.error = 'Please check your internet connection and try again later.'
      }
    },

    async retryFetch() {
      this.error = null
      
      if (this.mode === 'daily') {
        await this.fetchVerseOfTheDay()
      } else {
        await this.fetchRandomVerse()
      }
    },

    toggleMode() {
      if (this.mode === 'random') {
        this.fetchVerseOfTheDay()
      } else {
        this.fetchRandomVerse()
      }
    },

    savePreferences() {
      const preferences = {
        mode: this.mode,
        selectedArabicFont: this.selectedArabicFont,
        lastVerse: this.currentVerse,
        lastFetchTime: this.lastFetchTime
      }
      
      localStorage.setItem('quranWidgetPreferences', JSON.stringify(preferences))
    },

    loadPreferences() {
      try {
        const saved = localStorage.getItem('quranWidgetPreferences')
        if (saved) {
          const preferences = JSON.parse(saved)
          
          this.mode = preferences.mode || 'random'
          this.selectedArabicFont = preferences.selectedArabicFont || 'amiri'
          
          // Load cached verse if it's from today (for daily mode) or recent (for random mode)
          if (preferences.lastVerse && preferences.lastFetchTime) {
            const timeDiff = Date.now() - preferences.lastFetchTime
            const isRecent = timeDiff < (30 * 60 * 1000) // 30 minutes
            const isToday = new Date(preferences.lastFetchTime).toDateString() === new Date().toDateString()
            
            if ((this.mode === 'daily' && isToday) || (this.mode === 'random' && isRecent)) {
              this.currentVerse = preferences.lastVerse
              this.lastFetchTime = preferences.lastFetchTime
            }
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
        // Reset to defaults if there's an error
        this.mode = 'random'
        this.selectedArabicFont = 'amiri'
      }
    },

    // Utility method to get cache statistics (for debugging)
    getCacheInfo() {
      return quranService.getCacheStats()
    },

    // Method to clear service cache if needed
    clearCache() {
      quranService.clearCache()
    },

    // Dynamic text sizing based on content length
    getVerseLengthClass(text) {
      if (!text) return ''
      
      const length = text.length
      
      if (length > 400) {
        return 'very-long-verse'
      } else if (length > 200) {
        return 'long-verse'
      }
      
      return ''
    }
  },

  // Cleanup on component destruction
  beforeUnmount() {
    this.savePreferences()
  },

  // Watch for font changes and update preferences
  watch: {
    selectedArabicFont() {
      this.savePreferences()
    }
  }
}
</script>

<style scoped>
@import './styles/quranwidget.css';
</style>
