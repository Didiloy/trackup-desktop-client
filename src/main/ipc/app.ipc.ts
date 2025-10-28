import { ipcMain, shell, app } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type { IAppVersion } from '../../shared/contracts/interfaces/app.interfaces'
import { Logger } from '../../shared/logger'
import { updateService } from '../services/UpdateService'

const logger = new Logger('IPC:App')

/**
 * Register app-related IPC handlers
 */
export function registerAppIpc(): void {
  // Ping/Pong for testing
  ipcMain.on(ipc_channels.app.ping, () => {
    logger.info('pong')
  })

  // Get app version information
  ipcMain.handle(ipc_channels.app.getVersion, (): IAppVersion => {
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

  // Check for updates
  ipcMain.handle(ipc_channels.app.checkForUpdates, async (): Promise<void> => {
    await updateService.checkForUpdates()
  })

  // Download update
  ipcMain.handle(ipc_channels.app.downloadUpdate, async (): Promise<void> => {
    await updateService.downloadUpdate()
  })

  // Install update
  ipcMain.handle(ipc_channels.app.installUpdate, (): void => {
    updateService.installUpdate()
  })
}
