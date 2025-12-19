import { useUserStore } from '@/stores/user'
import type {
    IPaginatedResponseOfMetadataDefinitionSummaryDto,
    IPaginatedResponseOfMetadataDefinitionDetailDto,
    IMetadataDistributionDto,
    IMetadataTimelineDto,
    IMetadataDefinitionStatsParams,
    IMetadataDefinitionTimelineParams,
    IActivityMetadataDefinitionStatsApiResponse
} from '@shared/contracts/interfaces/entities-stats/activity-metadata-definition-stats.interfaces'

interface UseActivityMetadataDefinitionStatsCRUDReturn {
    getAllMetadataDefinitionsStats: (
        serverId: string,
        activityId: string,
        params: IMetadataDefinitionStatsParams
    ) => Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionSummaryDto>
    >
    getMetadataDefinitionStats: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        params: IMetadataDefinitionStatsParams
    ) => Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionDetailDto>
    >
    getMetadataValueStatsDistribution: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string
    ) => Promise<IActivityMetadataDefinitionStatsApiResponse<IMetadataDistributionDto>>
    getMetadataValueStats: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        value: string,
        params: IMetadataDefinitionStatsParams
    ) => Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionDetailDto>
    >
    getMetadataDefinitionStatsTimeline: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        params?: IMetadataDefinitionTimelineParams
    ) => Promise<IActivityMetadataDefinitionStatsApiResponse<IMetadataTimelineDto[]>>
}

/**
 * Composable for Activity Metadata Definition Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useActivityMetadataDefinitionStatsCRUD(): UseActivityMetadataDefinitionStatsCRUDReturn {
    const user_store = useUserStore()

    /**
     * Get all metadata definitions statistics
     */
    const getAllMetadataDefinitionsStats = async (
        serverId: string,
        activityId: string,
        params: IMetadataDefinitionStatsParams
    ): Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionSummaryDto>
    > => {
        return window.api.activityMetadataDefinitionStats.getAll(
            serverId,
            activityId,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get metadata definition statistics
     */
    const getMetadataDefinitionStats = async (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        params: IMetadataDefinitionStatsParams
    ): Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionDetailDto>
    > => {
        return window.api.activityMetadataDefinitionStats.getById(
            serverId,
            activityId,
            metadataDefinitionId,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get metadata value distribution
     */
    const getMetadataValueStatsDistribution = async (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string
    ): Promise<IActivityMetadataDefinitionStatsApiResponse<IMetadataDistributionDto>> => {
        return window.api.activityMetadataDefinitionStats.getDistribution(
            serverId,
            activityId,
            metadataDefinitionId,
            user_store.getAccessToken!
        )
    }

    /**
     * Get metadata value statistics
     */
    const getMetadataValueStats = async (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        value: string,
        params: IMetadataDefinitionStatsParams
    ): Promise<
        IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionDetailDto>
    > => {
        return window.api.activityMetadataDefinitionStats.getValueStats(
            serverId,
            activityId,
            metadataDefinitionId,
            value,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get metadata definition timeline
     */
    const getMetadataDefinitionStatsTimeline = async (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        params?: IMetadataDefinitionTimelineParams
    ): Promise<IActivityMetadataDefinitionStatsApiResponse<IMetadataTimelineDto[]>> => {
        return window.api.activityMetadataDefinitionStats.getTimeline(
            serverId,
            activityId,
            metadataDefinitionId,
            params,
            user_store.getAccessToken!
        )
    }

    return {
        getAllMetadataDefinitionsStats,
        getMetadataDefinitionStats,
        getMetadataDefinitionStatsTimeline,
        getMetadataValueStats,
        getMetadataValueStatsDistribution
    }
}
