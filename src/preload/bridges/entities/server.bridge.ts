import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IServer,
  ICreateServerRequest,
  IUpdateServerRequest,
  IJoinServerRequest,
  IServerApiResponse
} from '../../../shared/contracts/interfaces/entities/server.interfaces'

/**
 * Server API Bridge
 * Exposes server-related functions to the renderer
 */
export const serverBridge = {
  /**
   * Create a new server
   */
  create: (
    request: ICreateServerRequest,
    accessToken: string
  ): Promise<IServerApiResponse<IServer>> => {
    return ipcRenderer.invoke(ipc_channels.server.create, request, accessToken)
  },

  /**
   * Refresh the server invitation code (creator only)
   */
  refreshInviteCode: (
    serverId: string,
    accessToken: string
  ): Promise<IServerApiResponse<IServer>> => {
    return ipcRenderer.invoke(ipc_channels.server.refreshInviteCode, serverId, accessToken)
  },

  /**
   * Join a server by invitation code
   */
  join: (request: IJoinServerRequest, accessToken: string): Promise<IServerApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.server.join, request, accessToken)
  },

  /**
   * Get details of a server
   */
  getDetails: (serverId: string, accessToken: string): Promise<IServerApiResponse<IServer>> => {
    return ipcRenderer.invoke(ipc_channels.server.getDetails, serverId, accessToken)
  },

  /**
   * Update server details (creator only)
   */
  update: (
    serverId: string,
    request: IUpdateServerRequest,
    accessToken: string
  ): Promise<IServerApiResponse<IServer>> => {
    return ipcRenderer.invoke(ipc_channels.server.update, serverId, request, accessToken)
  },

  /**
   * Delete a server (creator only)
   */
  delete: (serverId: string, accessToken: string): Promise<IServerApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.server.delete, serverId, accessToken)
  }
}

export type ServerBridge = typeof serverBridge
