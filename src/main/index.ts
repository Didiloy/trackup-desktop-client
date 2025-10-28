import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null
let pendingDeepLinkUrl: string | null = null

function sendAuthCallback(url: string): void {
  if (mainWindow?.webContents) {
    mainWindow.webContents.send('auth-callback-url', url)
  } else {
    pendingDeepLinkUrl = url
  }
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 600,
    height: 690,
    minHeight: 500,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // Flush any pending deep link once renderer is ready
    if (pendingDeepLinkUrl) {
      mainWindow?.webContents.send('auth-callback-url', pendingDeepLinkUrl)
      pendingDeepLinkUrl = null
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Ensure single instance to receive deep links on Win/Linux
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.github.trackup')

  // Register custom protocol for auth callback
  try {
    // In dev, Electron needs explicit args to relaunch the app for deep links
    if (process.defaultApp || is.dev) {
      const appPathArg = join(process.cwd(), process.argv[1] ?? '')
      const ok = app.setAsDefaultProtocolClient('trackup', process.execPath, [appPathArg])
      if (!ok) {
        console.warn('Protocol register (dev) failed. Deep links may not work until packaged.')
      }
    } else {
      const ok = app.setAsDefaultProtocolClient('trackup')
      if (!ok) {
        console.warn(
          'Protocol register (prod) failed. The desktop entry should still register the scheme when installed.'
        )
      }
    }
  } catch (e) {
    // ignore
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('minimize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.minimize()
    }
  })

  ipcMain.on('maximize', () => {
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

  ipcMain.on('close', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.close()
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// macOS deep link handler
app.on('open-url', (event, url) => {
  event.preventDefault()
  sendAuthCallback(url)
})

// Win/Linux second-instance handler with deep link in argv
app.on('second-instance', (_event, commandLine) => {
  const deepLinkArg = commandLine.find((arg) => arg.startsWith('trackup://'))
  if (deepLinkArg) {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    sendAuthCallback(deepLinkArg)
  }
})

// Parse deep link from initial launch (Windows)
if (process.platform === 'win32') {
  const deepLinkArg = process.argv.find((arg) => arg.startsWith('trackup://'))
  if (deepLinkArg) {
    pendingDeepLinkUrl = deepLinkArg
  }
}
