/**
 * Activity Metadata Definition Statistics Bridge
 * Exposes activity metadata definition statistics API to the renderer process
 */

import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IPaginatedResponseOfMetadataDefinitionSummaryDto,
    IPaginatedResponseOfMetadataDefinitionDetailDto,
    IMetadataDistributionDto,
    IMetadataTimelineDto,
    IMetadataDefinitionStatsParams,
    IMetadataDefinitionTimelineParams,
    IActivityMetadataDefinitionStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/activity-metadata-definition-stats.interfaces'

export const activityMetadataDefinitionStatsBridge = {
    /**
     * Get all metadata enum-definitions statistics
     */
    getAll: (
        serverId: string,
        activityId: string,
        params: IMetadataDefinitionStatsParams,
        accessToken: string
    ): Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionSummaryDto>
    > => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinitionStats.getAll,
            serverId,
            activityId,
            params,
            accessToken
        )
    },

    /**
     * Get metadata definition statistics
     */
    getById: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        params: IMetadataDefinitionStatsParams,
        accessToken: string
    ): Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionDetailDto>
    > => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinitionStats.getById,
            serverId,
            activityId,
            metadataDefinitionId,
            params,
            accessToken
        )
    },

    /**
     * Get metadata value distribution
     */
    getDistribution: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        accessToken: string
    ): Promise<IActivityMetadataDefinitionStatsApiResponse<IMetadataDistributionDto>> => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinitionStats.getDistribution,
            serverId,
            activityId,
            metadataDefinitionId,
            accessToken
        )
    },

    /**
     * Get metadata value statistics
     */
    getValueStats: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        value: string,
        params: IMetadataDefinitionStatsParams,
        accessToken: string
    ): Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionDetailDto>
    > => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinitionStats.getValueStats,
            serverId,
            activityId,
            metadataDefinitionId,
            value,
            params,
            accessToken
        )
    },

    /**
     * Get metadata definition timeline
     */
    getTimeline: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        params: IMetadataDefinitionTimelineParams | undefined,
        accessToken: string
    ): Promise<IActivityMetadataDefinitionStatsApiResponse<IMetadataTimelineDto[]>> => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinitionStats.getTimeline,
            serverId,
            activityId,
            metadataDefinitionId,
            params,
            accessToken
        )
    }
}
