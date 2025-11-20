import { useUserStore } from '@/stores/user'
import type {
    IMemberStats,
    IMemberStatsDetails,
    IMemberActivityPatterns,
    IMemberRanking,
    IMemberGrowthTrends,
    IMemberLeaderboard,
    IPaginatedMemberStats,
    ILeaderboardParams,
    IPaginationParams,
    IMemberTimelineParams,
    IMemberGrowthParams,
    IMemberStatsApiResponse
} from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'

interface UseMemberStatsCRUDReturn {
    getMembersStatsLeaderboard: (
        serverId: string,
        params?: ILeaderboardParams
    ) => Promise<IMemberStatsApiResponse<IMemberLeaderboard>>
    getAllMembersStats: (
        serverId: string,
        params: IPaginationParams
    ) => Promise<IMemberStatsApiResponse<IPaginatedMemberStats>>
    getMemberStats: (
        serverId: string,
        memberId: string
    ) => Promise<IMemberStatsApiResponse<IMemberStats>>
    getMemberStatsDetails: (
        serverId: string,
        memberId: string
    ) => Promise<IMemberStatsApiResponse<IMemberStatsDetails>>
    getMemberStatsPatterns: (
        serverId: string,
        memberId: string
    ) => Promise<IMemberStatsApiResponse<IMemberActivityPatterns>>
    getMemberStatsRanking: (
        serverId: string,
        memberId: string
    ) => Promise<IMemberStatsApiResponse<IMemberRanking>>
    getMemberStatsTimeline: (
        serverId: string,
        memberId: string,
        params?: IMemberTimelineParams
    ) => Promise<IMemberStatsApiResponse<IStatsTimeline[]>>
    getMemberStatsGrowthTrends: (
        serverId: string,
        memberId: string,
        params?: IMemberGrowthParams
    ) => Promise<IMemberStatsApiResponse<IMemberGrowthTrends>>
}

/**
 * Composable for Member Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useMemberStatsCRUD(): UseMemberStatsCRUDReturn {
    const user_store = useUserStore()

    /**
     * Get member leaderboard
     */
    const getMembersStatsLeaderboard = async (
        serverId: string,
        params?: ILeaderboardParams
    ): Promise<IMemberStatsApiResponse<IMemberLeaderboard>> => {
        return window.api.memberStats.getLeaderboard(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get all members statistics (paginated)
     */
    const getAllMembersStats = async (
        serverId: string,
        params: IPaginationParams
    ): Promise<IMemberStatsApiResponse<IPaginatedMemberStats>> => {
        return window.api.memberStats.getAllStats(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get member statistics
     */
    const getMemberStats = async (
        serverId: string,
        memberId: string
    ): Promise<IMemberStatsApiResponse<IMemberStats>> => {
        return window.api.memberStats.getStats(serverId, memberId, user_store.getAccessToken!)
    }

    /**
     * Get complete member details
     */
    const getMemberStatsDetails = async (
        serverId: string,
        memberId: string
    ): Promise<IMemberStatsApiResponse<IMemberStatsDetails>> => {
        return window.api.memberStats.getDetails(serverId, memberId, user_store.getAccessToken!)
    }

    /**
     * Get member activity patterns
     */
    const getMemberStatsPatterns = async (
        serverId: string,
        memberId: string
    ): Promise<IMemberStatsApiResponse<IMemberActivityPatterns>> => {
        return window.api.memberStats.getPatterns(serverId, memberId, user_store.getAccessToken!)
    }

    /**
     * Get member ranking
     */
    const getMemberStatsRanking = async (
        serverId: string,
        memberId: string
    ): Promise<IMemberStatsApiResponse<IMemberRanking>> => {
        return window.api.memberStats.getRanking(serverId, memberId, user_store.getAccessToken!)
    }

    /**
     * Get member timeline
     */
    const getMemberStatsTimeline = async (
        serverId: string,
        memberId: string,
        params?: IMemberTimelineParams
    ): Promise<IMemberStatsApiResponse<IStatsTimeline[]>> => {
        return window.api.memberStats.getTimeline(
            serverId,
            memberId,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get member growth trends
     */
    const getMemberStatsGrowthTrends = async (
        serverId: string,
        memberId: string,
        params?: IMemberGrowthParams
    ): Promise<IMemberStatsApiResponse<IMemberGrowthTrends>> => {
        return window.api.memberStats.getGrowthTrends(
            serverId,
            memberId,
            params,
            user_store.getAccessToken!
        )
    }

    return {
        getMembersStatsLeaderboard,
        getAllMembersStats,
        getMemberStats,
        getMemberStatsDetails,
        getMemberStatsPatterns,
        getMemberStatsRanking,
        getMemberStatsTimeline,
        getMemberStatsGrowthTrends
    }
}
