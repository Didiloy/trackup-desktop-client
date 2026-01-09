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
    page_count: number
}

interface SnapshotState {
    snapshots: ISnapshotLight[]
    current_snapshot: ISnapshot | null
    summary: ISnapshotSummary | null
    comparison: ISnapshotComparisonResult | null
    pagination: PaginationState
    is_loading: boolean
    is_summary_loading: boolean
    is_comparing: boolean
    error: string | null
    last_fetch_params: IGetSnapshotsParams | null
    current_server_id: string | null
}

export const useSnapshotStore = defineStore('snapshot', () => {
    const {
        createSnapshot: create_snapshot_api,
        listSnapshots: list_snapshots,
        getSnapshotById: get_snapshot_by_id_api,
        getLatestSnapshot: get_latest_snapshot_api,
        getSnapshotsSummary: get_snapshots_summary,
        compareSnapshots: compare_snapshots_api,
        deleteSnapshot: delete_snapshot_api,
        cleanupSnapshots: cleanup_snapshots_api
    } = useSnapshotCRUD()

    const state = reactive<SnapshotState>({
        snapshots: [],
        current_snapshot: null,
        summary: null,
        comparison: null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            page_count: 0
        },
        is_loading: false,
        is_summary_loading: false,
        is_comparing: false,
        error: null,
        current_server_id: null,
        last_fetch_params: null
    })

    let auto_fetch_interval: NodeJS.Timeout | null = null

    // Getters
    const snapshots = computed(() => state.snapshots)
    const current_snapshot = computed(() => state.current_snapshot)
    const summary = computed(() => state.summary)
    const comparison = computed(() => state.comparison)
    const pagination = computed(() => state.pagination)
    const is_loading = computed(() => state.is_loading)
    const is_summary_loading = computed(() => state.is_summary_loading)
    const is_comparing = computed(() => state.is_comparing)
    const error = computed(() => state.error)
    const is_empty = computed(() => !state.is_loading && state.snapshots.length === 0)

    // Actions
    const fetch_snapshots = async (
        server_id: string,
        params: IGetSnapshotsParams
    ): Promise<ISnapshotApiResponse<IPaginatedSnapshots>> => {
        state.is_loading = true
        state.error = null
        state.current_server_id = server_id
        state.last_fetch_params = params
        try {
            const res = await list_snapshots(server_id, params)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            if (res.data) {
                // We keep the data in store for access by other components if needed,
                // but the primary consumer (SnapshotList) might use the return value directly via composable.
                state.snapshots = res.data.data
                state.pagination = {
                    page: res.data.page,
                    limit: res.data.limit,
                    total: res.data.total,
                    page_count: res.data.pageCount
                }
            }
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.is_loading = false
        }
    }

    const refresh = async (): Promise<ISnapshotApiResponse<IPaginatedSnapshots> | null> => {
        if (!state.current_server_id || !state.last_fetch_params) {
            return null
        }
        return fetch_snapshots(state.current_server_id, state.last_fetch_params)
    }

    const init = async (server_id: string): Promise<void> => {
        // Init just fetches summary now, list is handled by component
        // But we update current_server_id for auto-fetch context
        state.current_server_id = server_id
        await fetch_summary(server_id)
        // We can optionally fetch list here too if we want store to be populated initially,
        // but the component will trigger a fetch anyway.
        // Let's leave it to the component to trigger the first fetch of the list.
    }

    const fetch_snapshot_by_id = async (
        server_id: string,
        snapshot_id: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.is_loading = true
        state.error = null
        try {
            const res = await get_snapshot_by_id_api(server_id, snapshot_id)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            state.current_snapshot = res.data ?? null
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.is_loading = false
        }
    }

    const fetch_latest_snapshot = async (
        server_id: string,
        params: IGetLatestSnapshotParams
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.is_loading = true
        state.error = null
        try {
            const res = await get_latest_snapshot_api(server_id, params)
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
            state.is_loading = false
        }
    }

    const fetch_summary = async (
        server_id: string
    ): Promise<ISnapshotApiResponse<ISnapshotSummary>> => {
        state.is_summary_loading = true
        state.error = null
        state.current_server_id = server_id
        try {
            const res = await get_snapshots_summary(server_id)
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
            state.is_summary_loading = false
        }
    }

    const refresh_summary = async (): Promise<ISnapshotApiResponse<ISnapshotSummary> | null> => {
        if (!state.current_server_id) {
            return null
        }
        return fetch_summary(state.current_server_id)
    }

    const create_snapshot = async (
        server_id: string,
        request: ICreateSnapshotRequest
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.is_loading = true
        state.error = null
        try {
            const res = await create_snapshot_api(server_id, request)
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
            state.is_loading = false
        }
    }

    const compare_snapshots = async (
        server_id: string,
        snapshot_id1: string,
        snapshot_id2: string
    ): Promise<ISnapshotApiResponse<ISnapshotComparisonResult>> => {
        state.is_comparing = true
        state.error = null
        try {
            const res = await compare_snapshots_api(server_id, snapshot_id1, snapshot_id2)
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
            state.is_comparing = false
        }
    }

    const cleanup_snapshots = async (
        server_id: string,
        params?: ICleanupSnapshotsParams
    ): Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>> => {
        state.is_loading = true
        state.error = null
        try {
            const res = await cleanup_snapshots_api(server_id, params)
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
            state.is_loading = false
        }
    }

    const delete_snapshot = async (
        server_id: string,
        snapshot_id: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        state.is_loading = true
        state.error = null
        try {
            const res = await delete_snapshot_api(server_id, snapshot_id)
            if (res.error) {
                state.error = res.error
                return { error: res.error }
            }
            if (res.data) {
                state.snapshots = state.snapshots.filter((s) => s.id !== snapshot_id)
                if (state.current_snapshot?.id === snapshot_id) {
                    state.current_snapshot = null
                }
            }
            return res
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            state.error = message
            return { error: message }
        } finally {
            state.is_loading = false
        }
    }

    const clear_comparison = (): void => {
        state.comparison = null
    }

    const set_current_snapshot = (snapshot: ISnapshot | null): void => {
        state.current_snapshot = snapshot
    }

    const reset_state = (): void => {
        state.snapshots = []
        state.current_snapshot = null
        state.summary = null
        state.comparison = null
        state.pagination = {
            page: 1,
            limit: 10,
            total: 0,
            page_count: 0
        }
        state.is_loading = false
        state.is_summary_loading = false
        state.is_comparing = false
        state.error = null
        state.last_fetch_params = null
        stop_auto_fetch()
        state.current_server_id = null
    }

    const start_auto_fetch = (server_id: string): void => {
        stop_auto_fetch()
        state.current_server_id = server_id
        const user_preferences_store = useUserPreferencesStore()
        const interval_ms = user_preferences_store.getAutoFetchIntervalMinutes * 60 * 1000

        auto_fetch_interval = setInterval(() => {
            refresh()
            refresh_summary()
        }, interval_ms)
    }

    const stop_auto_fetch = (): void => {
        if (auto_fetch_interval) {
            clearInterval(auto_fetch_interval)
            auto_fetch_interval = null
        }
    }

    const user_preferences_store = useUserPreferencesStore()
    watch(
        () => user_preferences_store.getAutoFetchIntervalMinutes,
        () => {
            if (state.current_server_id) {
                start_auto_fetch(state.current_server_id)
            }
        }
    )

    return {
        // State/Getters
        snapshots,
        current_snapshot,
        summary,
        comparison,
        pagination,
        is_loading,
        is_summary_loading,
        is_comparing,
        error,
        is_empty,

        // Actions
        init,
        fetch_snapshots,
        fetch_snapshot_by_id,
        fetch_latest_snapshot,
        fetch_summary,
        refresh,
        refresh_summary,
        create_snapshot,
        compare_snapshots,
        cleanup_snapshots,
        delete_snapshot,
        clear_comparison,
        set_current_snapshot,
        reset_state,
        start_auto_fetch,
        stop_auto_fetch
    }
})
