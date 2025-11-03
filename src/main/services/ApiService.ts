import { Logger } from '../../shared/logger'

const logger = new Logger('ApiService')

export interface IApiResponse<T = unknown> {
  data?: T
  error?: string
}

export interface IApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

/**
 * Generic API Service
 * Handles authenticated HTTP requests to the backend API
 */
export class ApiService {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.VITE_API_BASE_URL || 'http://localhost:3000'
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }
    return url.toString()
  }

  /**
   * Generic fetch with authentication and error handling
   */
  private async fetchWithAuth<T>(
    url: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...options.headers
        }
      })

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText
        }))
        logger.error(`API error (${response.status}):`, errorData)
        return { error: errorData.message || `HTTP error ${response.status}` }
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as T }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      logger.error('Fetch error:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    accessToken: string,
    options?: IApiRequestOptions
  ): Promise<IApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params)
    logger.info('GET', url)

    return this.fetchWithAuth<T>(url, accessToken, {
      ...options,
      method: 'GET'
    })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    accessToken: string,
    body?: unknown,
    options?: IApiRequestOptions
  ): Promise<IApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params)
    logger.info('POST', url)

    return this.fetchWithAuth<T>(url, accessToken, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    accessToken: string,
    body?: unknown,
    options?: IApiRequestOptions
  ): Promise<IApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params)
    logger.info('PUT', url)

    return this.fetchWithAuth<T>(url, accessToken, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    accessToken: string,
    body?: unknown,
    options?: IApiRequestOptions
  ): Promise<IApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params)
    logger.info('PATCH', url)

    return this.fetchWithAuth<T>(url, accessToken, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    accessToken: string,
    options?: IApiRequestOptions
  ): Promise<IApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params)
    logger.info('DELETE', url)

    return this.fetchWithAuth<T>(url, accessToken, {
      ...options,
      method: 'DELETE'
    })
  }
}

// Export singleton instance
export const apiService = new ApiService()
