import { ComputedRef, Ref } from 'vue'
import { Provider } from '@supabase/supabase-js'

export type TUseAuth = {
  loading: Ref<boolean>
  error: Ref<string | null>
  isAuthenticated: ComputedRef<boolean>
  initializeSession: () => Promise<void>
  signInWithOAuth: (provider: Provider, redirectTo?: string) => Promise<unknown>
  signOut: () => Promise<void>
  cleanup: () => void
}
