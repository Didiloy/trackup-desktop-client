import { supabase } from '@/supabase'
import type { Provider } from '@supabase/supabase-js'
import { loading, error, setStateFromSession, setError } from './authState'
import { setupAuthStateListener } from './authListeners'
import { setupDeepLinkListener } from './deepLinkHandler'

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
 */
export async function signOut(): Promise<void> {
  loading.value = true
  error.value = null
  try {
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
