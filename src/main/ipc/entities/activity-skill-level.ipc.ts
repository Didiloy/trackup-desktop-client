import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IActivitySkillLevel,
  ICreateActivitySkillLevelRequest,
  IUpdateActivitySkillLevelRequest,
  IActivitySkillLevelApiResponse
} from '../../../shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import { validateRequired, validateAuth, combineValidations } from '../../../shared/helpers'

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
      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(activityId, 'Activity ID'),
        validateRequired(request.name, 'Skill level name'),
        validateRequired(request.display_order, 'Display order'),
        validateRequired(request.min_sessions, 'Minimum sessions'),
        validateRequired(request.min_duration, 'Minimum duration'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(activityId, 'Activity ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(activityId, 'Activity ID'),
        validateRequired(skillLevelId, 'Skill level ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(activityId, 'Activity ID'),
        validateRequired(skillLevelId, 'Skill level ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(activityId, 'Activity ID'),
        validateRequired(skillLevelId, 'Skill level ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.delete<void>(
        `/api/v1/servers/${serverId}/activities/${activityId}/skill-levels/${skillLevelId}`,
        accessToken
      )
    }
  )

  logger.info('Activity skill level IPC handlers registered')
}
