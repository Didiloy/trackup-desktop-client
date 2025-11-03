import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IServerType,
  IServerTypeApiResponse
} from '../../../shared/contracts/interfaces/entities/server-type.interfaces'

/**
 * Server Type API Bridge
 * Exposes server-type-related functions to the renderer
 */
export const serverTypeBridge = {
  /**
   * Get all server types
   */
  getAll: (accessToken: string): Promise<IServerTypeApiResponse<IServerType[]>> => {
    return ipcRenderer.invoke(ipc_channels.serverType.getAll, accessToken)
  }
}

export type ServerTypeBridge = typeof serverTypeBridge
