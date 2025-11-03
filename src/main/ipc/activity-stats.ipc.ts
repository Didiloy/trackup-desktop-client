/**
 * Activity Statistics IPC Handlers
 * Handles all activity statistics-related IPC communication
 */

import { ipcMain } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IActivityStats,
  IActivityStatsDetails,
  IActivityTimePatterns,
  IActivityRanking,
  IActivityGrowthTrends,
  IActivityLeaderboard,
  IPaginatedActivityStats,
  IActivityLeaderboardParams,
  IActivityPaginationParams,
  IActivityTimelineParams,
  IActivityGrowthParams,
  IActivityRankingParams,
  IActivityStatsApiResponse
} from '../../shared/contracts/interfaces/activity-stats.interfaces'
import type { IStatsTimeline } from '../../shared/contracts/interfaces/server-stats.interfaces'
import { Logger } from '../../shared/logger'
import { apiService } from '../services/ApiService'

const logger = new Logger('IPC:ActivityStats')

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

export function registerActivityStatsIpc(): void {
  // Get activity leaderboard
  ipcMain.handle(
    ipc_channels.activityStats.getLeaderboard,
    async (
      _event,
      serverId: string,
      params: IActivityLeaderboardParams | undefined,
      accessToken: string
    ): Promise<IActivityStatsApiResponse<IActivityLeaderboard>> => {
      logger.info('Getting activity leaderboard:', serverId, params)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      const queryString = buildQueryParams(params)

      return apiService.get<IActivityLeaderboard>(
        `/api/v1/stats/servers/${serverId}/activities/leaderboard${queryString}`,
        accessToken
      )
    }
  )

  // Get all activities statistics (paginated)
  ipcMain.handle(
    ipc_channels.activityStats.getAllStats,
    async (
      _event,
      serverId: string,
      params: IActivityPaginationParams,
      accessToken: string
    ): Promise<IActivityStatsApiResponse<IPaginatedActivityStats>> => {
      logger.info('Getting all activities statistics:', serverId, params)

      if (!serverId) {
        return { error: 'Server ID is required' }
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

      return apiService.get<IPaginatedActivityStats>(
        `/api/v1/stats/servers/${serverId}/activities${queryString}`,
        accessToken
      )
    }
  )

  // Get activity statistics
  ipcMain.handle(
    ipc_channels.activityStats.getStats,
    async (
      _event,
      serverId: string,
      activityId: string,
      accessToken: string
    ): Promise<IActivityStatsApiResponse<IActivityStats>> => {
      logger.info('Getting activity statistics:', serverId, activityId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IActivityStats>(
        `/api/v1/stats/servers/${serverId}/activities/${activityId}`,
        accessToken
      )
    }
  )

  // Get complete activity details
  ipcMain.handle(
    ipc_channels.activityStats.getDetails,
    async (
      _event,
      serverId: string,
      activityId: string,
      accessToken: string
    ): Promise<IActivityStatsApiResponse<IActivityStatsDetails>> => {
      logger.info('Getting activity details:', serverId, activityId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IActivityStatsDetails>(
        `/api/v1/stats/servers/${serverId}/activities/${activityId}/details`,
        accessToken
      )
    }
  )

  // Get activity time patterns
  ipcMain.handle(
    ipc_channels.activityStats.getPatterns,
    async (
      _event,
      serverId: string,
      activityId: string,
      accessToken: string
    ): Promise<IActivityStatsApiResponse<IActivityTimePatterns>> => {
      logger.info('Getting activity patterns:', serverId, activityId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IActivityTimePatterns>(
        `/api/v1/stats/servers/${serverId}/activities/${activityId}/patterns`,
        accessToken
      )
    }
  )

  // Get activity ranking
  ipcMain.handle(
    ipc_channels.activityStats.getRanking,
    async (
      _event,
      serverId: string,
      activityId: string,
      params: IActivityRankingParams | undefined,
      accessToken: string
    ): Promise<IActivityStatsApiResponse<IActivityRanking>> => {
      logger.info('Getting activity ranking:', serverId, activityId, params)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      const queryString = buildQueryParams(params)

      return apiService.get<IActivityRanking>(
        `/api/v1/stats/servers/${serverId}/activities/${activityId}/ranking${queryString}`,
        accessToken
      )
    }
  )

  // Get activity timeline
  ipcMain.handle(
    ipc_channels.activityStats.getTimeline,
    async (
      _event,
      serverId: string,
      activityId: string,
      params: IActivityTimelineParams | undefined,
      accessToken: string
    ): Promise<IActivityStatsApiResponse<IStatsTimeline[]>> => {
      logger.info('Getting activity timeline:', serverId, activityId, params)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      const queryString = buildQueryParams(params)

      return apiService.get<IStatsTimeline[]>(
        `/api/v1/stats/servers/${serverId}/activities/${activityId}/timeline${queryString}`,
        accessToken
      )
    }
  )

  // Get activity growth trends
  ipcMain.handle(
    ipc_channels.activityStats.getGrowthTrends,
    async (
      _event,
      serverId: string,
      activityId: string,
      params: IActivityGrowthParams | undefined,
      accessToken: string
    ): Promise<IActivityStatsApiResponse<IActivityGrowthTrends>> => {
      logger.info('Getting activity growth trends:', serverId, activityId, params)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!activityId) {
        return { error: 'Activity ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      const queryString = buildQueryParams(params)

      return apiService.get<IActivityGrowthTrends>(
        `/api/v1/stats/servers/${serverId}/activities/${activityId}/growth-trends${queryString}`,
        accessToken
      )
    }
  )

  logger.info('Activity stats IPC handlers registered')
}

