/**
 * Member Activity Statistics Bridge
 * Exposes member activity statistics API to the renderer process
 */

import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IMemberActivityDetails,
    IMemberActivityProgression,
    IPaginatedMemberActivityStats,
    IMemberActivityPaginationParams,
    IMemberActivityProgressionParams,
    IMemberActivityStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/member-activity-stats.interfaces'

export const memberActivityStatsBridge = {
    /**
     * Get all activities for a member (paginated)
     */
    getAllActivities: (
        serverId: string,
        memberId: string,
        params: IMemberActivityPaginationParams,
        accessToken: string
    ): Promise<IMemberActivityStatsApiResponse<IPaginatedMemberActivityStats>> => {
        return ipcRenderer.invoke(
            ipc_channels.memberActivityStats.getAllActivities,
            serverId,
            memberId,
            params,
            accessToken
        )
    },

    /**
     * Get member statistics for a specific activity
     */
    getActivityStats: (
        serverId: string,
        memberId: string,
        activityId: string,
        accessToken: string
    ): Promise<IMemberActivityStatsApiResponse<IMemberActivityDetails>> => {
        return ipcRenderer.invoke(
            ipc_channels.memberActivityStats.getActivityStats,
            serverId,
            memberId,
            activityId,
            accessToken
        )
    },

    /**
     * Get member progression on an activity
     */
    getActivityProgression: (
        serverId: string,
        memberId: string,
        activityId: string,
        params: IMemberActivityProgressionParams | undefined,
        accessToken: string
    ): Promise<IMemberActivityStatsApiResponse<IMemberActivityProgression[]>> => {
        return ipcRenderer.invoke(
            ipc_channels.memberActivityStats.getActivityProgression,
            serverId,
            memberId,
            activityId,
            params,
            accessToken
        )
    }
}

export type MemberActivityStatsBridge = typeof memberActivityStatsBridge
