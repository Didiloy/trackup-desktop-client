import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
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

export const useActivityStatsStore = defineStore('activity-stats', () => {
    const {
        getActivitiesStatsLeaderboard,
        getAllActivitiesStats,
        getActivityStats,
        getActivityStatsDetails,
        getActivityStatsPatterns,
        getActivityStatsRanking,
        getActivityStatsTimeline,
        getActivityStatsGrowthTrends
    } = useActivityStatsCRUD()

    const state = reactive({
        details: null as IActivityStatsDetails | null,
        leaderboard: null as IActivityLeaderboard | null,
        paginatedStats: null as IPaginatedActivityStats | null,
        patterns: null as IActivityTimePatterns | null,
        ranking: null as IActivityRanking | null,
        timeline: [] as IStatsTimeline[],
        growthTrends: null as IActivityGrowthTrends | null,
        stats: null as IActivityStats | null,
        isLoading: false,
        isTimelineLoading: false,
        isGrowthLoading: false,
        isRankingLoading: false,
        isLeaderboardLoading: false,
        error: null as string | null
    })

    // Getters
    const getDetails = computed(() => state.details)
    const getLeaderboard = computed(() => state.leaderboard)
    const getPaginatedStats = computed(() => state.paginatedStats)
    const getPatterns = computed(() => state.patterns)
    const getRanking = computed(() => state.ranking)
    const getTimeline = computed(() => state.timeline)
    const getGrowthTrends = computed(() => state.growthTrends)
    const getStats = computed(() => state.stats)
    const isLoading = computed(() => state.isLoading)
    const isTimelineLoading = computed(() => state.isTimelineLoading)
    const isGrowthLoading = computed(() => state.isGrowthLoading)
    const isRankingLoading = computed(() => state.isRankingLoading)
    const isLeaderboardLoading = computed(() => state.isLeaderboardLoading)
    const getError = computed(() => state.error)

    // Actions
    const fetchLeaderboard = async (
        serverId: string,
        params?: IActivityLeaderboardParams
    ): Promise<IActivityStatsApiResponse<IActivityLeaderboard>> => {
        state.isLeaderboardLoading = true
        state.error = null
        try {
            const res = await getActivitiesStatsLeaderboard(serverId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.leaderboard = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLeaderboardLoading = false
        }
    }

    const fetchAllStats = async (
        serverId: string,
        params: IActivityPaginationParams
    ): Promise<IActivityStatsApiResponse<IPaginatedActivityStats>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getAllActivitiesStats(serverId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.paginatedStats = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchStats = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityStatsApiResponse<IActivityStats>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getActivityStats(serverId, activityId)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.stats = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchDetails = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityStatsApiResponse<IActivityStatsDetails>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getActivityStatsDetails(serverId, activityId)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.details = res.data ?? null
            if (res.data?.timeline) {
                state.timeline = res.data.timeline
            }
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchPatterns = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityStatsApiResponse<IActivityTimePatterns>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getActivityStatsPatterns(serverId, activityId)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.patterns = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchRanking = async (
        serverId: string,
        activityId: string,
        params?: IActivityRankingParams
    ): Promise<IActivityStatsApiResponse<IActivityRanking>> => {
        state.isRankingLoading = true
        state.error = null
        try {
            const res = await getActivityStatsRanking(serverId, activityId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.ranking = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isRankingLoading = false
        }
    }

    const fetchTimeline = async (
        serverId: string,
        activityId: string,
        params?: IActivityTimelineParams
    ): Promise<IActivityStatsApiResponse<IStatsTimeline[]>> => {
        state.isTimelineLoading = true
        state.error = null
        try {
            const res = await getActivityStatsTimeline(serverId, activityId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.timeline = res.data ?? []
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isTimelineLoading = false
        }
    }

    const fetchGrowthTrends = async (
        serverId: string,
        activityId: string,
        params?: IActivityGrowthParams
    ): Promise<IActivityStatsApiResponse<IActivityGrowthTrends>> => {
        state.isGrowthLoading = true
        state.error = null
        try {
            const res = await getActivityStatsGrowthTrends(serverId, activityId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.growthTrends = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isGrowthLoading = false
        }
    }

    const resetState = (): void => {
        state.details = null
        state.leaderboard = null
        state.paginatedStats = null
        state.patterns = null
        state.ranking = null
        state.timeline = []
        state.growthTrends = null
        state.stats = null
        state.isLoading = false
        state.isTimelineLoading = false
        state.isGrowthLoading = false
        state.isRankingLoading = false
        state.isLeaderboardLoading = false
        state.error = null
    }

    return {
        // State/Getters
        getDetails,
        getLeaderboard,
        getPaginatedStats,
        getPatterns,
        getRanking,
        getTimeline,
        getGrowthTrends,
        getStats,
        isLoading,
        isTimelineLoading,
        isGrowthLoading,
        isRankingLoading,
        isLeaderboardLoading,
        getError,

        // Actions
        fetchLeaderboard,
        fetchAllStats,
        fetchStats,
        fetchDetails,
        fetchPatterns,
        fetchRanking,
        fetchTimeline,
        fetchGrowthTrends,
        resetState
    }
})
