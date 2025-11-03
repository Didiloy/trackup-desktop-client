import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels/index.channels'

/**
 * Window API Bridge
 * Exposes window management functions to the renderer
 */
export const windowBridge = {
  /**
   * Minimize the current window
   */
  minimize: (): void => {
    ipcRenderer.send(ipc_channels.window.minimize)
  },

  /**
   * Maximize or restore the current window
   */
  maximize: (): void => {
    ipcRenderer.send(ipc_channels.window.maximize)
  },

  /**
   * Close the current window
   */
  close: (): void => {
    ipcRenderer.send(ipc_channels.window.close)
  },

  /**
   * Check if the window is maximized
   */
  isMaximized: (): Promise<boolean> => {
    return ipcRenderer.invoke(ipc_channels.window.isMaximized)
  }
}

export type WindowBridge = typeof windowBridge
