import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { useSnapshotStatsCRUD } from '@/composables/snapshots/useSnapshotStatsCRUD'
import type {
    ISnapshot,
    ISnapshotLight,
    ISnapshotSummary,
    ISnapshotComparisonResult,
    IPaginatedSnapshots,
    ICreateSnapshotRequest,
    IGetSnapshotsParams,
    IGetLatestSnapshotParams,
    ICleanupSnapshotsParams,
    ICleanupSnapshotsResponse,
    ISnapshotApiResponse
} from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

interface PaginationState {
    page: number
    limit: number
    total: number
    pageCount: number
}

export const useSnapshotStatsStore = defineStore('snapshot-stats', () => {
    const {
        createSnapshotStats,
        getAllSnapshotsStats,
        getSnapshotStatsById,
        getLatestSnapshotStats,
        getSnapshotsStatsSummary,
        compareSnapshotsStats,
        cleanupSnapshotsStats
    } = useSnapshotStatsCRUD()

    const state = reactive({
        snapshots: [] as ISnapshotLight[],
        currentSnapshot: null as ISnapshot | null,
        summary: null as ISnapshotSummary | null,
        comparison: null as ISnapshotComparisonResult | null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pageCount: 0
        } as PaginationState,
        isLoading: false,
        error: null as string | null
    })

    // Getters
    const getSnapshots = computed(() => state.snapshots)
    const getCurrentSnapshot = computed(() => state.currentSnapshot)
    const getSummary = computed(() => state.summary)
    const getComparison = computed(() => state.comparison)
    const getPagination = computed(() => state.pagination)
    const isLoading = computed(() => state.isLoading)
    const getError = computed(() => state.error)

    // Actions
    const fetchSnapshots = async (
        serverId: string,
        params: IGetSnapshotsParams
    ): Promise<ISnapshotApiResponse<IPaginatedSnapshots>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getAllSnapshotsStats(serverId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            if (res.data) {
                state.snapshots = res.data.data
                state.pagination = {
                    page: res.data.page,
                    limit: res.data.limit,
                    total: res.data.total,
                    pageCount: res.data.pageCount
                }
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

    const fetchSnapshotById = async (
        serverId: string,
        snapshotId: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getSnapshotStatsById(serverId, snapshotId)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.currentSnapshot = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLoading = false
        }
    }

    const fetchLatestSnapshot = async (
        serverId: string,
        params: IGetLatestSnapshotParams
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getLatestSnapshotStats(serverId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
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

    const fetchSummary = async (serverId: string): Promise<ISnapshotApiResponse<ISnapshotSummary>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await getSnapshotsStatsSummary(serverId)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.summary = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLoading = false
        }
    }

    const createSnapshot = async (
        serverId: string,
        request: ICreateSnapshotRequest
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await createSnapshotStats(serverId, request)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
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

    const compareSnapshots = async (
        serverId: string,
        snapshotId1: string,
        snapshotId2: string
    ): Promise<ISnapshotApiResponse<ISnapshotComparisonResult>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await compareSnapshotsStats(serverId, snapshotId1, snapshotId2)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.comparison = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.isLoading = false
        }
    }

    const cleanupSnapshots = async (
        serverId: string,
        params?: ICleanupSnapshotsParams
    ): Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await cleanupSnapshotsStats(serverId, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
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

    const resetState = (): void => {
        state.snapshots = []
        state.currentSnapshot = null
        state.summary = null
        state.comparison = null
        state.pagination = {
            page: 1,
            limit: 10,
            total: 0,
            pageCount: 0
        }
        state.isLoading = false
        state.error = null
    }

    return {
        // State/Getters
        getSnapshots,
        getCurrentSnapshot,
        getSummary,
        getComparison,
        getPagination,
        isLoading,
        getError,

        // Actions
        fetchSnapshots,
        fetchSnapshotById,
        fetchLatestSnapshot,
        fetchSummary,
        createSnapshot,
        compareSnapshots,
        cleanupSnapshots,
        resetState
    }
})
