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

  onMounted(() => {
    const element = elementRef?.value || elementRef
    if (!element) {
      console.warn('useTouchGestures: No element provided')
      return
    }

    // Add touch event listeners with passive flag for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true })
  })

  onUnmounted(() => {
    const element = elementRef?.value || elementRef
    if (!element) return

    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchcancel', handleTouchCancel)

    // Clean up timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }
  })

  return {
    touchStartX,
    touchStartY,
    touchEndX,
    touchEndY,
    isSwiping
  }
}
