/**
 * useViewport.js
 * Comprehensive viewport tracking composable for Vue 3
 * Provides reactive viewport dimensions and device type detection
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Track viewport dimensions and calculate device breakpoints
 * @returns {Object} Viewport properties and device type flags
 */
export function useViewport() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
  const height = ref(typeof window !== 'undefined' ? window.innerHeight : 0)

  // Device type computed properties
  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)

  // Orientation computed properties
  const isPortrait = computed(() => height.value > width.value)
  const isLandscape = computed(() => width.value > height.value)

  // Specific breakpoint flags
  const isSmallMobile = computed(() => width.value < 375)
  const isMobileLandscape = computed(() => width.value >= 640 && width.value < 768)
  const isTabletPortrait = computed(() => width.value >= 768 && width.value < 1024 && isPortrait.value)
  const isTabletLandscape = computed(() => width.value >= 1024 && width.value < 1280)

  // Breakpoint name for easy switching
  const breakpoint = computed(() => {
    if (width.value < 375) return 'xs'
    if (width.value < 640) return 'mobile'
    if (width.value < 768) return 'mobile-lg'
    if (width.value < 1024) return 'tablet'
    if (width.value < 1280) return 'desktop'
    if (width.value < 1536) return 'desktop-lg'
    return 'desktop-xl'
  })

  const updateDimensions = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    updateDimensions()

    // Listen to both resize and orientation change events
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('orientationchange', updateDimensions)
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return

    window.removeEventListener('resize', updateDimensions)
    window.removeEventListener('orientationchange', updateDimensions)
  })

  return {
    // Raw dimensions
    width,
    height,

    // Device types
    isMobile,
    isTablet,
    isDesktop,

    // Orientation
    isPortrait,
    isLandscape,

    // Specific breakpoints
    isSmallMobile,
    isMobileLandscape,
    isTabletPortrait,
    isTabletLandscape,

    // Breakpoint name
    breakpoint
  }
}
