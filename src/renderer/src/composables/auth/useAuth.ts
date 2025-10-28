import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import type { Provider, Session, User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

let initialized = false
let unsubscribe: (() => void) | null = null
let deepLinkUnsubscribe: (() => void) | null = null

async function initializeSession(): Promise<void> {
  loading.value = true
  error.value = null
  const { data, error: initError } = await supabase.auth.getSession()
  if (initError) {
    error.value = initError.message
  }
  session.value = data.session
  user.value = data.session?.user ?? null

  if (!unsubscribe) {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      session.value = currentSession
      user.value = currentSession?.user ?? null
    })
    unsubscribe = () => listener.subscription.unsubscribe()
  }

  if (!deepLinkUnsubscribe && typeof window !== 'undefined' && window?.electron?.ipcRenderer) {
    const handler = async (_: unknown, url: string) => {
      try {
        const parsed = new URL(url)
        const code = parsed.searchParams.get('code')
        const errorDescription =
          parsed.searchParams.get('error_description') || parsed.searchParams.get('error')
        if (errorDescription) {
          error.value = errorDescription
          return
        }
        if (code) {
          loading.value = true
          error.value = null
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            error.value = exchangeError.message
          } else {
            session.value = data.session
            user.value = data.session?.user ?? null
          }
          loading.value = false
        }
      } catch (e: any) {
        error.value = e?.message ?? 'Authentication failed'
      }
    }
    window.electron.ipcRenderer.on('auth-callback-url', handler)
    deepLinkUnsubscribe = () =>
      window.electron.ipcRenderer.removeListener('auth-callback-url', handler)
  }
  loading.value = false
}

async function signInWithOAuth(provider: Provider, redirectTo?: string) {
  loading.value = true
  error.value = null
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
  loading.value = false
  return data
}

async function signOut(): Promise<void> {
  loading.value = true
  error.value = null
  const { error: signOutError } = await supabase.auth.signOut()
  if (signOutError) {
    error.value = signOutError.message
  }
  loading.value = false
}

const isAuthenticated = computed(() => !!user.value)

export function useAuth() {
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
    signOut
  }
}
