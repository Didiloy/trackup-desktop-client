import { ipcMain, BrowserWindow } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'

/**
 * Register window management IPC handlers
 */
export function registerWindowIpc(): void {
  // Minimize window
  ipcMain.on(ipc_channels.window.minimize, () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.minimize()
    }
  })

  // Maximize/Restore window
  ipcMain.on(ipc_channels.window.maximize, () => {
    const window = BrowserWindow.getFocusedWindow()
    if (!window) {
      return
    }
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })

  // Close window
  ipcMain.on(ipc_channels.window.close, () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.close()
    }
  })

  // Check if window is maximized
  ipcMain.handle(ipc_channels.window.isMaximized, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    return window?.isMaximized() ?? false
  })
}
