import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IUser,
  IUserServer,
  IUserApiResponse
} from '../../../shared/contracts/interfaces/entities/user.interfaces'

/**
 * User API Bridge
 * Exposes user-related functions to the renderer
 */
export const userBridge = {
  /**
   * Get current user information
   */
  getMe: (accessToken: string): Promise<IUserApiResponse<IUser>> => {
    return ipcRenderer.invoke(ipc_channels.user.getMe, accessToken)
  },

  /**
   * Get current user's servers
   */
  getMyServers: (accessToken: string): Promise<IUserApiResponse<IUserServer[]>> => {
    return ipcRenderer.invoke(ipc_channels.user.getMyServers, accessToken)
  }
}

export type UserBridge = typeof userBridge

