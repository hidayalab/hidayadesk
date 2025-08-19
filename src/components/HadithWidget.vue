<template>
  <div class="hadith-widget">
    <div class="hadith-widget-header">
      <div class="widget-title-row">
        <h3>{{ widgetTitle }}</h3>
      </div>
      
      <div class="mode-controls-row">
        <div class="mode-controls">
          <button @click="setMode('random')" class="control-btn" :class="{ 'active': mode === 'random' }" title="Random Hadith">
            🎲 Random
          </button>
          <button @click="setMode('daily')" class="control-btn" :class="{ 'active': mode === 'daily' }" title="Daily Hadith">
            ⭐ Daily
          </button>
        </div>
      </div>

    </div>
    
    <!-- <div class="api-key-input" v-show="showApiKeyInput">
      <div class="api-key-header">
        <label class="api-key-label">Hadith API Key</label>
        <button @click="toggleApiKeyInput" class="close-btn" title="Close">✕</button>
      </div>
      <input 
        type="password" 
        v-model="tempApiKey" 
        placeholder="Enter your API key from hadithapi.com"
        class="api-key-field"
        @keyup.enter="saveApiKey"
        @keyup.escape="toggleApiKeyInput"
      >
      <div class="api-key-actions">
        <button @click="saveApiKey" class="save-btn">
          ✓ Save
        </button>
        <button @click="clearApiKey" class="clear-btn">
          🗑️ Clear
        </button>
      </div>
    </div> -->
    
    <div class="hadith-content" v-if="!isLoading && currentHadith">
      <div class="hadith-text">
        <!-- <div class="hadith-arabic" v-if="currentHadith.hadithArabic">
          {{ currentHadith.hadithArabic }}
        </div> -->
        <div class="hadith-english">
          {{ currentHadith.hadithEnglish }}
        </div>
      </div>
      
      <div class="hadith-info">
        <div class="book-info">
          <strong>{{ currentHadith.book?.bookName || 'Unknown Book' }}</strong>
        </div>
        <div class="hadith-number" v-if="currentHadith.hadithNumber">
          Hadith {{ currentHadith.hadithNumber }}
        </div>
        <div class="chapter-info" v-if="currentHadith.chapter">
          Chapter: {{ currentHadith.chapter.chapterEnglish || currentHadith.chapter.chapterArabic }}
        </div>
      </div>
    </div>
    
    <div class="loading-state" v-else-if="isLoading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading hadith...</p>
    </div>
    
    <div class="error-state" v-else-if="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="loadRandomHadith" class="retry-btn">
        <i class="fas fa-redo"></i> Try Again
      </button>
    </div>
    
    <div class="empty-state" v-else>
      <i class="fas fa-book"></i>
      <p>Click refresh to load a hadith</p>
      <button @click="loadRandomHadith" class="load-btn">
        <i class="fas fa-sync-alt"></i> Load Hadith
      </button>
    </div>
  </div>
</template>

<script>
import hadithService from '../services/hadithService.js';

export default {
  name: 'HadithWidget',
  props: {
    theme: {
      type: String,
      default: 'CyberGlow'
    }
  },
  data() {
    return {
      currentHadith: null,
      isLoading: false,
      error: null,
      selectedBook: '',
      popularBooks: hadithService.getPopularBooks(),
      showApiKeyInput: false,
      tempApiKey: '',
      mode: 'random', // 'random' or 'daily'
      dailyHadithDate: null
    };
  },
  computed: {
    widgetTitle() {
      switch (this.mode) {
        case 'daily':
          return 'Daily Hadith'
        case 'random':
        default:
          return 'Random Hadith'
      }
    }
  },
  async mounted() {
    this.loadSavedSettings();
    await this.loadCurrentModeHadith();
  },
  methods: {
    toggleApiKeyInput() {
      this.showApiKeyInput = !this.showApiKeyInput;
      if (this.showApiKeyInput) {
        this.tempApiKey = hadithService.getApiKey() || '';
        // Focus the input field after it's rendered
        this.$nextTick(() => {
          const input = this.$el.querySelector('.api-key-field');
          if (input) {
            input.focus();
          }
        });
      } else {
        this.tempApiKey = '';
      }
    },
    
    // saveApiKey() {
    //   const trimmedKey = this.tempApiKey.trim();
    //   console.log('🔑 Saving API key from input:', trimmedKey ? `${trimmedKey.substring(0, 10)}...` : 'Empty');
      
    //   if (trimmedKey) {
    //     hadithService.setApiKey(trimmedKey);
    //     this.showApiKeyInput = false;
    //     this.tempApiKey = '';
    //     console.log('🔄 Reloading hadith with new API key...');
    //     // Reload hadith with new API key
    //     this.loadCurrentModeHadith();
    //   } else {
    //     console.log('❌ API key is empty, not saving');
    //   }
    // },
    
    
    loadSavedSettings() {
      const savedMode = localStorage.getItem('hadithWidgetMode');
      if (savedMode && ['random', 'daily'].includes(savedMode)) {
        this.mode = savedMode;
      }
      
      const savedBook = localStorage.getItem('hadithWidgetBook');
      if (savedBook) {
        this.selectedBook = savedBook;
      }
    },

    saveSettings() {
      localStorage.setItem('hadithWidgetMode', this.mode);
      localStorage.setItem('hadithWidgetBook', this.selectedBook);
    },

    setMode(newMode) {
      this.mode = newMode;
      this.saveSettings();
      this.loadCurrentModeHadith();
    },

    async loadCurrentModeHadith() {
      this.saveSettings();
      if (this.mode === 'daily') {
        await this.loadDailyHadith();
      } else {
        await this.loadRandomHadith();
      }
    },

    async loadRandomHadith() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await hadithService.fetchRandomHadith(this.selectedBook || null);
        
        if (response && response.hadiths && response.hadiths.data && response.hadiths.data.length > 0) {
          this.currentHadith = response.hadiths.data[0];
        } else if (response && response.data) {
          this.currentHadith = response.data;
        } else {
          throw new Error('No hadith data received');
        }
      } catch (error) {
        console.error('Error loading hadith:', error);
        this.error = 'Failed to load hadith. Please try again.';
        
        if (error.message.includes('401')) {
          this.error = 'API authentication failed. Please check your Hadith API key.';
        } else if (error.message.includes('403')) {
          this.error = 'Access forbidden. Your API key may not have proper permissions.';
        } else if (error.message.includes('429')) {
          this.error = 'Rate limit exceeded. Please wait before trying again.';
        } else if (error.message.includes('404')) {
          this.error = 'API endpoint not found. Please check the service configuration.';
        } else {
          this.error = `Failed to load hadith: ${error.message}`;
        }
      } finally {
        this.isLoading = false;
      }
    },

    async loadDailyHadith() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const today = new Date().toDateString();
        const cacheKey = `daily-hadith-${today}-${this.selectedBook || 'all'}`;
        
        // Check if we have today's hadith cached
        let dailyHadith = localStorage.getItem(cacheKey);
        
        if (dailyHadith && this.dailyHadithDate === today) {
          this.currentHadith = JSON.parse(dailyHadith);
          this.isLoading = false;
          return;
        }
        
        // Generate a seed based on the current date and selected book for consistency
        const seed = this.generateDailySeed(today, this.selectedBook);
        const response = await hadithService.fetchDailyHadith(this.selectedBook || null, seed);
        
        console.log('📦 Daily hadith response:', response);
        
        if (response && response.hadiths && response.hadiths.data && response.hadiths.data.length > 0) {
          this.currentHadith = response.hadiths.data[0];
          console.log('✅ Set daily currentHadith from hadiths.data:', this.currentHadith);
        } else if (response && response.data) {
          this.currentHadith = response.data;
          console.log('✅ Set daily currentHadith from data:', this.currentHadith);
        } else {
          console.error('❌ No valid daily hadith data in response:', response);
          throw new Error('No hadith data received');
        }
        
        // Cache today's hadith
        localStorage.setItem(cacheKey, JSON.stringify(this.currentHadith));
        this.dailyHadithDate = today;
        
        // Clean up old daily hadith cache (keep only last 7 days)
        this.cleanupDailyCache();
        
      } catch (error) {
        console.error('Error loading daily hadith:', error);
        // Fallback to random hadith if daily fails
        await this.loadRandomHadith();
      } finally {
        this.isLoading = false;
      }
    },

    generateDailySeed(dateString, bookSlug) {
      // Create a consistent seed based on date and book for the same daily hadith
      let seed = 0;
      const str = dateString + (bookSlug || '');
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        seed = ((seed << 5) - seed) + char;
        seed = seed & seed; // Convert to 32-bit integer
      }
      return Math.abs(seed);
    },

    cleanupDailyCache() {
      const keys = Object.keys(localStorage);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      keys.forEach(key => {
        if (key.startsWith('daily-hadith-')) {
          try {
            const dateStr = key.split('-')[2];
            const cacheDate = new Date(dateStr);
            if (cacheDate < sevenDaysAgo) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Remove malformed cache keys
            localStorage.removeItem(key);
          }
        }
      });
    }
  }
};
</script>