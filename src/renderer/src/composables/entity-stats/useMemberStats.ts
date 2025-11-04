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
} from '../../../../shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import type { IStatsTimeline } from '../../../../shared/contracts/interfaces/entities-stats/server-stats.interfaces'

/**
 * Composable for Member Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useMemberStats() {
  const user_store = useUserStore()

  /**
   * Get member leaderboard
   */
  const getMemberLeaderboard = async (
    serverId: string,
    params?: ILeaderboardParams
  ): Promise<IMemberStatsApiResponse<IMemberLeaderboard>> => {
    return window.api.memberStats.getLeaderboard(serverId, params, user_store.getAccessToken!)
  }

  /**
   * Get all members statistics (paginated)
   */
  const getAllMemberStats = async (
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
  const getMemberDetails = async (
    serverId: string,
    memberId: string
  ): Promise<IMemberStatsApiResponse<IMemberStatsDetails>> => {
    return window.api.memberStats.getDetails(serverId, memberId, user_store.getAccessToken!)
  }

  /**
   * Get member activity patterns
   */
  const getMemberPatterns = async (
    serverId: string,
    memberId: string
  ): Promise<IMemberStatsApiResponse<IMemberActivityPatterns>> => {
    return window.api.memberStats.getPatterns(serverId, memberId, user_store.getAccessToken!)
  }

  /**
   * Get member ranking
   */
  const getMemberRanking = async (
    serverId: string,
    memberId: string
  ): Promise<IMemberStatsApiResponse<IMemberRanking>> => {
    return window.api.memberStats.getRanking(serverId, memberId, user_store.getAccessToken!)
  }

  /**
   * Get member timeline
   */
  const getMemberTimeline = async (
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
  const getMemberGrowthTrends = async (
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
    getMemberLeaderboard,
    getAllMemberStats,
    getMemberStats,
    getMemberDetails,
    getMemberPatterns,
    getMemberRanking,
    getMemberTimeline,
    getMemberGrowthTrends
  }
}
