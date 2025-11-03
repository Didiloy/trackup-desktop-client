import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import type { Provider, Session, User } from '@supabase/supabase-js'
import type { TUseAuth } from '../../../../shared/contracts/types/useAuth.type'

// Reactive auth state (module-scoped singletons)
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

let initialized = false
let unsubscribe: (() => void) | null = null
let deepLinkUnsubscribe: (() => void) | null = null

// --- Helpers ---------------------------------------------------------------
const setStateFromSession = (s: Session | null): void => {
  session.value = s
  user.value = s?.user ?? null
}

function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  )
}

const setError = (e: unknown, fallback = 'Unknown error'): void => {
  error.value = hasMessage(e) ? e.message : typeof e === 'string' ? e : fallback
}

function setupAuthStateListener(): void {
  if (unsubscribe) return
  const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
    setStateFromSession(currentSession)
  })
  unsubscribe = () => listener.subscription.unsubscribe()
}

async function handlePKCEFlow(code: string): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      error.value = exchangeError.message
    } else {
      setStateFromSession(data.session)
    }
  } catch (e) {
    setError(e, 'Authentication failed')
  } finally {
    loading.value = false
  }
}

async function handleImplicitFlow(accessToken: string, refreshToken: string): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
    if (sessionError) {
      error.value = sessionError.message
    } else {
      setStateFromSession(data.session)
    }
  } catch (e) {
    setError(e, 'Authentication failed')
  } finally {
    loading.value = false
  }
}

async function handleDeepLinkUrl(url: string): Promise<void> {
  try {
    const parsed = new URL(url)

    // Check for errors in query params or hash
    const errorDescription =
      parsed.searchParams.get('error_description') ||
      parsed.searchParams.get('error') ||
      new URLSearchParams(parsed.hash.slice(1)).get('error_description') ||
      new URLSearchParams(parsed.hash.slice(1)).get('error')

    if (errorDescription) {
      error.value = errorDescription
      return
    }

    // Handle PKCE flow (code in query params)
    const code = parsed.searchParams.get('code')
    if (code) {
      await handlePKCEFlow(code)
      return
    }

    // Handle implicit flow (tokens in hash fragment)
    const hashParams = new URLSearchParams(parsed.hash.slice(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken) {
      await handleImplicitFlow(accessToken, refreshToken || '')
    }
  } catch (e) {
    setError(e, 'Authentication failed')
  }
}

function setupDeepLinkListener(): void {
  if (deepLinkUnsubscribe) return
  if (typeof window === 'undefined') return
  // Subscribe via typed preload bridge
  deepLinkUnsubscribe = window.api.auth.onCallbackUrl((url) => {
    void handleDeepLinkUrl(url)
  })
}

function cleanupAuth(): void {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  if (deepLinkUnsubscribe) {
    deepLinkUnsubscribe()
    deepLinkUnsubscribe = null
  }
}

// --- Public API ------------------------------------------------------------
async function initializeSession(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const { data, error: initError } = await supabase.auth.getSession()
    if (initError) {
      error.value = initError.message
    }
    setStateFromSession(data.session)

    setupAuthStateListener()
    setupDeepLinkListener()
  } catch (e) {
    setError(e)
  } finally {
    loading.value = false
  }
}

async function signInWithOAuth(provider: Provider, redirectTo?: string): Promise<unknown> {
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

async function signOut(): Promise<void> {
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

const isAuthenticated = computed((): boolean => !!user.value)

export function useAuth(): TUseAuth {
  if (!initialized) {
    initialized = true
    // fire-and-forget initialization
    void initializeSession()
  }

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    initializeSession,
    signInWithOAuth,
    signOut,
    // Optional: expose cleanup for manual teardown (e.g., app shutdown)
    cleanup: cleanupAuth
  }
}
