import { ipcMain } from 'electron'
import { registerWindowIpc } from './window.ipc'
import { registerAppIpc } from './app.ipc'
import { registerServerIpc } from './server.ipc'

/**
 * Register all IPC handlers
 * Central place to wire up all IPC modules
 */
export function registerAllIpc(): void {
  // Clear any existing handlers (useful for hot reload in development)
  ipcMain.removeAllListeners()

  // Register domain-specific IPC handlers
  registerWindowIpc()
  registerAppIpc()
  registerServerIpc()
}
