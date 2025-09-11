/**
 * Theme Service - Loads theme data from JSON files
 * Provides centralized theme management for the application
 */

// Theme configuration - centralized list of available themes
const THEME_CONFIG = [
  { id: 'CyberGlow', file: 'cyber-glow.json', featured: true },
  { id: 'Fire', file: 'fire.json', featured: true },
  { id: 'Glow', file: 'glow.json', featured: true },
  { id: 'slate', file: 'slate.json', featured: false },
  { id: 'MonoFire', file: 'mono-fire.json', featured: false },
  { id: 'Square', file: 'square.json', featured: false }
]

class ThemeService {
  constructor() {
    this.themes = new Map()
    this.isLoaded = false
    this.themeConfig = THEME_CONFIG // Reference to theme configuration
  }

  /**
   * Get available theme configurations
   * @returns {Array} Array of theme configuration objects
   */
  getThemeConfig() {
    return this.themeConfig
  }

  /**
   * Add a new theme configuration (for dynamic theme addition)
   * @param {Object} themeConfig - Theme configuration object
   */
  addThemeConfig(themeConfig) {
    if (!themeConfig.id || !themeConfig.file) {
      throw new Error('Theme configuration must have id and file properties')
    }
    this.themeConfig.push(themeConfig)
  }

  /**
   * Remove a theme configuration
   * @param {string} themeId - Theme ID to remove
   */
  removeThemeConfig(themeId) {
    const index = this.themeConfig.findIndex(config => config.id === themeId)
    if (index > -1) {
      this.themeConfig.splice(index, 1)
      this.themes.delete(themeId)
    }
  }

  /**
   * Load all themes from JSON files
   * @returns {Promise<Array>} Array of theme objects
   */
  async loadThemes() {

    try {
      // Load each individual theme file
      const themePromises = this.themeConfig.map(async (themeInfo) => {
        try {
          const themeResponse = await fetch(`${import.meta.env.BASE_URL}themes/${themeInfo.file}`)
          if (!themeResponse.ok) {
            console.warn(`Failed to load theme ${themeInfo.id}: ${themeResponse.statusText}`)
            return null
          }
          
          const themeData = await themeResponse.json()
          // Ensure the theme has required properties
          const theme = {
            ...themeData,
            featured: themeInfo.featured
          }
          
          this.themes.set(themeInfo.id, theme)
          return theme
        } catch (error) {
          console.warn(`Error loading theme ${themeInfo.id}:`, error)
          return null
        }
      })
      
      const loadedThemes = await Promise.all(themePromises)
      this.isLoaded = true
      
      // Filter out null themes (failed to load) and return successful ones
      return loadedThemes.filter(Boolean)
    } catch (error) {
      console.error('Failed to load themes:', error)
      this.isLoaded = false
      
      // Return fallback hardcoded themes if JSON loading fails
      return this.getFallbackThemes()
    }
  }

  /**
   * Get theme by ID
   * @param {string} themeId - Theme identifier
   * @returns {Object|null} Theme object or null if not found
   */
  getTheme(themeId) {
    return this.themes.get(themeId) || null
  }

  /**
   * Get all loaded themes
   * @returns {Array} Array of theme objects
   */
  getAllThemes() {
    return Array.from(this.themes.values())
  }

  /**
   * Get featured themes
   * @returns {Array} Array of featured theme objects
   */
  getFeaturedThemes() {
    return this.getAllThemes().filter(theme => theme.featured)
  }

  /**
   * Check if themes are loaded
   * @returns {boolean} True if themes are loaded
   */
  isThemesLoaded() {
    return this.isLoaded
  }

  /**
   * Fallback themes in case JSON loading fails
   * @returns {Array} Array of fallback theme objects
   */
  getFallbackThemes() {
    return [
      { id: 'CyberGlow', name: 'CyberGlow', displayName: 'Cyber Glow', description: 'Futuristic cyan glow effects', icon: 'fas fa-eye', color: '#0ff', featured: true },
      { id: 'Fire', name: 'Fire', displayName: 'Fire', description: 'Warm orange and red tones', icon: 'fas fa-fire', color: '#ff6347', featured: true },
      { id: 'Glow', name: 'Glow', displayName: 'Glow', description: 'Vibrant green illumination', icon: 'fas fa-lightbulb', color: '#0f0', featured: true },
      { id: 'slate', name: 'Slate', displayName: 'Slate', description: 'Professional gray palette', icon: 'fas fa-square', color: '#fff', featured: false },
      { id: 'MonoFire', name: 'MonoFire', displayName: 'Mono Fire', description: 'Classic black and white', icon: 'fas fa-fire-alt', color: '#fff', featured: false },
      { id: 'Square', name: 'Square', displayName: 'Square', description: 'Clean minimal design', icon: 'fas fa-th-large', color: '#1a1a1a', featured: false }
    ]
  }

  /**
   * Apply theme CSS variables to the document root
   * @param {string} themeId - Theme ID to apply
   * @returns {boolean} True if theme was applied successfully
   */
  applyTheme(themeId) {
    const theme = this.getTheme(themeId)
    if (!theme || !theme.variables) {
      console.warn(`Theme ${themeId} not found or has no variables`)
      return false
    }

    const root = document.documentElement
    
    // Apply all CSS variables from the theme to the root element
    Object.entries(theme.variables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
    
    console.log(`Applied theme: ${theme.displayName || theme.name}`)
    return true
  }

  /**
   * Remove theme CSS variables and restore defaults
   * @param {string} themeId - Theme ID to remove (optional, removes all theme variables if not specified)
   */
  removeTheme(themeId = null) {
    const root = document.documentElement
    
    if (themeId) {
      const theme = this.getTheme(themeId)
      if (theme && theme.variables) {
        // Remove specific theme variables
        Object.keys(theme.variables).forEach(property => {
          root.style.removeProperty(property)
        })
      }
    } else {
      // Remove all theme variables from all themes
      this.getAllThemes().forEach(theme => {
        if (theme.variables) {
          Object.keys(theme.variables).forEach(property => {
            root.style.removeProperty(property)
          })
        }
      })
    }
  }

  /**
   * Get all CSS variables for a theme
   * @param {string} themeId - Theme ID
   * @returns {Object|null} Object containing CSS variables or null if theme not found
   */
  getThemeVariables(themeId) {
    const theme = this.getTheme(themeId)
    return theme?.variables || null
  }

  /**
   * Convert theme data to the format expected by App.vue
   * @param {Array} themes - Array of theme objects from JSON
   * @returns {Array} Array of themes in App.vue format
   */
  convertToAppFormat(themes) {
    return themes.map(theme => ({
      name: theme.displayName || theme.name,
      value: theme.id,
      icon: theme.icon || 'fas fa-paint-brush',
      color: theme.color || '#ffffff'
    }))
  }
}

// Create a singleton instance
const themeService = new ThemeService()

export default themeService