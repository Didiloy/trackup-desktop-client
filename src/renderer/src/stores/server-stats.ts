import { defineStore } from 'pinia'
import { reactive, computed, watch } from 'vue'
import { useServerStatsCRUD } from '@/composables/servers/useServerStatsCRUD'
import { useUserPreferencesStore } from '@/stores/user-preferences'
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

interface IServerStatsCache {
    details: IServerStatsDetails
    timestamp: number
}

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

    // Cache for stats with TTL aligned with server cache
    const stats_cache = reactive<Map<string, IServerStatsCache>>(new Map())
    const STATS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes - aligned with server cache TTL

    let auto_fetch_interval: NodeJS.Timeout | null = null
    let current_server_id: string | null = null

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
        serverId: string,
        use_cache = true
    ): Promise<IServerStatsApiResponse<IServerStatsDetails>> => {
        // Check cache first if enabled
        const cached = use_cache ? getCachedStats(serverId) : null
        if (cached) {
            // Return cached data immediately
            state.details = cached
            if (cached.timeline) {
                state.timeline = cached.timeline
            }
            // Don't show loading state for cached data
            state.isLoading = false

            // If cache is fresh, return immediately without fetching
            if (isCacheFresh(serverId)) {
                return { data: cached }
            }

            // Cache exists but is stale - fetch in background to revalidate
            // Don't set isLoading to true, let it happen silently
        } else {
            // No cache, show loading state
            state.isLoading = true
        }

        state.error = null
        try {
            const res = await getServerStatsDetails(serverId)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }

            // Update state and cache
            state.details = res.data ?? null
            if (res.data?.timeline) {
                state.timeline = res.data.timeline
            }

            // Save to cache
            if (res.data) {
                setCachedStats(serverId, res.data)
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
        serverId: string,
        use_cache = true
    ): Promise<IServerStatsApiResponse<IServerStatsDetails>> => {
        // Fetch base details with cache support (stale-while-revalidate)
        return await fetchDetails(serverId, use_cache)
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
        stop_auto_fetch()
        current_server_id = null
        // Note: we don't clear the cache here to allow instant navigation between servers
    }

    // Cache helper functions
    const getCachedStats = (serverId: string): IServerStatsDetails | null => {
        const cached = stats_cache.get(serverId)
        if (!cached) return null
        return cached.details
    }

    const isCacheFresh = (serverId: string): boolean => {
        const cached = stats_cache.get(serverId)
        if (!cached) return false
        const now = Date.now()
        return (now - cached.timestamp) < STATS_CACHE_TTL
    }

    const setCachedStats = (serverId: string, details: IServerStatsDetails): void => {
        stats_cache.set(serverId, {
            details,
            timestamp: Date.now()
        })
    }

    const clearCache = (): void => {
        stats_cache.clear()
    }

    // Auto-fetch logic
    const start_auto_fetch = (serverId: string): void => {
        stop_auto_fetch()
        current_server_id = serverId
        const userPreferencesStore = useUserPreferencesStore()
        const intervalMs = userPreferencesStore.getAutoFetchIntervalMinutes * 60 * 1000

        auto_fetch_interval = setInterval(() => {
            if (current_server_id) {
                // Force refresh without cache for auto-fetch
                fetchAll(current_server_id, false)
            }
        }, intervalMs)
    }

    const stop_auto_fetch = (): void => {
        if (auto_fetch_interval) {
            clearInterval(auto_fetch_interval)
            auto_fetch_interval = null
        }
    }

    // Watch for preference changes to restart auto-fetch with new interval
    const userPreferencesStore = useUserPreferencesStore()
    watch(
        () => userPreferencesStore.getAutoFetchIntervalMinutes,
        () => {
            if (current_server_id) {
                start_auto_fetch(current_server_id)
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

        // Actions
        fetchStats,
        fetchDetails,
        fetchTimeline,
        fetchGrowthTrends,
        fetchComparativeAnalysis,
        fetchAll,
        resetState,
        start_auto_fetch,
        stop_auto_fetch,

        // Cache management
        getCachedStats,
        isCacheFresh,
        clearCache
    }
})
