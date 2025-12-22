import { defineStore } from 'pinia'
import { reactive, computed, watch } from 'vue'
import { useServerStatsCRUD } from '@/composables/servers/useServerStatsCRUD'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import { useServerStore } from '@/stores/server'
import type {
    IServerStats,
    IServerStatsDetails,
    IStatsTimeline,
    IServerGrowthResponse,
    IComparativeAnalysis,
    IStatsTimelineParams,
    IStatsGrowthParams
} from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'

export const useServerStatsStore = defineStore('server-stats', () => {
    const {
        getServerStats,
        getServerStatsDetails,
        getServerStatsTimeline,
        getServerStatsGrowthTrends,
        getServerStatsComparativeAnalysis
    } = useServerStatsCRUD()

    const server_store = useServerStore()

    const state = reactive({
        details: null as IServerStatsDetails | null,
        stats: null as IServerStats | null,
        timeline: [] as IStatsTimeline[],
        growthTrends: null as IServerGrowthResponse | null,
        comparativeAnalysis: [] as IComparativeAnalysis[],
        isLoading: false,
        isTimelineLoading: false,
        error: null as string | null,

        // Filters
        selectedPeriodType: EPeriod.ALL_TIME as EPeriod | null,
        period: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()] as
            | Date[]
            | null
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

    const getSelectedPeriodType = computed(() => state.selectedPeriodType)
    const getPeriod = computed(() => state.period)

    const serverStats = computed(() => state.details?.server_stats || state.stats)

    const getFilteredTimeline = computed<IStatsTimeline[]>(() => {
        if (!state.timeline) return []

        // If a period type is selected (API filtered), return the whole timeline
        if (state.selectedPeriodType) return state.timeline

        if (!state.period || state.period.length !== 2 || !state.period[0] || !state.period[1]) {
            return state.timeline
        }

        const [start, end] = state.period
        // Reset hours to compare dates only
        const startDate = new Date(start)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)

        return state.timeline.filter((item) => {
            const itemDate = new Date(item.period)
            return itemDate >= startDate && itemDate <= endDate
        })
    })

    // Actions
    const fetchStats = async (serverId: string) => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getServerStats(serverId)
            if (res.error) throw new Error(res.error)
            state.stats = res.data ?? null
            return res
        } catch (e: any) {
            state.error = e.message
            return { error: e.message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchDetails = async (serverId: string) => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getServerStatsDetails(serverId)
            if (res.error) throw new Error(res.error)
            state.details = res.data ?? null
            if (res.data?.timeline) {
                state.timeline = res.data.timeline
            }
            return res
        } catch (e: any) {
            state.error = e.message
            return { error: e.message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchTimeline = async (serverId: string, params?: IStatsTimelineParams) => {
        state.isTimelineLoading = true
        state.error = null
        try {
            const res = await getServerStatsTimeline(serverId, params)
            if (res.error) throw new Error(res.error)
            state.timeline = res.data ?? []
            if (state.details) {
                state.details.timeline = state.timeline
            }
            return res
        } catch (e: any) {
            state.error = e.message
            return { error: e.message }
        } finally {
            state.isTimelineLoading = false
        }
    }

    const fetchGrowthTrends = async (serverId: string, params?: IStatsGrowthParams) => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getServerStatsGrowthTrends(serverId, params)
            if (res.error) throw new Error(res.error)
            state.growthTrends = res.data ?? null
            return res
        } catch (e: any) {
            state.error = e.message
            return { error: e.message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchComparativeAnalysis = async (serverId: string) => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getServerStatsComparativeAnalysis(serverId)
            if (res.error) throw new Error(res.error)
            state.comparativeAnalysis = res.data ?? []
            return res
        } catch (e: any) {
            state.error = e.message
            return { error: e.message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchAll = async (serverId: string) => {
        // Fetch base details first
        const res = await fetchDetails(serverId)

        // If we have a selected period type, fetch the specific timeline for it
        if (state.selectedPeriodType) {
            await fetchTimeline(serverId, {
                period: state.selectedPeriodType,
                limit: 365
            })
        }

        return res
    }

    const setPeriod = (p: Date[] | null) => {
        state.period = p
        if (p) {
            // Internally we use ALL_TIME (or null) when a custom range is set
            // The selector will visually show "Custom" because period is not null
            state.selectedPeriodType = EPeriod.ALL_TIME
        }
    }

    const setSelectedPeriodType = (type: EPeriod | null) => {
        state.selectedPeriodType = type
        if (type) {
            state.period = null
        }
    }

    const resetState = () => {
        state.details = null
        state.stats = null
        state.timeline = []
        state.growthTrends = null
        state.comparativeAnalysis = []
        state.isLoading = false
        state.isTimelineLoading = false
        state.error = null
        state.selectedPeriodType = EPeriod.ALL_TIME
        state.period = null
    }

    // Orchestration logic moved from component to store
    watch(
        () => state.selectedPeriodType,
        async (newType) => {
            const serverId = server_store.getPublicId
            if (!serverId) return

            if (newType) {
                await fetchTimeline(serverId, {
                    period: newType,
                    limit: 365
                })
            }
        }
    )

    // Watch for custom period changes to fetch enough data (Daily)
    watch(
        () => state.period,
        async (newPeriod) => {
            if (newPeriod && newPeriod.length === 2 && newPeriod[0] && newPeriod[1]) {
                const serverId = server_store.getPublicId
                if (!serverId) return

                // Fetch daily timeline to allow precise filtering on the frontend
                await fetchTimeline(serverId, {
                    period: EPeriod.DAILY,
                    limit: 365
                })
            }
        }
    )

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
        getSelectedPeriodType,
        getPeriod,
        getFilteredTimeline,

        // Actions
        fetchStats,
        fetchDetails,
        fetchTimeline,
        fetchGrowthTrends,
        fetchComparativeAnalysis,
        fetchAll,
        setPeriod,
        setSelectedPeriodType,
        resetState
    }
})
