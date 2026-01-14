import { supabase } from '@/supabase'
import type { Provider } from '@supabase/supabase-js'
import { loading, error, setStateFromSession, setError } from './authState'
import { setupAuthStateListener } from './authListeners'
import { setupDeepLinkListener } from './deepLinkHandler'
import { useUserStatsStore } from '@/stores/user-stats'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'

/**
 * Initialize auth session and setup listeners
 * Should be called once when the app starts
 */
export async function initializeSession(
    onAuthListenerSetup?: (unsubscribe: () => void) => void,
    onDeepLinkListenerSetup?: (unsubscribe: (() => void) | null) => void
): Promise<void> {
    loading.value = true
    error.value = null
    try {
        const { data, error: initError } = await supabase.auth.getSession()
        if (initError) {
            error.value = initError.message
        }
        setStateFromSession(data.session)

        // Setup listeners and pass unsubscribe functions back
        const authUnsubscribe = setupAuthStateListener()
        const deepLinkUnsubscribe = setupDeepLinkListener()

        onAuthListenerSetup?.(authUnsubscribe)
        onDeepLinkListenerSetup?.(deepLinkUnsubscribe)
    } catch (e) {
        setError(e)
    } finally {
        loading.value = false
    }
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 * Opens browser for authentication
 */
export async function signInWithOAuth(provider: Provider, redirectTo?: string): Promise<unknown> {
    loading.value = true
    error.value = null
    try {
        const { data, error: signInError } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
                skipBrowserRedirect: true
            }
        })
        if (signInError) {
            error.value = signInError.message
        }
        return data
    } catch (e) {
        setError(e)
    } finally {
        loading.value = false
    }
    return undefined
}

/**
 * Sign out current user
 * Ends the app session tracking and resets all stores before signing out
 */
export async function signOut(): Promise<void> {
    loading.value = true
    error.value = null
    try {
        // End app session tracking before signing out
        const user_stats_store = useUserStatsStore()
        await user_stats_store.end_session_tracking()

        // Reset all stores to ensure clean state on next login
        // Order: stop timers/intervals first, then reset state
        const server_store = useServerStore()
        const user_store = useUserStore()


        // Stop all auto-fetch intervals and timers
        user_stats_store.stop_time_tracking()
        user_stats_store.stop_auto_fetch()

        // Reset all store states (user-preferences is intentionally NOT reset)
        server_store.resetState()
        user_store.resetState()
        user_stats_store.resetState()


        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) {
            error.value = signOutError.message
        }
    } catch (e) {
        setError(e)
    } finally {
        loading.value = false
    }
}
