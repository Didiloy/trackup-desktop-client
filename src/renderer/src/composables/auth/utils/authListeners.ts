import { supabase } from '@/supabase'
import { setStateFromSession } from './authState'

/**
 * Setup Supabase auth state change listener
 * Keeps local state in sync with Supabase auth state
 */
export function setupAuthStateListener(): () => void {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
    setStateFromSession(currentSession)
  })

  return () => listener.subscription.unsubscribe()
}
