import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'

export function useMemberActions() {
    const { t } = useI18n()
    const toast = useToast()
    const server_store = useServerStore()
    const user_store = useUserStore()
    const { kickMember: kickMemberAPI, updateMemberProfile, listMembers } = useMemberCRUD()
    const { navigateToServerMembers } = useMemberNavigation()

    // Nickname management state
    const show_nickname_dialog = ref(false)
    const new_nickname = ref('')
    const is_updating = ref(false)
    const isKicking = ref(false)

    // Kick confirmation state
    const show_kick_confirmation = ref(false)
    const member_to_kick = ref<string | null>(null)

    /**
     * Open nickname dialog
     */
    const openNicknameDialog = (currentNickname: string): void => {
        new_nickname.value = currentNickname || ''
        show_nickname_dialog.value = true
    }

    /**
     * Close nickname dialog
     */
    const closeNicknameDialog = (): void => {
        show_nickname_dialog.value = false
        new_nickname.value = ''
        is_updating.value = false
    }

    /**
     * Update member nickname
     */
    const updateNickname = (currentNickname: string): void => {
        openNicknameDialog(currentNickname)
    }

    /**
     * Handle nickname update
     */
    const handleUpdateNickname = async (
        memberId: string,
        nickname: string,
        currentNickname?: string
    ): Promise<void> => {
        if (!memberId || !server_store.getPublicId) return
        if (!nickname || nickname === currentNickname) {
            closeNicknameDialog()
            return
        }

        is_updating.value = true

        try {
            const result = await updateMemberProfile(server_store.getPublicId, memberId, {
                nickname
            })

            if (result.data) {
                // Refresh the members list by fetching again
                const membersResult = await listMembers(server_store.getPublicId)
                if (membersResult.data) {
                    server_store.setMembers(membersResult.data.data)
                }
                toast.add({
                    severity: 'success',
                    summary: t('views.members_aside.update_nickname'),
                    detail: t('messages.success.update'),
                    life: 3000
                })
                closeNicknameDialog()
            } else {
                console.error('Failed to update nickname:', result.error)
                toast.add({
                    severity: 'error',
                    summary: t('messages.error.update'),
                    detail: result.error,
                    life: 3000
                })
                is_updating.value = false
            }
        } catch (error) {
            console.error('Error updating nickname:', error)
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
     * Confirm nickname update
     */
    const confirmUpdateNickname = async (
        memberId: string,
        newNickname: string,
        currentNickname: string
    ): Promise<void> => {
        await handleUpdateNickname(memberId, newNickname, currentNickname)
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
     * Check if current user can update nickname for this member
     */
    const canUpdateNickname = (memberEmail: string): boolean => {
        return memberEmail === user_store.getEmail
    }

    /**
     * Check if current user can kick this member
     */
    const canKickMember = (memberEmail: string): boolean => {
        return Boolean(server_store.isOwnership) && memberEmail !== user_store.getEmail
    }

    return {
        // State
        show_nickname_dialog,
        new_nickname,
        is_updating,
        isKicking,
        show_kick_confirmation,

        // Actions
        updateNickname,
        confirmUpdateNickname,
        closeNicknameDialog,
        kickMember,
        confirmKickMember,

        // Permissions
        canUpdateNickname,
        canKickMember
    }
}
