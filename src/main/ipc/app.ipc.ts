import { ipcMain, shell, app } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type { AppVersion } from '../../shared/contracts/types/app.types'

/**
 * Register app-related IPC handlers
 */
export function registerAppIpc(): void {
  // Ping/Pong for testing
  ipcMain.on(ipc_channels.app.ping, () => {
    console.log('pong')
  })

  // Get app version information
  ipcMain.handle(ipc_channels.app.getVersion, (): AppVersion => {
    return {
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node
    }
  })

  // Open external URL
  ipcMain.handle(ipc_channels.app.openExternal, async (_event, url: string): Promise<void> => {
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('Invalid URL')
    }
    await shell.openExternal(url)
  })
}
