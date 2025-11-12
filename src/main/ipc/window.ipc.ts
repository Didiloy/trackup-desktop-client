import { ipcMain, BrowserWindow } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels/index.channels'
import { Logger } from '../../shared/logger'

const logger = new Logger('window-ipc')
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

    // Open DevTools
    ipcMain.on(ipc_channels.window.openDevTools, () => {
        const window = BrowserWindow.getFocusedWindow()
        window?.webContents.openDevTools()
    })

    // Maximize/Restore window
    ipcMain.on(ipc_channels.window.maximize, () => {
        logger.debug('window maximize IPC called')
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
