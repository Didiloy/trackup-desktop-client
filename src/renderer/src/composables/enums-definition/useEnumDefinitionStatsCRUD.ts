import { useUserStore } from '@/stores/user'
import type {
    IEnumValueDistribution,
    IPaginatedEnumDefinitionStats,
    IPaginatedEnumValueStats,
    IEnumDefinitionPaginationParams,
    IEnumDefinitionDetailsParams,
    IEnumValueDetailsParams,
    IEnumDefinitionStatsApiResponse
} from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'

interface UseEnumDefinitionStatsCRUDReturn {
    getAllEnumDefinitionStats: (
        serverId: string,
        params: IEnumDefinitionPaginationParams
    ) => Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumDefinitionStats>>
    getEnumDefinitionStats: (
        serverId: string,
        enumDefinitionId: string,
        params: IEnumDefinitionDetailsParams
    ) => Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>>
    getEnumValueStatsDistribution: (
        serverId: string,
        enumDefinitionId: string
    ) => Promise<IEnumDefinitionStatsApiResponse<IEnumValueDistribution>>
    getEnumValueStats: (
        serverId: string,
        enumDefinitionId: string,
        enumValueId: string,
        params: IEnumValueDetailsParams
    ) => Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>>
}

/**
 * Composable for Enum Definition Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useEnumDefinitionStatsCRUD(): UseEnumDefinitionStatsCRUDReturn {
    const user_store = useUserStore()

    /**
     * Get all enum enum-definitions statistics (paginated)
     */
    const getAllEnumDefinitionStats = async (
        serverId: string,
        params: IEnumDefinitionPaginationParams
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumDefinitionStats>> => {
        return window.api.enumDefinitionStats.getAllStats(
            serverId,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get enum definition statistics (paginated values)
     */
    const getEnumDefinitionStats = async (
        serverId: string,
        enumDefinitionId: string,
        params: IEnumDefinitionDetailsParams
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>> => {
        return window.api.enumDefinitionStats.getStats(
            serverId,
            enumDefinitionId,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get enum value distribution
     */
    const getEnumValueStatsDistribution = async (
        serverId: string,
        enumDefinitionId: string
    ): Promise<IEnumDefinitionStatsApiResponse<IEnumValueDistribution>> => {
        return window.api.enumDefinitionStats.getDistribution(
            serverId,
            enumDefinitionId,
            user_store.getAccessToken!
        )
    }

    /**
     * Get enum value statistics (paginated)
     */
    const getEnumValueStats = async (
        serverId: string,
        enumDefinitionId: string,
        enumValueId: string,
        params: IEnumValueDetailsParams
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>> => {
        return window.api.enumDefinitionStats.getValueStats(
            serverId,
            enumDefinitionId,
            enumValueId,
            params,
            user_store.getAccessToken!
        )
    }

    return {
        getAllEnumDefinitionStats,
        getEnumDefinitionStats,
        getEnumValueStatsDistribution,
        getEnumValueStats
    }
}
