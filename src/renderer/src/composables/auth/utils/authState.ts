import { ref, computed } from 'vue'
import type { Session, User } from '@supabase/supabase-js'

/**
 * Centralized auth state management
 * Module-scoped singleton for reactive auth state
 */

export const user = ref<User | null>(null)
export const session = ref<Session | null>(null)
export const loading = ref(false)
export const error = ref<string | null>(null)

export const isAuthenticated = computed((): boolean => !!user.value)

/**
 * Update state from a session object
 */
export const setStateFromSession = (s: Session | null): void => {
  session.value = s
  user.value = s?.user ?? null
}

/**
 * Type guard to check if error has a message property
 */
function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  )
}

/**
 * Set error message from various error types
 */
export const setError = (e: unknown, fallback = 'Unknown error'): void => {
  error.value = hasMessage(e) ? e.message : typeof e === 'string' ? e : fallback
}

/**
 * Clear error state
 */
export const clearError = (): void => {
  error.value = null
}

/**
 * Reset all auth state
 */
export const resetAuthState = (): void => {
  user.value = null
  session.value = null
  loading.value = false
  error.value = null
}
