/**
 * useTouchGestures.js
 * Touch gesture handling composable for Vue 3
 * Supports swipe gestures and long-press detection
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Add touch gesture support to an element
 * @param {Ref|HTMLElement} elementRef - Vue ref or DOM element to attach gestures
 * @param {Object} options - Configuration options
 * @returns {Object} Touch state properties
 */
export function useTouchGestures(elementRef, options = {}) {
  const {
    threshold = 50,              // Minimum distance for swipe detection (pixels)
    onSwipeLeft,                 // Callback for left swipe
    onSwipeRight,                // Callback for right swipe
    onSwipeUp,                   // Callback for up swipe
    onSwipeDown,                 // Callback for down swipe
    onLongPress,                 // Callback for long press
    longPressDuration = 500,     // Duration for long press (ms)
    preventScroll = false        // Whether to prevent default scroll behavior
  } = options

  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchEndX = ref(0)
  const touchEndY = ref(0)
  const touchStartTime = ref(0)
  const isSwiping = ref(false)

  let longPressTimer = null
  let isSetup = false

  const handleTouchStart = (e) => {
    const touch = e.changedTouches[0]
    touchStartX.value = touch.screenX
    touchStartY.value = touch.screenY
    touchStartTime.value = Date.now()
    isSwiping.value = false

    // Long press detection
    if (onLongPress) {
      longPressTimer = setTimeout(() => {
        onLongPress(e)
      }, longPressDuration)
    }
  }

  const handleTouchMove = (e) => {
    // Cancel long press if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    isSwiping.value = true

    // Optionally prevent scroll during swipe
    if (preventScroll) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    const touch = e.changedTouches[0]
    touchEndX.value = touch.screenX
    touchEndY.value = touch.screenY

    const deltaX = touchStartX.value - touchEndX.value
    const deltaY = touchStartY.value - touchEndY.value
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Only process if movement exceeds threshold
    if (Math.max(absDeltaX, absDeltaY) > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe (prioritize horizontal if both are similar)
        if (deltaX > 0) {
          onSwipeLeft?.(e, { deltaX, deltaY })
        } else {
          onSwipeRight?.(e, { deltaX, deltaY })
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeUp?.(e, { deltaX, deltaY })
        } else {
          onSwipeDown?.(e, { deltaX, deltaY })
        }
      }
    }

    isSwiping.value = false
  }

  const handleTouchCancel = () => {
    // Clean up on touch cancel
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    isSwiping.value = false
  }

  /**
   * Manual cleanup function to remove all event listeners
   * Call this when you need to clean up gestures manually (e.g., in a watch)
   */
  const cleanup = () => {
    const element = elementRef?.value || elementRef
    if (!element || !isSetup) return

    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchcancel', handleTouchCancel)

    // Clean up timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    isSetup = false
  }

  /**
   * Setup function to add event listeners
   * Can be called manually or will be called automatically in onMounted
   */
  const setup = () => {
    const element = elementRef?.value || elementRef
    if (!element) {
      console.warn('useTouchGestures: No element provided')
      return
    }

    // Don't setup twice
    if (isSetup) {
      cleanup()
    }

    // Add touch event listeners with passive flag for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    isSetup = true
  }

  // Auto-setup in mounted if used within a component
  onMounted(() => {
    setup()
  })

  // Auto-cleanup in unmounted if used within a component
  onUnmounted(() => {
    cleanup()
  })

  // If called outside component lifecycle (e.g., in watch), setup immediately
  if (typeof window !== 'undefined') {
    const element = elementRef?.value || elementRef
    if (element && !isSetup) {
      // Use setTimeout to allow for immediate ref resolution
      setTimeout(() => {
        if (!isSetup) {
          setup()
        }
      }, 0)
    }
  }

  return {
    touchStartX,
    touchStartY,
    touchEndX,
    touchEndY,
    isSwiping,
    cleanup,
    setup
  }
}
