import { defineStore } from 'pinia'
import { computed, ComputedRef, reactive } from 'vue'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'

/**
 * Server Member store - Holds current user's member entity in the current server
 * Automatically populated when joining/loading a server
 * Provides reactive access to member data without prop drilling
 */
export const useServerMemberStore = defineStore('server-member', () => {
    const state = reactive({
        current_member: null as IServerMember | null
    })

    // Reactive getters
    const hasMember: ComputedRef<boolean> = computed(() => state.current_member !== null)

    const getPublicId: ComputedRef<string | null> = computed(
        () => state.current_member?.public_id ?? null
    )

    const getNickname: ComputedRef<string | null> = computed(
        () => state.current_member?.nickname ?? null
    )

    const getAvatarUrl: ComputedRef<string | null> = computed(
        () => state.current_member?.avatar_url ?? null
    )

    const getRoleName: ComputedRef<string | null> = computed(
        () => state.current_member?.role_name ?? null
    )

    const getRolePublicId: ComputedRef<string | null> = computed(
        () => state.current_member?.role_public_id ?? null
    )

    const getEmail: ComputedRef<string | null> = computed(
        () => state.current_member?.user_email ?? null
    )

    const getCreatedAt: ComputedRef<string | null> = computed(
        () => state.current_member?.created_at ?? null
    )

    const isArchived: ComputedRef<boolean> = computed(
        () => state.current_member?.archived ?? false
    )

    // Get full member object
    const getMember: ComputedRef<IServerMember | null> = computed(() => state.current_member)

    // Actions
    const setMember = (member: IServerMember | null): void => {
        state.current_member = member
    }

    const resetState = (): void => {
        state.current_member = null
    }

    return {
        // State (readonly)
        hasMember,

        // Computed getters
        getPublicId,
        getNickname,
        getAvatarUrl,
        getRoleName,
        getRolePublicId,
        getEmail,
        getCreatedAt,
        isArchived,
        getMember,

        // Actions
        setMember,
        resetState
    }
})
