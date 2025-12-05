/**
 * useMediaQuery.js
 * Reactive media query tracking composable for Vue 3
 * Provides real-time tracking of media query state changes
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Track a media query and return its current match state
 * @param {string} query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns {Ref<boolean>} - Reactive boolean indicating if query matches
 */
export function useMediaQuery(query) {
  const matches = ref(false)
  let mediaQuery = null

  const updateMatches = (e) => {
    matches.value = e.matches
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches

    // Use addEventListener for better support (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMatches)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(updateMatches)
    }
  })

  onUnmounted(() => {
    if (!mediaQuery) return

    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', updateMatches)
    } else {
      mediaQuery.removeListener(updateMatches)
    }
  })

  return matches
}
