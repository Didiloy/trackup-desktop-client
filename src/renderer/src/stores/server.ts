import { defineStore } from 'pinia'
import { computed, ComputedRef, reactive } from 'vue'
import { IServer } from '@shared/contracts/interfaces/entities/server.interfaces'
import { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'

interface ServerCache {
    server: IServer
    members: IServerMember[]
    enumDefinition: IEnumDefinition[]
    timestamp: number
}

export const useServerStore = defineStore('server', () => {
    // Cache to store previously loaded servers (TTL: 5 minutes)
    const cache = reactive<Map<string, ServerCache>>(new Map())
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    // Reactive getters based on auth state

    const state = reactive({
        server: null as IServer | null,
        serverMembers: null as IServerMember[] | null,
        serverActivities: null as IActivity[] | null,
        serverEnumsDefinition: null as IEnumDefinition[] | null,
        ownership: false as boolean,
        isLoading: false as boolean
    })

    const hasServer: ComputedRef<boolean> = computed(() => state.server !== null)
    const hasServerMembers: ComputedRef<boolean> = computed(() => state.serverMembers !== null)

    // Keep the individual getters for data access centralization
    const getPublicId: ComputedRef<string | null> = computed(() => state.server?.public_id ?? null)
    const getServerTypePublicId: ComputedRef<string | null> = computed(
        () => state.server?.server_type_public_id ?? null
    )
    const getMembers: ComputedRef<IServerMember[] | null> = computed(
        () => state.serverMembers ?? null
    )
    const getActivities: ComputedRef<IActivity[] | null> = computed(
        () => state.serverActivities ?? null
    )
    const getEnumsDefinition: ComputedRef<IEnumDefinition[] | null> = computed(
        () => state.serverEnumsDefinition ?? null
    )

    const getName: ComputedRef<string | null> = computed(() => state.server?.name ?? null)
    const getDescription: ComputedRef<string | null> = computed(
        () => state.server?.description ?? null
    )
    const getLogo: ComputedRef<string | null> = computed(() => state.server?.logo ?? null)
    const getBanner: ComputedRef<string | null> = computed(() => state.server?.banner ?? null)
    const getInvitationCode: ComputedRef<string | null> = computed(
        () => state.server?.invite_code ?? null
    )
    const getInvitationCodeExpDate: ComputedRef<string | null> = computed(
        () => state.server?.invite_code_expires_at ?? null
    )

    // Keep permission getters
    const isOwnership: ComputedRef<boolean | null> = computed(() => !!state.server?.invite_code) // As only owner can see invite code, if we havve the code we are owner

    // Setter functions
    const setServer = (srv: IServer | null): void => {
        state.server = srv
    }

    const setMembers = (members: IServerMember[] | null): void => {
        state.serverMembers = members
    }

    const setActivities = (activities: IActivity[] | null): void => {
        state.serverActivities = activities
    }

    const setEnumsDefinition = (enums: IEnumDefinition[] | null): void => {
        state.serverEnumsDefinition = enums
    }

    const resetState = (): void => {
        state.server = null
        state.serverMembers = null
        state.serverActivities = null
        state.serverEnumsDefinition = null
        state.ownership = false
        state.isLoading = false
    }

    const setLoading = (loading: boolean): void => {
        state.isLoading = loading
    }

    const isLoading: ComputedRef<boolean> = computed(() => state.isLoading)

    // Cache methods
    const getCachedServer = (serverId: string): ServerCache | null => {
        const cached = cache.get(serverId)
        if (!cached) return null

        // Check if cache is still valid
        const now = Date.now()
        if (now - cached.timestamp > CACHE_TTL) {
            cache.delete(serverId)
            return null
        }

        return cached
    }

    const setCachedServer = (
        serverId: string,
        server: IServer,
        members: IServerMember[],
        enumDefinition: IEnumDefinition[]
    ): void => {
        cache.set(serverId, {
            server,
            members,
            enumDefinition,
            timestamp: Date.now()
        })
    }

    const loadFromCache = (serverId: string): boolean => {
        const cached = getCachedServer(serverId)
        if (!cached) return false

        state.server = cached.server
        state.serverMembers = cached.members
        state.serverEnumsDefinition = cached.enumDefinition
        return true
    }

    const clearCache = (): void => {
        cache.clear()
    }

    return {
        hasServer,
        hasServerMembers,
        isLoading,

        setServer,
        setMembers,
        setActivities,
        setEnumsDefinition,
        setLoading,

        getPublicId,
        getServerTypePublicId,
        getMembers,
        getActivities,
        getEnumsDefinition,
        getName,
        getDescription,
        getLogo,
        getBanner,
        getInvitationCode,
        getInvitationCodeExpDate,
        isOwnership,

        getCachedServer,
        setCachedServer,
        loadFromCache,
        clearCache,

        resetState
    }
})
