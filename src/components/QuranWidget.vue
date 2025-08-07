<template>
  <div class="quran-widget">
    <h3>Random Quran Verse</h3>
    <p class="verse-text">{{ quranVerse.text }}</p>
    <p class="verse-meaning">{{ quranVerse.meaning }}</p>
    <p class="verse-info">- {{ quranVerse.sura }}:{{ quranVerse.aya }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      quranVerse: {
        text: '',
        meaning: '',
        sura: '',
        aya: ''
      },
    };
  },
  mounted() {
    this.fetchRandomQuranVerse();
  },
  methods: {
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
  },
};
</script>

<style scoped>
@import './styles/quranwidget.css';
</style>
