/**
 * App-related interfaces
 */

export interface IAppVersion {
  version: string
  electron: string
  chrome: string
  node: string
}

export interface IUpdateInfo {
  version: string
  releaseNotes?: string
  releaseDate: string
  isMajor: boolean
}

export interface IUpdateProgress {
  percent: number
  bytesPerSecond: number
  total: number
  transferred: number
}
