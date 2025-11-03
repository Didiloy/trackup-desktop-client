import { defineStore } from 'pinia'
import { computed } from 'vue'
import { user, session } from '@/composables/auth/utils/authState'

/**
 * User store - Pure getter/wrapper around auth state
 * No initialization logic - just reactive access to current user
 * User is automatically updated by the auth composable
 */
export const useUserStore = defineStore('user', () => {
  // Reactive getters based on auth state
  const hasUser = computed(() => user.value !== null)
  const hasSession = computed(() => session.value !== null)

  const getId = computed(() => user.value?.id ?? null)
  const getEmail = computed(() => user.value?.email ?? false)
  const getAvatar = computed(() => user.value?.user_metadata?.avatar_url ?? null)
  const getUsername = computed(() => user.value?.user_metadata?.full_name ?? null)
  const getAccessToken = computed(() => session.value?.access_token ?? null)

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
