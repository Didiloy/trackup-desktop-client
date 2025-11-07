import { defineStore } from 'pinia'
import { computed, ComputedRef } from 'vue'
import { user, session } from '@/composables/auth/utils/authState'

/**
 * User store - Pure getter/wrapper around auth state
 * No initialization logic - just reactive access to current user
 * User is automatically updated by the auth composable
 */
export const useUserStore = defineStore('user', () => {
  // Reactive getters based on auth state
  const hasUser: ComputedRef<boolean> = computed(() => user.value !== null)
  const hasSession: ComputedRef<boolean> = computed(() => session.value !== null)

  const getId: ComputedRef<string | null> = computed(() => user.value?.id ?? null)
  const getEmail: ComputedRef<string | null> = computed(() => user.value?.email ?? null)
  const getAvatar: ComputedRef<string | null> = computed(
    () => user.value?.user_metadata?.avatar_url ?? null
  )
  const getUsername: ComputedRef<string | null> = computed(
    () => user.value?.user_metadata?.full_name ?? null
  )
  const getAccessToken: ComputedRef<string | null> = computed(
    () => session.value?.access_token ?? null
  )

  return {
    // State from auth (readonly)
    user,
    session,

    // Computed getters
    hasUser,
    hasSession,
    getId,
    getEmail,
    getAvatar,
    getUsername,
    getAccessToken
  }
})
