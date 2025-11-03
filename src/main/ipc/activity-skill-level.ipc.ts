import { ipcMain } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IActivitySkillLevel,
  ICreateActivitySkillLevelRequest,
  IUpdateActivitySkillLevelRequest,
  IActivitySkillLevelApiResponse
} from '../../shared/contracts/interfaces/activity-skill-level.interfaces'
import { Logger } from '../../shared/logger'
import { apiService } from '../services/ApiService'

const logger = new Logger('IPC:ActivitySkillLevel')

/**
 * Register activity skill level-related IPC handlers
 */
export function registerActivitySkillLevelIpc(): void {
  // Create a new skill level for an activity
  ipcMain.handle(
    ipc_channels.activitySkillLevel.create,
    async (
      _event,
      serverId: string,
      activityId: string,
      request: ICreateActivitySkillLevelRequest,
      accessToken: string
    ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
      logger.info('Creating skill level for activity:', activityId)

      // Validate input
      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!request.name) {
        return { error: 'Skill level name is required' }
      }

      if (request.display_order === undefined || request.display_order === null) {
        return { error: 'Display order is required' }
      }

      if (request.min_sessions === undefined || request.min_sessions === null) {
        return { error: 'Minimum sessions is required' }
      }

      if (request.min_duration === undefined || request.min_duration === null) {
        return { error: 'Minimum duration is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<IActivitySkillLevel>(
        `/api/v1/servers/${serverId}/activities/${activityId}/skill-levels`,
        accessToken,
        request
      )
    }
  )

  // List all skill levels for an activity
  ipcMain.handle(
    ipc_channels.activitySkillLevel.list,
    async (
      _event,
      serverId: string,
      activityId: string,
      accessToken: string
    ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel[]>> => {
      logger.info('Listing skill levels for activity:', activityId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IActivitySkillLevel[]>(
        `/api/v1/servers/${serverId}/activities/${activityId}/skill-levels`,
        accessToken
      )
    }
  )

  // Get skill level by ID
  ipcMain.handle(
    ipc_channels.activitySkillLevel.getById,
    async (
      _event,
      serverId: string,
      activityId: string,
      skillLevelId: string,
      accessToken: string
    ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
      logger.info('Getting skill level details:', skillLevelId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!skillLevelId) {
        return { error: 'Skill level ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IActivitySkillLevel>(
        `/api/v1/servers/${serverId}/activities/${activityId}/skill-levels/${skillLevelId}`,
        accessToken
      )
    }
  )

  // Update a skill level
  ipcMain.handle(
    ipc_channels.activitySkillLevel.update,
    async (
      _event,
      serverId: string,
      activityId: string,
      skillLevelId: string,
      request: IUpdateActivitySkillLevelRequest,
      accessToken: string
    ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
      logger.info('Updating skill level:', skillLevelId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!skillLevelId) {
        return { error: 'Skill level ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.put<IActivitySkillLevel>(
        `/api/v1/servers/${serverId}/activities/${activityId}/skill-levels/${skillLevelId}`,
        accessToken,
        request
      )
    }
  )

  // Delete a skill level
  ipcMain.handle(
    ipc_channels.activitySkillLevel.delete,
    async (
      _event,
      serverId: string,
      activityId: string,
      skillLevelId: string,
      accessToken: string
    ): Promise<IActivitySkillLevelApiResponse<void>> => {
      logger.info('Deleting skill level:', skillLevelId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!skillLevelId) {
        return { error: 'Skill level ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.delete<void>(
        `/api/v1/servers/${serverId}/activities/${activityId}/skill-levels/${skillLevelId}`,
        accessToken
      )
    }
  )

  logger.info('Activity skill level IPC handlers registered')
}
