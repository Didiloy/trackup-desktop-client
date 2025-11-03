/**
 * Activity Statistics Bridge
 * Exposes activity statistics API to the renderer process
 */

import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
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
} from '../../../shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import type { IStatsTimeline } from '../../../shared/contracts/interfaces/entities-stats/server-stats.interfaces'

export const activityStatsBridge = {
  /**
   * Get activity leaderboard
   */
  getLeaderboard: (
    serverId: string,
    params: IActivityLeaderboardParams | undefined,
    accessToken: string
  ): Promise<IActivityStatsApiResponse<IActivityLeaderboard>> => {
    return ipcRenderer.invoke(
      ipc_channels.activityStats.getLeaderboard,
      serverId,
      params,
      accessToken
    )
  },

  /**
   * Get all activities statistics (paginated)
   */
  getAllStats: (
    serverId: string,
    params: IActivityPaginationParams,
    accessToken: string
  ): Promise<IActivityStatsApiResponse<IPaginatedActivityStats>> => {
    return ipcRenderer.invoke(ipc_channels.activityStats.getAllStats, serverId, params, accessToken)
  },

  /**
   * Get activity statistics
   */
  getStats: (
    serverId: string,
    activityId: string,
    accessToken: string
  ): Promise<IActivityStatsApiResponse<IActivityStats>> => {
    return ipcRenderer.invoke(
      ipc_channels.activityStats.getStats,
      serverId,
      activityId,
      accessToken
    )
  },

  /**
   * Get complete activity details
   */
  getDetails: (
    serverId: string,
    activityId: string,
    accessToken: string
  ): Promise<IActivityStatsApiResponse<IActivityStatsDetails>> => {
    return ipcRenderer.invoke(
      ipc_channels.activityStats.getDetails,
      serverId,
      activityId,
      accessToken
    )
  },

  /**
   * Get activity time patterns
   */
  getPatterns: (
    serverId: string,
    activityId: string,
    accessToken: string
  ): Promise<IActivityStatsApiResponse<IActivityTimePatterns>> => {
    return ipcRenderer.invoke(
      ipc_channels.activityStats.getPatterns,
      serverId,
      activityId,
      accessToken
    )
  },

  /**
   * Get activity ranking
   */
  getRanking: (
    serverId: string,
    activityId: string,
    params: IActivityRankingParams | undefined,
    accessToken: string
  ): Promise<IActivityStatsApiResponse<IActivityRanking>> => {
    return ipcRenderer.invoke(
      ipc_channels.activityStats.getRanking,
      serverId,
      activityId,
      params,
      accessToken
    )
  },

  /**
   * Get activity timeline
   */
  getTimeline: (
    serverId: string,
    activityId: string,
    params: IActivityTimelineParams | undefined,
    accessToken: string
  ): Promise<IActivityStatsApiResponse<IStatsTimeline[]>> => {
    return ipcRenderer.invoke(
      ipc_channels.activityStats.getTimeline,
      serverId,
      activityId,
      params,
      accessToken
    )
  },

  /**
   * Get activity growth trends
   */
  getGrowthTrends: (
    serverId: string,
    activityId: string,
    params: IActivityGrowthParams | undefined,
    accessToken: string
  ): Promise<IActivityStatsApiResponse<IActivityGrowthTrends>> => {
    return ipcRenderer.invoke(
      ipc_channels.activityStats.getGrowthTrends,
      serverId,
      activityId,
      params,
      accessToken
    )
  }
}

export type ActivityStatsBridge = typeof activityStatsBridge
