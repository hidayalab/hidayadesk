class QuranService {
  constructor() {
    this.baseUrl = 'https://api.alquran.cloud/v1';
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Get a random ayah with both Arabic text and English translation
   * @returns {Promise<Object>} Ayah data with Arabic and English text
   */
  async getRandomVerse() {
    try {
      const totalAyahs = 6236;
      const randomAyahId = Math.floor(Math.random() * totalAyahs) + 1;
      return await this.getVerseById(randomAyahId);
    } catch (error) {
      console.error('Error fetching random Quran verse:', error);
      throw new Error('Failed to fetch random verse');
    }
  }

  /**
   * Get a specific ayah by ID with both Arabic and English
   * @param {number} ayahId - The ayah ID (1-6236)
   * @returns {Promise<Object>} Ayah data
   */
  async getVerseById(ayahId) {
    const cacheKey = `verse_${ayahId}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      // Fetch both Arabic and English in parallel
      const [arabicResponse, englishResponse] = await Promise.all([
        fetch(`${this.baseUrl}/ayah/${ayahId}/ar.alafasy`), // Arabic with Uthmanic script
        fetch(`${this.baseUrl}/ayah/${ayahId}/en.sahih`) // English Sahih International
      ]);

      if (!arabicResponse.ok || !englishResponse.ok) {
        throw new Error('API request failed');
      }

      const [arabicData, englishData] = await Promise.all([
        arabicResponse.json(),
        englishResponse.json()
      ]);

      if (!arabicData.data || !englishData.data) {
        throw new Error('Invalid API response structure');
      }

      const verseData = {
        id: ayahId,
        arabic: {
          text: arabicData.data.text,
          surah: arabicData.data.surah.name,
          surahEnglish: arabicData.data.surah.englishName,
          surahNumber: arabicData.data.surah.number,
          ayahNumber: arabicData.data.numberInSurah,
          juz: arabicData.data.juz,
          page: arabicData.data.page
        },
        english: {
          text: englishData.data.text,
          surah: englishData.data.surah.englishName,
          surahNumber: englishData.data.surah.number,
          ayahNumber: englishData.data.numberInSurah
        },
        reference: {
          surah: englishData.data.surah.englishName,
          surahArabic: arabicData.data.surah.name,
          ayah: englishData.data.numberInSurah,
          surahNumber: englishData.data.surah.number
        }
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: verseData,
        timestamp: Date.now()
      });

      return verseData;
    } catch (error) {
      console.error('Error fetching verse by ID:', error);
      throw new Error('Failed to fetch verse data');
    }
  }

  /**
   * Get verse of the day (changes daily)
   * @returns {Promise<Object>} Verse of the day
   */
  async getVerseOfTheDay() {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );

    // Use day of year to get a consistent "verse of the day"
    const verseId = (dayOfYear % 6236) + 1;

    const cacheKey = `verse_of_day_${today.toDateString()}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached.data;
    }

    try {
      const verseData = await this.getVerseById(verseId);

      this.cache.set(cacheKey, {
        data: verseData,
        timestamp: Date.now()
      });

      return verseData;
    } catch (error) {
      console.error('Error fetching verse of the day:', error);
      throw new Error('Failed to fetch verse of the day');
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default new QuranService();