import { useUserStore } from '@/stores/user'
import type {
    IServerStats,
    IServerStatsDetails,
    IStatsTimeline,
    IServerGrowthResponse,
    IComparativeAnalysis,
    IStatsTimelineParams,
    IStatsGrowthParams,
    IServerStatsApiResponse
} from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'

interface UseServerStatsCRUDReturn {
    getServerStats: (serverId: string) => Promise<IServerStatsApiResponse<IServerStats>>
    getServerStatsDetails: (
        serverId: string
    ) => Promise<IServerStatsApiResponse<IServerStatsDetails>>
    getServerStatsTimeline: (
        serverId: string,
        params?: IStatsTimelineParams
    ) => Promise<IServerStatsApiResponse<IStatsTimeline[]>>
    getServerStatsGrowthTrends: (
        serverId: string,
        params?: IStatsGrowthParams
    ) => Promise<IServerStatsApiResponse<IServerGrowthResponse>>
    getServerStatsComparativeAnalysis: (
        serverId: string
    ) => Promise<IServerStatsApiResponse<IComparativeAnalysis[]>>
}

/**
 * Composable for Server Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useServerStatsCRUD(): UseServerStatsCRUDReturn {
    const user_store = useUserStore()

    /**
     * Get servers statistics
     */
    const getServerStats = async (
        serverId: string
    ): Promise<IServerStatsApiResponse<IServerStats>> => {
        return window.api.serverStats.getStats(serverId, user_store.getAccessToken!)
    }

    /**
     * Get complete servers stats details
     */
    const getServerStatsDetails = async (
        serverId: string
    ): Promise<IServerStatsApiResponse<IServerStatsDetails>> => {
        return window.api.serverStats.getDetails(serverId, user_store.getAccessToken!)
    }

    /**
     * Get servers timeline
     */
    const getServerStatsTimeline = async (
        serverId: string,
        params?: IStatsTimelineParams
    ): Promise<IServerStatsApiResponse<IStatsTimeline[]>> => {
        return window.api.serverStats.getTimeline(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get servers growth trends
     */
    const getServerStatsGrowthTrends = async (
        serverId: string,
        params?: IStatsGrowthParams
    ): Promise<IServerStatsApiResponse<IServerGrowthResponse>> => {
        return window.api.serverStats.getGrowthTrends(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get comparative analysis
     */
    const getServerStatsComparativeAnalysis = async (
        serverId: string
    ): Promise<IServerStatsApiResponse<IComparativeAnalysis[]>> => {
        return window.api.serverStats.getComparativeAnalysis(serverId, user_store.getAccessToken!)
    }

    return {
        getServerStats,
        getServerStatsDetails,
        getServerStatsTimeline,
        getServerStatsGrowthTrends,
        getServerStatsComparativeAnalysis
    }
}
