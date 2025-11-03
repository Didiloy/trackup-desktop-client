/**
 * Member Statistics Bridge
 * Exposes member statistics API to the renderer process
 */

import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IMemberStats,
  IMemberStatsDetails,
  IMemberActivityPatterns,
  IMemberRanking,
  IMemberGrowthTrends,
  IMemberLeaderboard,
  IPaginatedMemberStats,
  ILeaderboardParams,
  IPaginationParams,
  IMemberTimelineParams,
  IMemberGrowthParams,
  IMemberStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import type { IStatsTimeline } from '../../../shared/contracts/interfaces/entities-stats/server-stats.interfaces'

export const memberStatsBridge = {
  /**
   * Get member leaderboard
   */
  getLeaderboard: (
    serverId: string,
    params: ILeaderboardParams | undefined,
    accessToken: string
  ): Promise<IMemberStatsApiResponse<IMemberLeaderboard>> => {
    return ipcRenderer.invoke(
      ipc_channels.memberStats.getLeaderboard,
      serverId,
      params,
      accessToken
    )
  },

  /**
   * Get all members statistics (paginated)
   */
  getAllStats: (
    serverId: string,
    params: IPaginationParams,
    accessToken: string
  ): Promise<IMemberStatsApiResponse<IPaginatedMemberStats>> => {
    return ipcRenderer.invoke(ipc_channels.memberStats.getAllStats, serverId, params, accessToken)
  },

  /**
   * Get member statistics
   */
  getStats: (
    serverId: string,
    memberId: string,
    accessToken: string
  ): Promise<IMemberStatsApiResponse<IMemberStats>> => {
    return ipcRenderer.invoke(ipc_channels.memberStats.getStats, serverId, memberId, accessToken)
  },

  /**
   * Get complete member details
   */
  getDetails: (
    serverId: string,
    memberId: string,
    accessToken: string
  ): Promise<IMemberStatsApiResponse<IMemberStatsDetails>> => {
    return ipcRenderer.invoke(ipc_channels.memberStats.getDetails, serverId, memberId, accessToken)
  },

  /**
   * Get member activity patterns
   */
  getPatterns: (
    serverId: string,
    memberId: string,
    accessToken: string
  ): Promise<IMemberStatsApiResponse<IMemberActivityPatterns>> => {
    return ipcRenderer.invoke(ipc_channels.memberStats.getPatterns, serverId, memberId, accessToken)
  },

  /**
   * Get member ranking
   */
  getRanking: (
    serverId: string,
    memberId: string,
    accessToken: string
  ): Promise<IMemberStatsApiResponse<IMemberRanking>> => {
    return ipcRenderer.invoke(ipc_channels.memberStats.getRanking, serverId, memberId, accessToken)
  },

  /**
   * Get member timeline
   */
  getTimeline: (
    serverId: string,
    memberId: string,
    params: IMemberTimelineParams | undefined,
    accessToken: string
  ): Promise<IMemberStatsApiResponse<IStatsTimeline[]>> => {
    return ipcRenderer.invoke(
      ipc_channels.memberStats.getTimeline,
      serverId,
      memberId,
      params,
      accessToken
    )
  },

  /**
   * Get member growth trends
   */
  getGrowthTrends: (
    serverId: string,
    memberId: string,
    params: IMemberGrowthParams | undefined,
    accessToken: string
  ): Promise<IMemberStatsApiResponse<IMemberGrowthTrends>> => {
    return ipcRenderer.invoke(
      ipc_channels.memberStats.getGrowthTrends,
      serverId,
      memberId,
      params,
      accessToken
    )
  }
}

export type MemberStatsBridge = typeof memberStatsBridge
