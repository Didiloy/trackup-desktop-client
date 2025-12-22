import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { useServerStatsCRUD } from '@/composables/servers/useServerStatsCRUD'
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

export const useServerStatsStore = defineStore('server-stats', () => {
    const {
        getServerStats,
        getServerStatsDetails,
        getServerStatsTimeline,
        getServerStatsGrowthTrends,
        getServerStatsComparativeAnalysis
    } = useServerStatsCRUD()

    const state = reactive({
        details: null as IServerStatsDetails | null,
        stats: null as IServerStats | null,
        timeline: [] as IStatsTimeline[],
        growthTrends: null as IServerGrowthResponse | null,
        comparativeAnalysis: [] as IComparativeAnalysis[],
        isLoading: false,
        isTimelineLoading: false,
        error: null as string | null
    })

    // Getters
    const getDetails = computed(() => state.details)
    const getStats = computed(() => state.stats)
    const getTimeline = computed(() => state.timeline)
    const getGrowthTrends = computed(() => state.growthTrends)
    const getComparativeAnalysis = computed(() => state.comparativeAnalysis)
    const isLoading = computed(() => state.isLoading)
    const isTimelineLoading = computed(() => state.isTimelineLoading)
    const getError = computed(() => state.error)
    const serverStats = computed(() => state.details?.server_stats || state.stats)

    // Actions
    const fetchStats = async (serverId: string): Promise<IServerStatsApiResponse<IServerStats>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getServerStats(serverId)
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
        serverId: string
    ): Promise<IServerStatsApiResponse<IServerStatsDetails>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getServerStatsDetails(serverId)
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

    const fetchTimeline = async (
        serverId: string,
        params?: IStatsTimelineParams
    ): Promise<IServerStatsApiResponse<IStatsTimeline[]>> => {
        state.isTimelineLoading = true
        state.error = null
        try {
            const res = await getServerStatsTimeline(serverId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.timeline = res.data ?? []
            if (state.details) {
                state.details.timeline = state.timeline
            }
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
        params?: IStatsGrowthParams
    ): Promise<IServerStatsApiResponse<IServerGrowthResponse>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getServerStatsGrowthTrends(serverId, params)
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
            state.isLoading = false
        }
    }

    const fetchComparativeAnalysis = async (
        serverId: string
    ): Promise<IServerStatsApiResponse<IComparativeAnalysis[]>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getServerStatsComparativeAnalysis(serverId)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.comparativeAnalysis = res.data ?? []
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchAll = async (
        serverId: string
    ): Promise<IServerStatsApiResponse<IServerStatsDetails>> => {
        // Fetch base details first
        return await fetchDetails(serverId)
    }

    const resetState = (): void => {
        state.details = null
        state.stats = null
        state.timeline = []
        state.growthTrends = null
        state.comparativeAnalysis = []
        state.isLoading = false
        state.isTimelineLoading = false
        state.error = null
    }

    return {
        // State/Getters
        getDetails,
        getStats,
        getTimeline,
        getGrowthTrends,
        getComparativeAnalysis,
        isLoading,
        isTimelineLoading,
        getError,
        serverStats,

        // Actions
        fetchStats,
        fetchDetails,
        fetchTimeline,
        fetchGrowthTrends,
        fetchComparativeAnalysis,
        fetchAll,
        resetState
    }
})
