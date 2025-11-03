import { ipcRenderer, IpcRendererEvent } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels/index.channels'

/**
 * Auth API Bridge
 * Exposes authentication-related functions to the renderer
 */
export const authBridge = {
  /**
   * Listen for authentication callback URLs from deep links
   */
  onCallbackUrl: (callback: (url: string) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, url: string): void => {
      callback(url)
    }

    ipcRenderer.on(ipc_channels.auth.callbackUrl, handler)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(ipc_channels.auth.callbackUrl, handler)
    }
  }
}

export type AuthBridge = typeof authBridge
