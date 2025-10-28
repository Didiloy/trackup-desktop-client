import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type { AppVersion } from '../../shared/contracts/types/app.types'

/**
 * App API Bridge
 * Exposes app-level functions to the renderer
 */
export const appBridge = {
  /**
   * Send a ping to the main process (for testing)
   */
  ping: (): void => {
    ipcRenderer.send(ipc_channels.app.ping)
  },

  /**
   * Get app version information
   */
  getVersion: (): Promise<AppVersion> => {
    return ipcRenderer.invoke(ipc_channels.app.getVersion)
  },

  /**
   * Open an external URL in the default browser
   */
  openExternal: (url: string): Promise<void> => {
    return ipcRenderer.invoke(ipc_channels.app.openExternal, url)
  }
}

export type AppBridge = typeof appBridge
