
import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { useUserStatsCRUD } from '@/composables/users/useUserStatsCRUD'
import { useUserStore } from '@/stores/user'
import type {
    IUserStats,
    ILastSession
} from '@shared/contracts/interfaces/entities-stats/user-stats.interfaces'

export const useUserStatsStore = defineStore('user-stats', () => {
    const { getStats, getLastSessions, startAppSession } = useUserStatsCRUD()
    const user_store = useUserStore()

    const state = reactive({
        stats: null as IUserStats | null,
        sessions: [] as ILastSession[],
        is_loading: false,
        error: null as string | null,
        // Real-time tracking
        real_time_app_seconds: 0
    })

    let time_interval: NodeJS.Timeout | null = null

    // Getters
    const get_stats = computed(() => state.stats)
    const get_sessions = computed(() => state.sessions)
    const is_loading = computed(() => state.is_loading)
    const get_error = computed(() => state.error)
    const get_real_time_app_seconds = computed(() => state.real_time_app_seconds)

    // Actions
    const fetch_user_stats = async (): Promise<void> => {
        state.is_loading = true
        state.error = null
        try {
            const res = await getStats()
            if (res.error) {
                state.error = res.error
                return
            }
            state.stats = res.data ?? null

            // Initialize or update real-time counter
            if (state.stats) {
                const backend_seconds = Math.floor(state.stats.total_app_time * 60)
                let stored_seconds = 0

                // Try to get locally persisted time if user is identified
                // We use user_store.user.id because state.stats doesn't contain user_id
                if (user_store.user?.id) {
                    const storage_key = `trackup_app_time_${user_store.user.id}`
                    const stored_val = localStorage.getItem(storage_key)
                    if (stored_val) {
                        stored_seconds = parseInt(stored_val, 10)
                    }
                }

                // Use the maximum of: current state, backend value, and persisted value
                // This prevents the timer from jumping back if backend is lagging
                state.real_time_app_seconds = Math.max(state.real_time_app_seconds, backend_seconds, stored_seconds)

                // Ensure tracking is running
                if (!time_interval) {
                    start_time_tracking()
                }
            }
        } catch (e: unknown) {
            state.error = e instanceof Error ? e.message : String(e)
        } finally {
            state.is_loading = false
        }
    }

    const fetch_last_user_sessions = async (limit = 10): Promise<void> => {
        state.is_loading = true
        state.error = null
        try {
            const res = await getLastSessions(limit)
            if (res.error) {
                state.error = res.error
                return
            }
            state.sessions = res.data ?? []
        } catch (e: unknown) {
            state.error = e instanceof Error ? e.message : String(e)
        } finally {
            state.is_loading = false
        }
    }

    const fetch_all = async (force = false): Promise<void> => {
        // Optimization: if we already have stats and not forcing, skip
        if (!force && state.stats) {
            return
        }

        state.is_loading = true
        try {
            await Promise.all([fetch_user_stats(), fetch_last_user_sessions()])
        } finally {
            state.is_loading = false
        }
    }

    const init_session_tracking = async (): Promise<void> => {
        try {
            await startAppSession()
        } catch (e) {
            console.error('Failed to start app session from store', e)
        }
    }

    const force_refresh = async (): Promise<void> => {
        state.is_loading = true
        try {
            // First update session (syncs time with backend)
            await init_session_tracking()
            // Then force fetch fresh stats
            await fetch_all(true)
        } finally {
            state.is_loading = false
        }
    }

    // Timer Logic
    const start_time_tracking = () => {
        stop_time_tracking()
        // Increment every second
        time_interval = setInterval(() => {
            state.real_time_app_seconds++

            // Persist to localStorage if identified
            if (user_store.user?.id) {
                localStorage.setItem(`trackup_app_time_${user_store.user.id}`, state.real_time_app_seconds.toString())
            }
        }, 1000)
    }

    const stop_time_tracking = () => {
        if (time_interval) {
            clearInterval(time_interval)
            time_interval = null
        }
    }

    const reset_state = (): void => {
        // We attempt to clear storage for the *current* user if possible just before reset
        // usage: typically calling this means logging out
        if (user_store.user?.id) {
            localStorage.removeItem(`trackup_app_time_${user_store.user.id}`)
        }

        state.stats = null
        state.sessions = []
        state.is_loading = false
        state.error = null
        state.real_time_app_seconds = 0
        stop_time_tracking()
    }

    return {
        // State/Getters
        get_stats,
        get_sessions,
        is_loading,
        get_error,
        get_real_time_app_seconds,

        // Actions
        fetch_user_stats,
        fetch_last_user_sessions,
        fetch_all,
        init_session_tracking,
        force_refresh,
        reset_state,
        start_time_tracking,
        stop_time_tracking
    }
})
