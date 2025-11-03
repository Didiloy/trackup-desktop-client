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

const logger = new Logger('IPC:MemberActivityStats')

/**
 * Build query string from params object
 */
function buildQueryParams(params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return ''

  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')

  return query ? `?${query}` : ''
}

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

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!memberId) {
        return { error: 'Member ID is required' }
      }

      if (!params.page || params.page < 1) {
        return { error: 'Page must be >= 1' }
      }

      if (!params.limit || params.limit < 1) {
        return { error: 'Limit must be >= 1' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

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

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!memberId) {
        return { error: 'Member ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

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

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!memberId) {
        return { error: 'Member ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      const queryString = buildQueryParams(params)

      return apiService.get<IMemberActivityProgression[]>(
        `/api/v1/stats/servers/${serverId}/members/${memberId}/activities/${activityId}/progression${queryString}`,
        accessToken
      )
    }
  )

  logger.info('Member activity stats IPC handlers registered')
}
