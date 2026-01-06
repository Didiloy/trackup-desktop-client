import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { ipc_channels } from '../../shared/contracts/ipc-channels/index.channels'
import icon from '../../../resources/icon.png?asset'
import { Logger } from '../../shared/logger'

const logger = new Logger('Window:Main')

/**
 * MainWindow
 * Configuration and lifecycle management for the main application window
 */
export class MainWindow {
    private window: BrowserWindow | null = null
    private pendingDeepLinkUrl: string | null = null

    async create(): Promise<BrowserWindow> {
        this.window = new BrowserWindow({
            width: 1500,
            minWidth: 1500,
            height: 910,
            minHeight: 910,
            show: false,
            autoHideMenuBar: true,
            frame: false,
            ...(process.platform === 'linux' ? { icon } : {}),
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false,
                contextIsolation: true,
                nodeIntegration: false
            }
        })

        this.setupEventHandlers()
        await this.loadContent()

        return this.window
    }

    private setupEventHandlers(): void {
        if (!this.window) return

        this.window.on('ready-to-show', () => {
            this.window?.show()
            logger.info('Main window ready-to-show')
            // Flush any pending deep link once renderer is ready
            if (this.pendingDeepLinkUrl) {
                this.sendAuthCallback(this.pendingDeepLinkUrl)
                this.pendingDeepLinkUrl = null
            }
        })

        // Must be synchronous: return a WindowOpenHandlerResponse immediately
        this.window.webContents.setWindowOpenHandler((details) => {
            void shell.openExternal(details.url)
            logger.debug('Blocked window open; opened externally', details.url)
            return { action: 'deny' }
        })

        this.window.on('closed', () => {
            this.window = null
        })
    }

    private async loadContent(): Promise<void> {
        if (!this.window) return

        // HMR for renderer based on electron-vite cli
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            await this.window.loadURL(process.env['ELECTRON_RENDERER_URL'])
        } else {
            await this.window.loadFile(join(__dirname, '../renderer/index.html'))
        }
    }

    /**
     * Send authentication callback URL to renderer
     */
    sendAuthCallback(url: string): void {
        if (this.window?.webContents && !this.window.isDestroyed()) {
            this.window.webContents.send(ipc_channels.auth.callbackUrl, url)
        } else {
            this.pendingDeepLinkUrl = url
        }
    }

    /**
     * Get the BrowserWindow instance
     */
    getWindow(): BrowserWindow | null {
        return this.window
    }

    /**
     * Check if the window exists and is not destroyed
     */
    isValid(): boolean {
        return this.window !== null && !this.window.isDestroyed()
    }
}
