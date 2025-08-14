class HadithService {
  constructor() {
    this.baseUrl = 'https://hadithapi.com/api';
    this.apiKey = '$2y$10$G0llMifp1VYjeaQjaU65HOWkSwTJCQebyIGTvh9clrB8qHpDlm'; // Working API key
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    
    // Initialize API key from environment or localStorage
    this.initializeApiKey();
  }

  initializeApiKey() {
    // First try environment variable
    const envApiKey = import.meta.env.VITE_HADITH_API_KEY;
    console.log('🔑 Environment API Key:', envApiKey ? `${envApiKey.substring(0, 10)}...` : 'Not found');
    
    if (envApiKey && envApiKey !== 'your_api_key_here') {
      this.apiKey = envApiKey;
      console.log('✅ Using environment API key');
      return;
    }
    
    // Fallback to localStorage (user-provided)
    const storedApiKey = localStorage.getItem('hadithApiKey');
    console.log('🔑 Stored API Key:', storedApiKey ? `${storedApiKey.substring(0, 10)}...` : 'Not found');
    
    if (storedApiKey) {
      this.apiKey = storedApiKey;
      console.log('✅ Using stored API key');
    } else {
      // Use the working API key as fallback
      console.log('✅ Using fallback API key');
    }
  }

  setApiKey(apiKey) {
    console.log('💾 Setting API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Clearing key');
    this.apiKey = apiKey;
    // Save to localStorage for persistence
    if (apiKey) {
      localStorage.setItem('hadithApiKey', apiKey);
      console.log('✅ API Key saved to localStorage');
    } else {
      localStorage.removeItem('hadithApiKey');
      console.log('🗑️ API Key cleared from localStorage');
    }
  }

  getApiKey() {
    if (!this.apiKey) {
      this.initializeApiKey();
    }
    return this.apiKey;
  }

  buildUrl(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key as query parameter - REQUIRED for HadithAPI.com
    const apiKey = this.getApiKey() || '$2y$10$G0llMifp1VYjeaQjaU65HOWkSwTJCQebyIGTvh9clrB8qHpDlm';
    if (apiKey) {
      url.searchParams.append('apiKey', apiKey);
    }
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });
    
    return url.toString();
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  async fetchBooks() {
    const cacheKey = 'books';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = {
        apiKey: this.getApiKey() || '$2y$10$G0llMifp1VYjeaQjaU65HOWkSwTJCQebyIGTvh9clrB8qHpDlm'
      };
      
      const url = new URL(`${this.baseUrl}/books`);
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value.toString());
      });
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Books API Error:', errorText);
        
        // Return popular books as fallback
        return {
          status: 200,
          books: this.getPopularBooks()
        };
      }
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching hadith books:', error);
      // Return popular books as fallback
      return {
        status: 200,
        books: this.getPopularBooks()
      };
    }
  }

  async fetchRandomHadith(bookSlug = null) {
    try {
      const params = {
        apiKey: this.getApiKey() || '$2y$10$G0llMifp1VYjeaQjaU65HOWkSwTJCQebyIGTvh9clrB8qHpDlm'
      };
      
      // Add book filter if specified
      if (bookSlug) {
        const apiBookName = this.getApiBookName(bookSlug);
        if (apiBookName && apiBookName !== bookSlug) {
          params.book = apiBookName;
        }
      }
      
      // Build URL with query parameters
      const url = new URL(`${this.baseUrl}/hadiths`);
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value.toString());
      });

      console.log('📡 API Request URL:', url.toString());
      console.log('🔑 Using API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'None');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      console.log('📥 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API Error response:', errorText);
        
        // Provide more specific error messages
        if (response.status === 404) {
          throw new Error('No hadiths found. The API might be temporarily unavailable.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your API key configuration.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please wait before making another request.');
        }
        
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response data structure:', {
        status: data.status,
        message: data.message,
        hasHadiths: !!data.hadiths,
        dataCount: data.hadiths?.data?.length || 0
      });
      
      // Handle the actual API response format
      if (data && data.status === 200 && data.hadiths && data.hadiths.data && data.hadiths.data.length > 0) {
        // Get a random hadith from the returned data
        const randomIndex = Math.floor(Math.random() * data.hadiths.data.length);
        const selectedHadith = data.hadiths.data[randomIndex];
        
        // Return the data in the format expected by the HadithWidget component
        return {
          status: data.status,
          message: data.message,
          hadiths: {
            data: [selectedHadith], // Component expects hadiths.data array
            current_page: data.hadiths.current_page,
            total: data.hadiths.total
          },
          // Also provide direct access for convenience
          data: selectedHadith
        };
      }
      
      throw new Error('No hadith data found in API response');
    } catch (error) {
      console.error('Error fetching random hadith:', error);
      throw error;
    }
  }

  async fetchDailyHadith(bookSlug = null, seed = null) {
    try {
      // For daily hadith, we fetch a limited set and use seed for consistent selection
      const params = {
        paginate: 10 // Get 10 hadiths to choose from
      };
      
      if (bookSlug) {
        params.book = bookSlug;
      }

      const url = this.buildUrl('/hadiths/', params);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch daily hadith (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      // Use seed to get consistent daily hadith
      if (data && data.status === 200 && data.hadiths && data.hadiths.data && data.hadiths.data.length > 0) {
        const seedValue = seed || new Date().toDateString(); // Use date as seed
        const hashCode = this.simpleHash(seedValue);
        const index = Math.abs(hashCode) % data.hadiths.data.length;
        const selectedHadith = data.hadiths.data[index];
        
        // Return the data in the format expected by the HadithWidget component
        return {
          status: data.status,
          message: data.message,
          hadiths: {
            data: [selectedHadith], // Component expects hadiths.data array
            current_page: data.hadiths.current_page,
            total: data.hadiths.total
          },
          // Also provide direct access for convenience
          data: selectedHadith
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching daily hadith:', error);
      throw error;
    }
  }
  
  // Simple hash function for consistent daily selection
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  async fetchHadithsByBook(bookSlug, page = 1, limit = 10) {
    const cacheKey = `hadiths-${bookSlug}-${page}-${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = {
        book: this.getApiBookName(bookSlug), // Use proper API book name
        paginate: limit
      };
      
      // HadithAPI.com might not support traditional pagination, using paginate instead
      if (page > 1) {
        params.offset = (page - 1) * limit;
      }

      const url = this.buildUrl('/hadiths/', params);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch hadiths by book (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching hadiths by book:', error);
      throw error;
    }
  }

  async fetchHadithByNumber(bookSlug, hadithNumber) {
    const cacheKey = `hadith-${bookSlug}-${hadithNumber}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = this.buildUrl(`/books/${bookSlug}/hadiths/${hadithNumber}`);
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching specific hadith:', error);
      throw error;
    }
  }

  async searchHadiths(query, bookSlug = null, page = 1, limit = 10) {
    try {
      const params = {
        query: query,
        page: page,
        limit: limit
      };

      if (bookSlug) {
        params.book = bookSlug;
      }

      const url = this.buildUrl('/hadiths/search', params);
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching hadiths:', error);
      throw error;
    }
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Popular hadith book names for HadithAPI.com
  getPopularBooks() {
    return [
      { id: 1, slug: 'sahih-bukhari', name: 'Sahih Bukhari', bookName: 'Sahih Bukhari', writerName: 'Imam Bukhari', bookSlug: 'sahih-bukhari' },
      { id: 2, slug: 'sahih-muslim', name: 'Sahih Muslim', bookName: 'Sahih Muslim', writerName: 'Imam Muslim', bookSlug: 'sahih-muslim' },
      { id: 3, slug: 'sunan-abu-dawood', name: 'Sunan Abu Dawood', bookName: 'Sunan Abu Dawood', writerName: 'Imam Abu Dawood', bookSlug: 'sunan-abu-dawood' },
      { id: 4, slug: 'jami-at-tirmidhi', name: 'Jami at-Tirmidhi', bookName: 'Jami at-Tirmidhi', writerName: 'Imam Tirmidhi', bookSlug: 'jami-at-tirmidhi' },
      { id: 5, slug: 'sunan-an-nasai', name: 'Sunan an-Nasa\'i', bookName: 'Sunan an-Nasa\'i', writerName: 'Imam Nasa\'i', bookSlug: 'sunan-an-nasai' },
      { id: 6, slug: 'sunan-ibn-majah', name: 'Sunan Ibn Majah', bookName: 'Sunan Ibn Majah', writerName: 'Imam Ibn Majah', bookSlug: 'sunan-ibn-majah' }
    ];
  }
  
  // Convert slug to API book name - HadithAPI.com seems to use book slugs directly
  getApiBookName(bookSlug) {
    // Based on the API response, it seems to use bookSlug directly
    // The API response shows "bookSlug":"sahih-bukhari"
    return bookSlug;
  }
}

export default new HadithService();