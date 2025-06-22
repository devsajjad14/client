// utils/url.ts

/**
 * Safely gets the current origin (protocol + host) without trailing slashes
 * - Handles SSR/SSG by returning empty string
 * - Normalizes all edge cases (ports, protocols, malformed URLs)
 * - 100% slash-proof output
 *
 * @returns {string} Origin without trailing slash (e.g., "https://example.com") or empty string during SSR
 */
export const getBaseUrl = (): string => {
  // 1. Guard clause for SSR/SSG
  if (typeof window === 'undefined' || !window?.location) return ''

  try {
    // 2. Primary method - use browser's native origin
    if (window.location.origin) {
      return window.location.origin.replace(/\/+$/, '')
    }

    // 3. Manual construction fallback
    const { protocol, host } = window.location

    // 4. Protocol normalization (ensures "https:" becomes "https://")
    const normalizedProtocol = protocol.endsWith(':')
      ? protocol
      : `${protocol}:`

    // 5. Host normalization (removes any accidental leading/trailing slashes)
    const normalizedHost = host.replace(/^\/+|\/+$/g, '')

    // 6. Final assembly with slash protection
    return `${normalizedProtocol}//${normalizedHost}`.replace(/\/+$/, '')
  } catch (error) {
    // 7. Error boundary for extreme edge cases
    console.warn('Failed to determine origin:', error)
    return ''
  }
}
