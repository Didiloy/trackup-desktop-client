import { ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useServerStore } from '@/stores/server'
import { useServerMemberStore } from '@/stores/server-member'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'
import type { IUpdateMemberProfileDto } from '@shared/contracts/interfaces/entities/member.interfaces'

interface _useMemberActionsReturn {
    // State
    show_profile_dialog: Ref<boolean>
    new_nickname: Ref<string>
    new_avatar_url: Ref<string>
    is_updating: Ref<boolean>
    isKicking: Ref<boolean>
    show_kick_confirmation: Ref<boolean>

    // Actions
    updateProfile: (currentNickname: string, currentAvatarUrl: string) => void
    confirmUpdateProfile: (memberId: string, data: IUpdateMemberProfileDto) => Promise<void>
    closeProfileDialog: () => void
    kickMember: (memberId: string) => void
    confirmKickMember: () => Promise<void>

    // Permissions
    canUpdateProfile: (memberId: string) => boolean
    canKickMember: (memberId: string) => boolean
}

export function useMemberActions(): _useMemberActionsReturn {
    const { t } = useI18n()
    const toast = useToast()
    const server_store = useServerStore()
    const server_member_store = useServerMemberStore()
    const { kickMember: kickMemberAPI, updateMemberProfile, listMembers } = useMemberCRUD()
    const { navigateToServerMembers } = useMemberNavigation()

    // Profile management state
    const show_profile_dialog = ref(false)
    const new_nickname = ref('')
    const new_avatar_url = ref('')
    const is_updating = ref(false)
    const isKicking = ref(false)

    // Kick confirmation state
    const show_kick_confirmation = ref(false)
    const member_to_kick = ref<string | null>(null)

    /**
     * Open profile dialog
     */
    const openProfileDialog = (currentNickname: string, currentAvatarUrl: string): void => {
        new_nickname.value = currentNickname || ''
        new_avatar_url.value = currentAvatarUrl || ''
        show_profile_dialog.value = true
    }

    /**
     * Close profile dialog
     */
    const closeProfileDialog = (): void => {
        show_profile_dialog.value = false
        new_nickname.value = ''
        new_avatar_url.value = ''
        is_updating.value = false
    }

    /**
     * Update member profile
     */
    const updateProfile = (currentNickname: string, currentAvatarUrl: string): void => {
        openProfileDialog(currentNickname, currentAvatarUrl)
    }

    /**
     * Handle profile update
     */
    const handleUpdateProfile = async (
        memberId: string,
        data: IUpdateMemberProfileDto
    ): Promise<void> => {
        if (!memberId || !server_store.getPublicId) return
        if (!data.nickname && !data.avatar_url) {
            closeProfileDialog()
            return
        }

        is_updating.value = true

        try {
            // Build the request with only the fields that are provided
            const updateData: IUpdateMemberProfileDto = {}
            if (data.nickname !== undefined) {
                updateData.nickname = data.nickname
            }
            if (data.avatar_url !== undefined) {
                updateData.avatar_url = data.avatar_url
            }

            const result = await updateMemberProfile(server_store.getPublicId, memberId, updateData)

            if (result.data) {
                // Refresh the members list by fetching again
                const membersResult = await listMembers(server_store.getPublicId)
                if (membersResult.data) {
                    server_store.setMembers(membersResult.data.data)
                }
                toast.add({
                    severity: 'success',
                    summary: t('views.members_aside.update_profile'),
                    detail: t('messages.success.update'),
                    life: 3000
                })
                closeProfileDialog()
            } else {
                console.error('Failed to update profile:', result.error)
                toast.add({
                    severity: 'error',
                    summary: t('messages.error.update'),
                    detail: result.error,
                    life: 3000
                })
                is_updating.value = false
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.add({
                severity: 'error',
                summary: t('messages.error.update'),
                detail: error instanceof Error ? error.message : 'Unknown error',
                life: 3000
            })
            is_updating.value = false
        }
    }

    /**
     * Confirm profile update
     */
    const confirmUpdateProfile = async (
        memberId: string,
        data: IUpdateMemberProfileDto
    ): Promise<void> => {
        await handleUpdateProfile(memberId, data)
    }

    /**
     * Kick member from server (owner only) with confirmation
     */
    const kickMember = (memberId: string): void => {
        member_to_kick.value = memberId
        show_kick_confirmation.value = true
    }

    /**
     * Confirm and execute kick action
     */
    const confirmKickMember = async (): Promise<void> => {
        if (!server_store.getPublicId || !member_to_kick.value) return

        isKicking.value = true
        try {
            const result = await kickMemberAPI(server_store.getPublicId, member_to_kick.value)
            if (result.data) {
                // Refresh members list
                const resMembers = await listMembers(server_store.getPublicId)
                if (resMembers.data) {
                    server_store.setMembers(resMembers.data.data)
                }

                toast.add({
                    severity: 'success',
                    summary: t('views.server_members.member_kicked'),
                    detail: t('views.server_members.member_kicked_detail'),
                    life: 3000
                })

                // Navigate to server members view
                await navigateToServerMembers()
            } else {
                toast.add({
                    severity: 'error',
                    summary: t('views.server_members.member_kicked_error'),
                    detail: t('views.server_members.member_kicked_error_detail'),
                    life: 3000
                })
            }
        } catch (error) {
            console.error('Failed to kick member', error)
            toast.add({
                severity: 'error',
                summary: t('views.server_members.member_kicked_error'),
                detail: t('views.server_members.member_kicked_error_detail'),
                life: 3000
            })
        } finally {
            isKicking.value = false
            show_kick_confirmation.value = false
            member_to_kick.value = null
        }
    }

    /**
     * Check if current user can update profile for this member
     * Uses server-member store to compare member IDs
     */
    const canUpdateProfile = (memberId: string): boolean => {
        return memberId === server_member_store.getPublicId
    }

    /**
     * Check if current user can kick this member
     * Owner can kick anyone except themselves
     */
    const canKickMember = (memberId: string): boolean => {
        return Boolean(server_store.isOwnership) && memberId !== server_member_store.getPublicId
    }

    return {
        // State
        show_profile_dialog,
        new_nickname,
        new_avatar_url,
        is_updating,
        isKicking,
        show_kick_confirmation,

        // Actions
        updateProfile,
        confirmUpdateProfile,
        closeProfileDialog,
        kickMember,
        confirmKickMember,

        // Permissions
        canUpdateProfile,
        canKickMember
    }
}
