import { defineStore } from 'pinia'
import { reactive, computed, watch } from 'vue'
import { useSnapshotCRUD } from '@/composables/snapshots/useSnapshotCRUD'
import { useUserPreferencesStore } from '@/stores/user-preferences'
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

interface SnapshotState {
    snapshots: ISnapshotLight[]
    currentSnapshot: ISnapshot | null
    summary: ISnapshotSummary | null
    comparison: ISnapshotComparisonResult | null
    pagination: PaginationState
    isLoading: boolean
    isSummaryLoading: boolean
    isComparing: boolean
    error: string | null
    currentServerId: string | null
}

export const useSnapshotStore = defineStore('snapshot', () => {
    const {
        createSnapshot: createSnapshotApi,
        listSnapshots,
        getSnapshotById: getSnapshotByIdApi,
        getLatestSnapshot: getLatestSnapshotApi,
        getSnapshotsSummary,
        compareSnapshots: compareSnapshotsApi,
        deleteSnapshot: deleteSnapshotApi,
        cleanupSnapshots: cleanupSnapshotsApi
    } = useSnapshotCRUD()

    const state = reactive<SnapshotState>({
        snapshots: [],
        currentSnapshot: null,
        summary: null,
        comparison: null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pageCount: 0
        },
        isLoading: false,
        isSummaryLoading: false,
        isComparing: false,
        error: null,
        currentServerId: null
    })

    let autoFetchInterval: NodeJS.Timeout | null = null

    // Getters
    const snapshots = computed(() => state.snapshots)
    const currentSnapshot = computed(() => state.currentSnapshot)
    const summary = computed(() => state.summary)
    const comparison = computed(() => state.comparison)
    const pagination = computed(() => state.pagination)
    const isLoading = computed(() => state.isLoading)
    const isSummaryLoading = computed(() => state.isSummaryLoading)
    const isComparing = computed(() => state.isComparing)
    const error = computed(() => state.error)
    const isEmpty = computed(() => !state.isLoading && state.snapshots.length === 0)

    // Actions
    const fetchSnapshots = async (
        serverId: string,
        params: IGetSnapshotsParams
    ): Promise<ISnapshotApiResponse<IPaginatedSnapshots>> => {
        state.isLoading = true
        state.error = null
        state.currentServerId = serverId
        try {
            const res = await listSnapshots(serverId, params)
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
            const res = await getSnapshotByIdApi(serverId, snapshotId)
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
            const res = await getLatestSnapshotApi(serverId, params)
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
        state.isSummaryLoading = true
        state.error = null
        try {
            const res = await getSnapshotsSummary(serverId)
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
            state.isSummaryLoading = false
        }
    }

    const createSnapshot = async (
        serverId: string,
        request: ICreateSnapshotRequest
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await createSnapshotApi(serverId, request)
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
        state.isComparing = true
        state.error = null
        try {
            const res = await compareSnapshotsApi(serverId, snapshotId1, snapshotId2)
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
            state.isComparing = false
        }
    }

    const cleanupSnapshots = async (
        serverId: string,
        params?: ICleanupSnapshotsParams
    ): Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await cleanupSnapshotsApi(serverId, params)
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

    const deleteSnapshot = async (
        serverId: string,
        snapshotId: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.isLoading = true
        state.error = null
        try {
            const res = await deleteSnapshotApi(serverId, snapshotId)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            // Remove from local state if successful
            if (res.data) {
                state.snapshots = state.snapshots.filter((s) => s.id !== snapshotId)
                if (state.currentSnapshot?.id === snapshotId) {
                    state.currentSnapshot = null
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

    const clearComparison = (): void => {
        state.comparison = null
    }

    const setCurrentSnapshot = (snapshot: ISnapshot | null): void => {
        state.currentSnapshot = snapshot
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
        state.isSummaryLoading = false
        state.isComparing = false
        state.error = null
        stopAutoFetch()
        state.currentServerId = null
    }

    // Auto-fetch logic
    const startAutoFetch = (serverId: string): void => {
        stopAutoFetch()
        state.currentServerId = serverId
        const userPreferencesStore = useUserPreferencesStore()
        const intervalMs = userPreferencesStore.getAutoFetchIntervalMinutes * 60 * 1000

        autoFetchInterval = setInterval(() => {
            if (state.currentServerId) {
                fetchSnapshots(state.currentServerId, {
                    page: state.pagination.page,
                    limit: state.pagination.limit
                })
                fetchSummary(state.currentServerId)
            }
        }, intervalMs)
    }

    const stopAutoFetch = (): void => {
        if (autoFetchInterval) {
            clearInterval(autoFetchInterval)
            autoFetchInterval = null
        }
    }

    // Watch for preference changes to restart auto-fetch with new interval
    const userPreferencesStore = useUserPreferencesStore()
    watch(
        () => userPreferencesStore.getAutoFetchIntervalMinutes,
        () => {
            if (state.currentServerId) {
                startAutoFetch(state.currentServerId)
            }
        }
    )

    return {
        // State/Getters
        snapshots,
        currentSnapshot,
        summary,
        comparison,
        pagination,
        isLoading,
        isSummaryLoading,
        isComparing,
        error,
        isEmpty,

        // Actions
        fetchSnapshots,
        fetchSnapshotById,
        fetchLatestSnapshot,
        fetchSummary,
        createSnapshot,
        compareSnapshots,
        cleanupSnapshots,
        deleteSnapshot,
        clearComparison,
        setCurrentSnapshot,
        resetState,
        startAutoFetch,
        stopAutoFetch
    }
})
