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
    getActivitiesStatsLeaderboard: (
        serverId: string,
        params?: IActivityLeaderboardParams
    ) => Promise<IActivityStatsApiResponse<IActivityLeaderboard>>
    getAllActivitiesStats: (
        serverId: string,
        params: IActivityPaginationParams
    ) => Promise<IActivityStatsApiResponse<IPaginatedActivityStats>>
    getActivityStats: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityStatsApiResponse<IActivityStats>>
    getActivityStatsDetails: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityStatsApiResponse<IActivityStatsDetails>>
    getActivityStatsPatterns: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityStatsApiResponse<IActivityTimePatterns>>
    getActivityStatsRanking: (
        serverId: string,
        activityId: string,
        params?: IActivityRankingParams
    ) => Promise<IActivityStatsApiResponse<IActivityRanking>>
    getActivityStatsTimeline: (
        serverId: string,
        activityId: string,
        params?: IActivityTimelineParams
    ) => Promise<IActivityStatsApiResponse<IStatsTimeline[]>>
    getActivityStatsGrowthTrends: (
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
     * Get activities leaderboard
     */
    const getActivitiesStatsLeaderboard = async (
        serverId: string,
        params?: IActivityLeaderboardParams
    ): Promise<IActivityStatsApiResponse<IActivityLeaderboard>> => {
        return window.api.activityStats.getLeaderboard(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get all activities statistics (paginated)
     */
    const getAllActivitiesStats = async (
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
    const getActivityStatsDetails = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityStatsApiResponse<IActivityStatsDetails>> => {
        return window.api.activityStats.getDetails(serverId, activityId, user_store.getAccessToken!)
    }

    /**
     * Get activity time patterns
     */
    const getActivityStatsPatterns = async (
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
    const getActivityStatsRanking = async (
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
    const getActivityStatsTimeline = async (
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
    const getActivityStatsGrowthTrends = async (
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
        getActivitiesStatsLeaderboard,
        getAllActivitiesStats,
        getActivityStats,
        getActivityStatsDetails,
        getActivityStatsPatterns,
        getActivityStatsRanking,
        getActivityStatsTimeline,
        getActivityStatsGrowthTrends
    }
}
