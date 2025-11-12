import { useUserStore } from '@/stores/user'
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
} from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'

interface UseActivityStatsCRUDReturn {
    getActivityLeaderboard: (
        serverId: string,
        params?: IActivityLeaderboardParams
    ) => Promise<IActivityStatsApiResponse<IActivityLeaderboard>>
    getAllActivityStats: (
        serverId: string,
        params: IActivityPaginationParams
    ) => Promise<IActivityStatsApiResponse<IPaginatedActivityStats>>
    getActivityStats: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityStatsApiResponse<IActivityStats>>
    getActivityDetails: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityStatsApiResponse<IActivityStatsDetails>>
    getActivityPatterns: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityStatsApiResponse<IActivityTimePatterns>>
    getActivityRanking: (
        serverId: string,
        activityId: string,
        params?: IActivityRankingParams
    ) => Promise<IActivityStatsApiResponse<IActivityRanking>>
    getActivityTimeline: (
        serverId: string,
        activityId: string,
        params?: IActivityTimelineParams
    ) => Promise<IActivityStatsApiResponse<IStatsTimeline[]>>
    getActivityGrowthTrends: (
        serverId: string,
        activityId: string,
        params?: IActivityGrowthParams
    ) => Promise<IActivityStatsApiResponse<IActivityGrowthTrends>>
}

/**
 * Composable for Activity Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useActivityStatsCRUD(): UseActivityStatsCRUDReturn {
    const user_store = useUserStore()

    /**
     * Get activity leaderboard
     */
    const getActivityLeaderboard = async (
        serverId: string,
        params?: IActivityLeaderboardParams
    ): Promise<IActivityStatsApiResponse<IActivityLeaderboard>> => {
        return window.api.activityStats.getLeaderboard(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get all activities statistics (paginated)
     */
    const getAllActivityStats = async (
        serverId: string,
        params: IActivityPaginationParams
    ): Promise<IActivityStatsApiResponse<IPaginatedActivityStats>> => {
        return window.api.activityStats.getAllStats(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get activity statistics
     */
    const getActivityStats = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityStatsApiResponse<IActivityStats>> => {
        return window.api.activityStats.getStats(serverId, activityId, user_store.getAccessToken!)
    }

    /**
     * Get complete activity details
     */
    const getActivityDetails = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityStatsApiResponse<IActivityStatsDetails>> => {
        return window.api.activityStats.getDetails(serverId, activityId, user_store.getAccessToken!)
    }

    /**
     * Get activity time patterns
     */
    const getActivityPatterns = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityStatsApiResponse<IActivityTimePatterns>> => {
        return window.api.activityStats.getPatterns(
            serverId,
            activityId,
            user_store.getAccessToken!
        )
    }

    /**
     * Get activity ranking
     */
    const getActivityRanking = async (
        serverId: string,
        activityId: string,
        params?: IActivityRankingParams
    ): Promise<IActivityStatsApiResponse<IActivityRanking>> => {
        return window.api.activityStats.getRanking(
            serverId,
            activityId,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get activity timeline
     */
    const getActivityTimeline = async (
        serverId: string,
        activityId: string,
        params?: IActivityTimelineParams
    ): Promise<IActivityStatsApiResponse<IStatsTimeline[]>> => {
        return window.api.activityStats.getTimeline(
            serverId,
            activityId,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get activity growth trends
     */
    const getActivityGrowthTrends = async (
        serverId: string,
        activityId: string,
        params?: IActivityGrowthParams
    ): Promise<IActivityStatsApiResponse<IActivityGrowthTrends>> => {
        return window.api.activityStats.getGrowthTrends(
            serverId,
            activityId,
            params,
            user_store.getAccessToken!
        )
    }

    return {
        getActivityLeaderboard,
        getAllActivityStats,
        getActivityStats,
        getActivityDetails,
        getActivityPatterns,
        getActivityRanking,
        getActivityTimeline,
        getActivityGrowthTrends
    }
}
