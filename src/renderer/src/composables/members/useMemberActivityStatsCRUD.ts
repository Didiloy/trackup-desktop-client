import { useUserStore } from '@/stores/user'
import type {
    IMemberActivityDetails,
    IMemberActivityProgression,
    IPaginatedMemberActivityStats,
    IMemberActivityPaginationParams,
    IMemberActivityProgressionParams,
    IMemberActivityStatsApiResponse
} from '@shared/contracts/interfaces/entities-stats/member-activity-stats.interfaces'

interface UseMemberActivityStatsCRUDReturn {
    getAllMemberActivitiesStats: (
        serverId: string,
        memberId: string,
        params: IMemberActivityPaginationParams
    ) => Promise<IMemberActivityStatsApiResponse<IPaginatedMemberActivityStats>>
    getMemberActivityStats: (
        serverId: string,
        memberId: string,
        activityId: string
    ) => Promise<IMemberActivityStatsApiResponse<IMemberActivityDetails>>
    getMemberActivityStatsProgression: (
        serverId: string,
        memberId: string,
        activityId: string,
        params?: IMemberActivityProgressionParams
    ) => Promise<IMemberActivityStatsApiResponse<IMemberActivityProgression[]>>
}

/**
 * Composable for Member Activity Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useMemberActivityStatsCRUD(): UseMemberActivityStatsCRUDReturn {
    const user_store = useUserStore()

    /**
     * Get all activities for a member (paginated)
     */
    const getAllMemberActivitiesStats = async (
        serverId: string,
        memberId: string,
        params: IMemberActivityPaginationParams
    ): Promise<IMemberActivityStatsApiResponse<IPaginatedMemberActivityStats>> => {
        return window.api.memberActivityStats.getAllActivities(
            serverId,
            memberId,
            params,
            user_store.getAccessToken!
        )
    }

    /**
     * Get member statistics for a specific activity
     */
    const getMemberActivityStats = async (
        serverId: string,
        memberId: string,
        activityId: string
    ): Promise<IMemberActivityStatsApiResponse<IMemberActivityDetails>> => {
        return window.api.memberActivityStats.getActivityStats(
            serverId,
            memberId,
            activityId,
            user_store.getAccessToken!
        )
    }

    /**
     * Get member progression on an activity
     */
    const getMemberActivityStatsProgression = async (
        serverId: string,
        memberId: string,
        activityId: string,
        params?: IMemberActivityProgressionParams
    ): Promise<IMemberActivityStatsApiResponse<IMemberActivityProgression[]>> => {
        return window.api.memberActivityStats.getActivityProgression(
            serverId,
            memberId,
            activityId,
            params,
            user_store.getAccessToken!
        )
    }

    return {
        getAllMemberActivitiesStats,
        getMemberActivityStats,
        getMemberActivityStatsProgression
    }
}
