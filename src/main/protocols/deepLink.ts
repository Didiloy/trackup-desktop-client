import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

/**
 * Deep Link Handler
 * Manages custom protocol registration and deep link handling
 */
export class DeepLinkHandler {
  private protocolScheme = 'trackup'
  private callback: ((url: string) => void) | null = null

  /**
   * Register the custom protocol for deep linking
   */
  registerProtocol(): boolean {
    try {
      // In dev, Electron needs explicit args to relaunch the app for deep links
      if (process.defaultApp || is.dev) {
        const appPathArg = join(process.cwd(), process.argv[1] ?? '')
        const ok = app.setAsDefaultProtocolClient(this.protocolScheme, process.execPath, [
          appPathArg
        ])
        if (!ok) {
          console.warn('Protocol register (dev) failed. Deep links may not work until packaged.')
        }
        return ok
      } else {
        const ok = app.setAsDefaultProtocolClient(this.protocolScheme)
        if (!ok) {
          console.warn(
            'Protocol register (prod) failed. The desktop entry should still register the scheme when installed.'
          )
        }
        return ok
      }
    } catch (e) {
      console.error('Failed to register protocol:', e)
      return false
    }
  }

  /**
   * Set the callback to handle deep link URLs
   */
  setCallback(callback: (url: string) => void): void {
    this.callback = callback
  }

  /**
   * Handle a deep link URL
   */
  handleUrl(url: string): void {
    if (this.callback) {
      this.callback(url)
    }
  }

  /**
   * Parse initial deep link from command line arguments (Windows)
   */
  parseInitialUrl(): string | null {
    if (process.platform === 'win32') {
      const deepLinkArg = process.argv.find((arg) => arg.startsWith(`${this.protocolScheme}://`))
      return deepLinkArg || null
    }
    return null
  }

  /**
   * Setup platform-specific deep link listeners
   */
  setupListeners(): void {
    // macOS deep link handler
    app.on('open-url', (event, url) => {
      event.preventDefault()
      this.handleUrl(url)
    })

    // Win/Linux second-instance handler with deep link in argv
    app.on('second-instance', (_event, commandLine) => {
      const deepLinkArg = commandLine.find((arg) => arg.startsWith(`${this.protocolScheme}://`))
      if (deepLinkArg) {
        this.handleUrl(deepLinkArg)
      }
    })
  }
}

// Singleton instance
export const deepLinkHandler = new DeepLinkHandler()
