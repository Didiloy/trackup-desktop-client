import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IActivity,
  ICreateActivityRequest,
  IUpdateActivityRequest,
  IListActivitiesOptions,
  IActivityApiResponse
} from '../../shared/contracts/interfaces/activity.interfaces'

/**
 * Activity API Bridge
 * Exposes activity-related functions to the renderer
 */
export const activityBridge = {
  /**
   * Create a new activity in a server
   */
  create: (
    serverId: string,
    request: ICreateActivityRequest,
    accessToken: string
  ): Promise<IActivityApiResponse<IActivity>> => {
    return ipcRenderer.invoke(ipc_channels.activity.create, serverId, request, accessToken)
  },

  /**
   * List all activities in a server with optional search
   */
  list: (
    serverId: string,
    options: IListActivitiesOptions | undefined,
    accessToken: string
  ): Promise<IActivityApiResponse<IActivity[]>> => {
    return ipcRenderer.invoke(ipc_channels.activity.list, serverId, options, accessToken)
  },

  /**
   * Get details of a specific activity
   */
  getById: (
    serverId: string,
    activityId: string,
    accessToken: string
  ): Promise<IActivityApiResponse<IActivity>> => {
    return ipcRenderer.invoke(ipc_channels.activity.getById, serverId, activityId, accessToken)
  },

  /**
   * Update an activity (creator only)
   */
  update: (
    serverId: string,
    activityId: string,
    request: IUpdateActivityRequest,
    accessToken: string
  ): Promise<IActivityApiResponse<IActivity>> => {
    return ipcRenderer.invoke(
      ipc_channels.activity.update,
      serverId,
      activityId,
      request,
      accessToken
    )
  },

  /**
   * Delete an activity (creator only)
   */
  delete: (
    serverId: string,
    activityId: string,
    accessToken: string
  ): Promise<IActivityApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.activity.delete, serverId, activityId, accessToken)
  }
}

export type ActivityBridge = typeof activityBridge
