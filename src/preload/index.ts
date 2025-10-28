import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { windowBridge } from './bridges/window.bridge'
import { appBridge } from './bridges/app.bridge'
import { authBridge } from './bridges/auth.bridge'

/**
 * Preload script
 * Aggregates all bridges and exposes them to the renderer via contextBridge
 */

// Aggregate all API bridges
const api = {
  window: windowBridge,
  app: appBridge,
  auth: authBridge
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
