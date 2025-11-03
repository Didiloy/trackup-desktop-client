import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { IUpdateInfo, IUpdateProgress } from '../../shared/contracts/interfaces/app.interfaces'
import { Logger } from '../../shared/logger'
import { windowManager } from '../windows/WindowManager'
import { ipc_channels } from '../../shared/contracts/ipc-channels/index.channels'

const logger = new Logger('Service:Update')

class UpdateService {
  constructor() {
    this.setupAutoUpdaterListeners()
  }

  async checkForUpdates(): Promise<void> {
    try {
      await autoUpdater.checkForUpdates()
    } catch (error) {
      logger.error('Error checking for updates:', error)
      throw error
    }
  }

  async downloadUpdate(): Promise<void> {
    try {
      await autoUpdater.downloadUpdate()
    } catch (error) {
      logger.error('Error downloading update:', error)
      throw error
    }
  }

  installUpdate(): void {
    autoUpdater.quitAndInstall()
  }

  private setupAutoUpdaterListeners(): void {
    autoUpdater.on('update-available', (info) => {
      const currentVersion = app.getVersion()
      const newVersion = info.version
      const isMajor = this.isMajorUpdate(currentVersion, newVersion)
      const updateInfo: IUpdateInfo = {
        version: newVersion,
        releaseNotes: info.releaseNotes as string,
        releaseDate: info.releaseDate,
        isMajor
      }
      const mainWindow = windowManager.getMain()
      mainWindow?.webContents.send(ipc_channels.app.updateAvailable, updateInfo)
      logger.info('Update available:', updateInfo)
    })

    autoUpdater.on('update-downloaded', (info) => {
      const mainWindow = windowManager.getMain()
      mainWindow?.webContents.send(ipc_channels.app.updateDownloaded, info)
      logger.info('Update downloaded:', info)
    })

    autoUpdater.on('error', (error) => {
      const mainWindow = windowManager.getMain()
      mainWindow?.webContents.send(ipc_channels.app.updateError, error.message)
      logger.error('Update error:', error)
    })

    autoUpdater.on('download-progress', (progress: IUpdateProgress) => {
      const mainWindow = windowManager.getMain()
      mainWindow?.webContents.send(ipc_channels.app.updateProgress, progress)
      logger.debug('Download progress:', progress)
    })
  }

  private isMajorUpdate(current: string, newVersion: string): boolean {
    const currentParts = current.split('.').map(Number)
    const newParts = newVersion.split('.').map(Number)
    return newParts[0] > currentParts[0]
  }
}

export const updateService = new UpdateService()
