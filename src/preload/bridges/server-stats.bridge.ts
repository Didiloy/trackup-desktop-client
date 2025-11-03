/**
 * Server Statistics Bridge
 * Exposes server statistics API to the renderer process
 */

import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IServerStats,
  IServerStatsDetails,
  IStatsTimeline,
  IServerGrowthTrends,
  IComparativeAnalysis,
  IStatsTimelineParams,
  IStatsGrowthParams,
  IServerStatsApiResponse
} from '../../shared/contracts/interfaces/server-stats.interfaces'

export const serverStatsBridge = {
  /**
   * Get server statistics
   */
  getStats: (
    serverId: string,
    accessToken: string
  ): Promise<IServerStatsApiResponse<IServerStats>> => {
    return ipcRenderer.invoke(ipc_channels.serverStats.getStats, serverId, accessToken)
  },

  /**
   * Get complete server stats details
   */
  getDetails: (
    serverId: string,
    accessToken: string
  ): Promise<IServerStatsApiResponse<IServerStatsDetails>> => {
    return ipcRenderer.invoke(ipc_channels.serverStats.getDetails, serverId, accessToken)
  },

  /**
   * Get server timeline
   */
  getTimeline: (
    serverId: string,
    params: IStatsTimelineParams | undefined,
    accessToken: string
  ): Promise<IServerStatsApiResponse<IStatsTimeline[]>> => {
    return ipcRenderer.invoke(ipc_channels.serverStats.getTimeline, serverId, params, accessToken)
  },

  /**
   * Get server growth trends
   */
  getGrowthTrends: (
    serverId: string,
    params: IStatsGrowthParams | undefined,
    accessToken: string
  ): Promise<IServerStatsApiResponse<IServerGrowthTrends>> => {
    return ipcRenderer.invoke(
      ipc_channels.serverStats.getGrowthTrends,
      serverId,
      params,
      accessToken
    )
  },

  /**
   * Get comparative analysis
   */
  getComparativeAnalysis: (
    serverId: string,
    accessToken: string
  ): Promise<IServerStatsApiResponse<IComparativeAnalysis[]>> => {
    return ipcRenderer.invoke(
      ipc_channels.serverStats.getComparativeAnalysis,
      serverId,
      accessToken
    )
  }
}

export type ServerStatsBridge = typeof serverStatsBridge

