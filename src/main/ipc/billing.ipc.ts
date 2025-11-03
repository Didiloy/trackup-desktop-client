import { ipcMain, shell } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels/index.channels'
import type { IBillingApiResponse } from '../../shared/contracts/interfaces/billing.interfaces'
import { Logger } from '../../shared/logger'
import { validateAuth, validateUrlScheme } from '../../shared/helpers/index.helpers'

const logger = new Logger('IPC:Billing')

// Base URL for the API (should match ApiService base URL)
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Register billing-related IPC handlers
 * These handlers construct URLs with query params and open them in the default browser
 */
export function registerBillingIpc(): void {
  // Start subscription checkout
  ipcMain.handle(
    ipc_channels.billing.startSubscription,
    async (_event, accessToken: string): Promise<IBillingApiResponse> => {
      logger.info('Starting subscription checkout')

      const validationError = validateAuth(accessToken)
      if (validationError) return validationError

      try {
        // Construct URL with access_token as query parameter
        const url = `${API_BASE_URL}/api/v1/billing/subscribe/start?access_token=${encodeURIComponent(accessToken)}`

        // Validate URL scheme (security check)
        const urlValidationError = validateUrlScheme(url)
        if (urlValidationError) {
          logger.error('Invalid URL scheme:', url)
          return urlValidationError
        }

        // Open URL in default browser
        await shell.openExternal(url)
        logger.info('Opened subscription checkout in browser')

        return { data: undefined }
      } catch (error) {
        logger.error('Error opening subscription checkout:', error)
        return { error: error instanceof Error ? error.message : 'Failed to open browser' }
      }
    }
  )

  // Start billing portal
  ipcMain.handle(
    ipc_channels.billing.startPortal,
    async (_event, accessToken: string): Promise<IBillingApiResponse> => {
      logger.info('Starting billing portal')

      const validationError = validateAuth(accessToken)
      if (validationError) return validationError

      try {
        // Construct URL with access_token as query parameter
        const url = `${API_BASE_URL}/api/v1/billing/portal/start?access_token=${encodeURIComponent(accessToken)}`

        // Validate URL scheme (security check)
        const urlValidationError = validateUrlScheme(url)
        if (urlValidationError) {
          logger.error('Invalid URL scheme:', url)
          return urlValidationError
        }

        // Open URL in default browser
        await shell.openExternal(url)
        logger.info('Opened billing portal in browser')

        return { data: undefined }
      } catch (error) {
        logger.error('Error opening billing portal:', error)
        return { error: error instanceof Error ? error.message : 'Failed to open browser' }
      }
    }
  )

  logger.info('Billing IPC handlers registered')
}
