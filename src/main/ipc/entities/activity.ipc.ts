import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IActivity,
  ICreateActivityRequest,
  IUpdateActivityRequest,
  IListActivitiesOptions,
  IActivityApiResponse
} from '../../../shared/contracts/interfaces/entities/activity.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'

const logger = new Logger('IPC:Activity')

/**
 * Register activity-related IPC handlers
 */
export function registerActivityIpc(): void {
  // Create a new activity
  ipcMain.handle(
    ipc_channels.activity.create,
    async (
      _event,
      serverId: string,
      request: ICreateActivityRequest,
      accessToken: string
    ): Promise<IActivityApiResponse<IActivity>> => {
      logger.info('Creating activity:', request.name)

      // Validate input
      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!request.name) {
        return { error: 'Activity name is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<IActivity>(
        `/api/v1/servers/${serverId}/activities`,
        accessToken,
        request
      )
    }
  )

  // List all activities in a server
  ipcMain.handle(
    ipc_channels.activity.list,
    async (
      _event,
      serverId: string,
      options: IListActivitiesOptions | undefined,
      accessToken: string
    ): Promise<IActivityApiResponse<IActivity[]>> => {
      logger.info('Listing activities for server:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      // Build query parameters
      const params: Record<string, string> = {}
      if (options?.search) {
        params.search = options.search
      }
      if (options?.searchMode) {
        params.searchMode = options.searchMode
      }

      return apiService.get<IActivity[]>(`/api/v1/servers/${serverId}/activities`, accessToken, {
        params: Object.keys(params).length > 0 ? params : undefined
      })
    }
  )

  // Get activity by ID
  ipcMain.handle(
    ipc_channels.activity.getById,
    async (
      _event,
      serverId: string,
      activityId: string,
      accessToken: string
    ): Promise<IActivityApiResponse<IActivity>> => {
      logger.info('Getting activity details:', activityId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IActivity>(
        `/api/v1/servers/${serverId}/activities/${activityId}`,
        accessToken
      )
    }
  )

  // Update an activity
  ipcMain.handle(
    ipc_channels.activity.update,
    async (
      _event,
      serverId: string,
      activityId: string,
      request: IUpdateActivityRequest,
      accessToken: string
    ): Promise<IActivityApiResponse<IActivity>> => {
      logger.info('Updating activity:', activityId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!request.name) {
        return { error: 'Activity name is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.put<IActivity>(
        `/api/v1/servers/${serverId}/activities/${activityId}`,
        accessToken,
        request
      )
    }
  )

  // Delete an activity
  ipcMain.handle(
    ipc_channels.activity.delete,
    async (
      _event,
      serverId: string,
      activityId: string,
      accessToken: string
    ): Promise<IActivityApiResponse<void>> => {
      logger.info('Deleting activity:', activityId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.delete<void>(
        `/api/v1/servers/${serverId}/activities/${activityId}`,
        accessToken
      )
    }
  )

  logger.info('Activity IPC handlers registered')
}
