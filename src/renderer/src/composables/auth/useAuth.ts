import type { TUseAuth } from '../../../../shared/contracts/types/useAuth.type'

// Import separated modules
import { loading, error, isAuthenticated } from './utils/authState'
import { initializeSession, signInWithOAuth, signOut } from './utils/authOperations'

/**
 * Main auth composable
 * Orchestrates authentication state and operations
 *
 * This is the primary interface for authentication in the app.
 * All complex logic has been separated into focused modules:
 * - authState: Reactive state management
 * - authOperations: Core auth operations (sign in, sign out, initialize)
 * - authFlowHandlers: PKCE and implicit OAuth flow handlers
 * - deepLinkHandler: Deep link URL parsing and callback handling
 * - authListeners: Supabase auth state change listeners
 */

let initialized = false
let authUnsubscribe: (() => void) | null = null
let deepLinkUnsubscribe: (() => void) | null = null

/**
 * Cleanup all auth listeners
 * Should be called on app shutdown or when tearing down auth
 */
function cleanupAuth(): void {
    if (authUnsubscribe) {
        authUnsubscribe()
        authUnsubscribe = null
    }
    if (deepLinkUnsubscribe) {
        deepLinkUnsubscribe()
        deepLinkUnsubscribe = null
    }
}

/**
 * Initialize auth session with listener setup
 */
async function initAuth(): Promise<void> {
    await initializeSession(
        (unsubscribe) => {
            authUnsubscribe = unsubscribe
        },
        (unsubscribe) => {
            deepLinkUnsubscribe = unsubscribe
        }
    )
}

/**
 * Main hook for authentication
 * Singleton pattern - only initializes once
 */
export function useAuth(): TUseAuth {
    if (!initialized) {
        initialized = true
        // Fire-and-forget initialization
        void initAuth()
    }

    return {
        loading,
        error,
        isAuthenticated,
        initializeSession: initAuth,
        signInWithOAuth,
        signOut,
        // Expose cleanup for manual teardown (e.g., app shutdown)
        cleanup: cleanupAuth
    }
}
