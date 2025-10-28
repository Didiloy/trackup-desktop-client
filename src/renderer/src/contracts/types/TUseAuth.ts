import { ComputedRef, Ref } from 'vue'
import { Provider, Session, User } from '@supabase/supabase-js'

export type UseAuth = {
  user: Ref<User | null>
  session: Ref<Session | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  isAuthenticated: ComputedRef<boolean>
  initializeSession: () => Promise<void>
  signInWithOAuth: (provider: Provider, redirectTo?: string) => Promise<unknown>
  signOut: () => Promise<void>
  cleanup: () => void
}
