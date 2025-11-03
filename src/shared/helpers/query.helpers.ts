/**
 * Generic query parameter helpers
 * Provides reusable query parameter building functions across the application
 */

/**
 * Build query string from params object
 * Filters out undefined and null values and properly encodes parameters
 * @param params - Object containing query parameters
 * @returns Query string with leading '?' or empty string
 */
export function buildQueryParams(params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return ''

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  return query ? `?${query}` : ''
}

/**
 * Build query string and append to a URL path
 * @param path - Base URL path
 * @param params - Object containing query parameters
 * @returns Complete URL with query string
 */
export function buildUrlWithParams(path: string, params?: Record<string, unknown>): string {
  const queryString = buildQueryParams(params)
  return `${path}${queryString}`
}

/**
 * Build API service request options with query parameters
 * @param params - Object containing query parameters
 * @returns Options object for apiService methods
 */
export function buildRequestOptions(
  params?: Record<string, unknown>
): { params?: Record<string, string> } | undefined {
  if (!params || Object.keys(params).length === 0) return undefined

  const filteredParams: Record<string, string> = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      filteredParams[key] = String(value)
    }
  })

  return Object.keys(filteredParams).length > 0 ? { params: filteredParams } : undefined
}

