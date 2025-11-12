import { ipcRenderer, clipboard } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels/index.channels'
import type {
    IAppVersion,
    IUpdateInfo,
    IUpdateProgress
} from '../../shared/contracts/interfaces/app.interfaces'

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
    getVersion: (): Promise<IAppVersion> => {
        return ipcRenderer.invoke(ipc_channels.app.getVersion)
    },

    /**
     * Open an external URL in the default browser
     */
    openExternal: (url: string): Promise<void> => {
        return ipcRenderer.invoke(ipc_channels.app.openExternal, url)
    },

    /**
     * Check for updates
     */
    checkForUpdates: (): Promise<void> => {
        return ipcRenderer.invoke(ipc_channels.app.checkForUpdates)
    },

    /**
     * Download the update
     */
    downloadUpdate: (): Promise<void> => {
        return ipcRenderer.invoke(ipc_channels.app.downloadUpdate)
    },

    /**
     * Install the update and restart the app
     */
    installUpdate: (): Promise<void> => {
        return ipcRenderer.invoke(ipc_channels.app.installUpdate)
    },

    /**
     * Listen for update available event
     */
    onUpdateAvailable: (callback: (updateInfo: IUpdateInfo) => void): (() => void) => {
        const handler = (_event: any, updateInfo: IUpdateInfo) => callback(updateInfo)
        ipcRenderer.on(ipc_channels.app.updateAvailable, handler)
        return () => ipcRenderer.removeListener(ipc_channels.app.updateAvailable, handler)
    },

    /**
     * Listen for update downloaded event
     */
    onUpdateDownloaded: (callback: (info: any) => void): (() => void) => {
        const handler = (_event: any, info: any) => callback(info)
        ipcRenderer.on(ipc_channels.app.updateDownloaded, handler)
        return () => ipcRenderer.removeListener(ipc_channels.app.updateDownloaded, handler)
    },

    /**
     * Listen for update error event
     */
    onUpdateError: (callback: (error: string) => void): (() => void) => {
        const handler = (_event: any, error: string) => callback(error)
        ipcRenderer.on(ipc_channels.app.updateError, handler)
        return () => ipcRenderer.removeListener(ipc_channels.app.updateError, handler)
    },

    /**
     * Listen for download progress event
     */
    onUpdateProgress: (callback: (progress: IUpdateProgress) => void): (() => void) => {
        const handler = (_event: any, progress: IUpdateProgress) => callback(progress)
        ipcRenderer.on(ipc_channels.app.updateProgress, handler)
        return () => ipcRenderer.removeListener(ipc_channels.app.updateProgress, handler)
    },

    /**
     * Clipboard helpers (preload → direct electron.clipboard)
     */
    clipboard: {
        readText: (type?: 'selection' | 'clipboard'): string => clipboard.readText(type),
        writeText: (text: string, type?: 'selection' | 'clipboard'): void =>
            clipboard.writeText(text, type),
        readHTML: (type?: 'selection' | 'clipboard'): string => clipboard.readHTML(type),
        writeHTML: (markup: string, type?: 'selection' | 'clipboard'): void =>
            clipboard.writeHTML(markup, type),
        clear: (type?: 'selection' | 'clipboard'): void => clipboard.clear(type)
    }
}

export type AppBridge = typeof appBridge
