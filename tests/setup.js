import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global test setup for Faith-Note

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key) => {
    const storage = {
      'faith-note-config': JSON.stringify({
        theme: 'cyber-glow',
        layout: 'grid',
        widgets: {
          prayer: true,
          quran: true,
          notes: false
        }
      }),
      'faith-note-bookmarks': JSON.stringify([
        {
          id: 1,
          title: 'GitHub',
          url: 'https://github.com',
          icon: 'fab fa-github',
          section: 'Development'
        }
      ])
    }
    return storage[key] || null
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock Notification API for Prayer Times
global.Notification = {
  requestPermission: vi.fn(() => Promise.resolve('granted')),
  permission: 'granted'
}

// Mock Geolocation API for Qibla direction
global.navigator.geolocation = {
  getCurrentPosition: vi.fn((success, error) => {
    success({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 100
      }
    })
  }),
  watchPosition: vi.fn()
}

// Mock IntersectionObserver for lazy loading
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}))

// Mock ResizeObserver for responsive components
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}))

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock CSS.supports for theme compatibility
global.CSS = {
  supports: vi.fn(() => true)
}

// Mock HTMLCanvasElement for Qibla compass
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  arc: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  fillText: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  clearRect: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 }))
}))

// Setup default fetch mock
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200
  })
)

// Helper function to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
}