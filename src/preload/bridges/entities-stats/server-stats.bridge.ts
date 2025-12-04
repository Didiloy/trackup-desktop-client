/**
 * Server Statistics Bridge
 * Exposes servers statistics API to the renderer process
 */

import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IServerStats,
    IServerStatsDetails,
    IStatsTimeline,
    IServerGrowthResponse,
    IComparativeAnalysis,
    IStatsTimelineParams,
    IStatsGrowthParams,
    IServerStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/server-stats.interfaces'

export const serverStatsBridge = {
    /**
     * Get servers statistics
     */
    getStats: (
        serverId: string,
        accessToken: string
    ): Promise<IServerStatsApiResponse<IServerStats>> => {
        return ipcRenderer.invoke(ipc_channels.serverStats.getStats, serverId, accessToken)
    },

    /**
     * Get complete servers stats details
     */
    getDetails: (
        serverId: string,
        accessToken: string
    ): Promise<IServerStatsApiResponse<IServerStatsDetails>> => {
        return ipcRenderer.invoke(ipc_channels.serverStats.getDetails, serverId, accessToken)
    },

    /**
     * Get servers timeline
     */
    getTimeline: (
        serverId: string,
        params: IStatsTimelineParams | undefined,
        accessToken: string
    ): Promise<IServerStatsApiResponse<IStatsTimeline[]>> => {
        return ipcRenderer.invoke(
            ipc_channels.serverStats.getTimeline,
            serverId,
            params,
            accessToken
        )
    },

    /**
     * Get servers growth trends
     */
    getGrowthTrends: (
        serverId: string,
        params: IStatsGrowthParams | undefined,
        accessToken: string
    ): Promise<IServerStatsApiResponse<IServerGrowthResponse>> => {
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
