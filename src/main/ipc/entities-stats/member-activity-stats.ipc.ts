/**
 * Member Activity Statistics IPC Handlers
 * Handles member activity statistics and progression
 */

import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IMemberActivityDetails,
  IMemberActivityProgression,
  IPaginatedMemberActivityStats,
  IMemberActivityPaginationParams,
  IMemberActivityProgressionParams,
  IMemberActivityStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/member-activity-stats.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
  buildQueryParams,
  combineValidations,
  validateAuth,
  validatePagination,
  validateRequired
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:MemberActivityStats')

export function registerMemberActivityStatsIpc(): void {
  // Get all activities for a member (paginated)
  ipcMain.handle(
    ipc_channels.memberActivityStats.getAllActivities,
    async (
      _event,
      serverId: string,
      memberId: string,
      params: IMemberActivityPaginationParams,
      accessToken: string
    ): Promise<IMemberActivityStatsApiResponse<IPaginatedMemberActivityStats>> => {
      logger.info('Getting all activities for member:', serverId, memberId, params)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(memberId, 'Member ID'),
        validatePagination(params.page, params.limit),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      const queryString = buildQueryParams(params)

      return apiService.get<IPaginatedMemberActivityStats>(
        `/api/v1/stats/servers/${serverId}/members/${memberId}/activities${queryString}`,
        accessToken
      )
    }
  )

  // Get member statistics for a specific activity
  ipcMain.handle(
    ipc_channels.memberActivityStats.getActivityStats,
    async (
      _event,
      serverId: string,
      memberId: string,
      activityId: string,
      accessToken: string
    ): Promise<IMemberActivityStatsApiResponse<IMemberActivityDetails>> => {
      logger.info('Getting member activity stats:', serverId, memberId, activityId)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(memberId, 'Member ID'),
        validateRequired(activityId, 'Activity ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.get<IMemberActivityDetails>(
        `/api/v1/stats/servers/${serverId}/members/${memberId}/activities/${activityId}`,
        accessToken
      )
    }
  )

  // Get member progression on an activity
  ipcMain.handle(
    ipc_channels.memberActivityStats.getActivityProgression,
    async (
      _event,
      serverId: string,
      memberId: string,
      activityId: string,
      params: IMemberActivityProgressionParams | undefined,
      accessToken: string
    ): Promise<IMemberActivityStatsApiResponse<IMemberActivityProgression[]>> => {
      logger.info('Getting member activity progression:', serverId, memberId, activityId, params)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(memberId, 'Member ID'),
        validateRequired(activityId, 'Activity ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      const queryString = buildQueryParams(params)

      return apiService.get<IMemberActivityProgression[]>(
        `/api/v1/stats/servers/${serverId}/members/${memberId}/activities/${activityId}/progression${queryString}`,
        accessToken
      )
    }
  )

  logger.info('Member activity stats IPC handlers registered')
}
