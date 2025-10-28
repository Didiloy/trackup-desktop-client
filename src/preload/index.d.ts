import { ElectronAPI } from '@electron-toolkit/preload'
import type { WindowBridge } from './bridges/window.bridge'
import type { AppBridge } from './bridges/app.bridge'
import type { AuthBridge } from './bridges/auth.bridge'

/**
 * Global type definitions for window.api
 */
export interface API {
  window: WindowBridge
  app: AppBridge
  auth: AuthBridge
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
