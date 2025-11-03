import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { windowManager } from './windows/WindowManager'
import { MainWindow } from './windows/MainWindow'
import { registerAllIpc } from './ipc'
import { deepLinkHandler } from './protocols/deepLink'
import { applySecurity } from './security/hardening'
import dotenv from 'dotenv'

dotenv.config()

// Ensure single instance to receive deep links on Win/Linux
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

const main = new MainWindow()

async function createMainWindow(): Promise<BrowserWindow> {
  const win = await main.create()
  windowManager.register('main', win)
  return win
}

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.github.trackup')

  // Apply security hardening
  applySecurity()

  // Register the custom protocol for deep links and listeners
  deepLinkHandler.registerProtocol()
  deepLinkHandler.setCallback(async (url) => {
    // Focus main window when a deep link arrives
    const win: BrowserWindow =
      windowManager.getMain() ||
      (await windowManager.focusOrCreate('main', async () => await createMainWindow()))
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
    // Forward to renderer
    main.sendAuthCallback(url)
  })
  deepLinkHandler.setupListeners()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register IPC handlers
  registerAllIpc()

  // Create main window
  await createMainWindow()

  // If started with a deep link (Windows), forward it now
  const initialUrl = deepLinkHandler.parseInitialUrl()
  if (initialUrl) {
    main.sendAuthCallback(initialUrl)
  }

  app.on('activate', async function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) await createMainWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
