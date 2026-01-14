import { defineStore } from 'pinia'
import { computed, ComputedRef, reactive } from 'vue'
import { user, session } from '@/composables/auth/utils/authState'
import { IUserServer } from '@shared/contracts/interfaces/entities/user.interfaces'

/**
 * User store - Pure getter/wrapper around auth state
 * No initialization logic - just reactive access to current user
 * User is automatically updated by the auth composable
 */
export const useUserStore = defineStore('user', () => {
    const state = reactive({
        servers: null as IUserServer[] | null
    })

    // Reactive getters based on auth state
    const hasUser: ComputedRef<boolean> = computed(() => user.value !== null)
    const hasAuthSession: ComputedRef<boolean> = computed(() => session.value !== null)
    const hasServers: ComputedRef<boolean> = computed(() => state.servers !== null)

    const getId: ComputedRef<string | null> = computed(() => user.value?.id ?? null)
    const getEmail: ComputedRef<string | null> = computed(() => user.value?.email ?? null)
    const getAvatar: ComputedRef<string | null> = computed(
        () => user.value?.user_metadata?.avatar_url ?? null
    )
    const getUsername: ComputedRef<string | null> = computed(
        () => user.value?.user_metadata?.full_name ?? null
    )
    const getAuthProvider: ComputedRef<string | null> = computed(
        () => user.value?.app_metadata?.provider ?? null
    )
    const getAccessToken: ComputedRef<string | null> = computed(
        () => session.value?.access_token ?? null
    )

    const getMyServers: ComputedRef<IUserServer[] | null> = computed(() => state.servers)

    const setMyServers = (servers: IUserServer[] | null): void => {
        state.servers = servers
    }

    const resetState = (): void => {
        state.servers = null
    }

    return {
        // State from auth (readonly)
        user,
        session,

        // Computed getters
        hasUser,
        hasAuthSession,
        hasServers,
        getId,
        getEmail,
        getAvatar,
        getUsername,
        getAccessToken,
        getMyServers,
        getAuthProvider,

        // Actions
        setMyServers,
        resetState
    }
})
