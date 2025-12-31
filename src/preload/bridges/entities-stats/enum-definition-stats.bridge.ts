/**
 * Enum Definition Statistics Bridge
 * Exposes enum definition statistics API to the renderer process
 */

import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IEnumValueDistribution,
    IPaginatedEnumDefinitionStats,
    IPaginatedEnumValueStats,
    IEnumDefinitionPaginationParams,
    IEnumDefinitionDetailsParams,
    IEnumValueDetailsParams,
    IEnumDefinitionStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'

export const enumDefinitionStatsBridge = {
    /**
     * Get all enum enum-definitions statistics (paginated)
     */
    getAllStats: (
        serverId: string,
        params: IEnumDefinitionPaginationParams,
        accessToken: string
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumDefinitionStats>> => {
        return ipcRenderer.invoke(
            ipc_channels.enumDefinitionStats.getAllStats,
            serverId,
            params,
            accessToken
        )
    },

    /**
     * Get enum definition statistics (paginated values)
     */
    getStats: (
        serverId: string,
        enumDefinitionId: string,
        params: IEnumDefinitionDetailsParams,
        accessToken: string
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>> => {
        return ipcRenderer.invoke(
            ipc_channels.enumDefinitionStats.getStats,
            serverId,
            enumDefinitionId,
            params,
            accessToken
        )
    },

    /**
     * Get enum value distribution
     */
    getDistribution: (
        serverId: string,
        enumDefinitionId: string,
        accessToken: string
    ): Promise<IEnumDefinitionStatsApiResponse<IEnumValueDistribution>> => {
        return ipcRenderer.invoke(
            ipc_channels.enumDefinitionStats.getDistribution,
            serverId,
            enumDefinitionId,
            accessToken
        )
    },

    /**
     * Get enum value statistics (paginated)
     */
    getValueStats: (
        serverId: string,
        enumDefinitionId: string,
        enumValueId: string,
        params: IEnumValueDetailsParams,
        accessToken: string
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>> => {
        return ipcRenderer.invoke(
            ipc_channels.enumDefinitionStats.getValueStats,
            serverId,
            enumDefinitionId,
            enumValueId,
            params,
            accessToken
        )
    }
}

export type EnumDefinitionStatsBridge = typeof enumDefinitionStatsBridge
