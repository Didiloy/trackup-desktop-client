import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useMemberNickname } from '@/composables/members/useMemberNickname'

export function useMemberActions() {
    const router = useRouter()
    const { t } = useI18n()
    const toast = useToast()
    const server_store = useServerStore()
    const user_store = useUserStore()
    const { kickMember: kickMemberAPI, listMembers } = useMemberCRUD()

    const {
        show_nickname_dialog,
        new_nickname,
        is_updating,
        openNicknameDialog,
        handleUpdateNickname
    } = useMemberNickname()

    const isKicking = ref(false)

    /**
     * Navigate to member profile page
     */
    const navigateToProfile = async (memberId: string): Promise<void> => {
        await router.push({
            name: 'ServerMemberProfile',
            params: {
                id: server_store.getPublicId,
                memberId
            }
        })
    }

    /**
     * Update member nickname
     */
    const updateNickname = (memberId: string, currentNickname: string): void => {
        openNicknameDialog(currentNickname)
    }

    /**
     * Confirm nickname update
     */
    const confirmUpdateNickname = (memberId: string, newNickname: string, currentNickname: string): void => {
        handleUpdateNickname(memberId, newNickname, currentNickname)
    }

    /**
     * Kick member from server (owner only)
     */
    const kickMember = async (memberId: string): Promise<boolean> => {
        if (!server_store.getPublicId) return false

        isKicking.value = true
        try {
            const result = await kickMemberAPI(server_store.getPublicId, memberId)
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
                return true
            } else {
                toast.add({
                    severity: 'error',
                    summary: t('views.server_members.member_kicked_error'),
                    detail: t('views.server_members.member_kicked_error_detail'),
                    life: 3000
                })
                return false
            }
        } catch (error) {
            console.error('Failed to kick member', error)
            toast.add({
                severity: 'error',
                summary: t('views.server_members.member_kicked_error'),
                detail: t('views.server_members.member_kicked_error_detail'),
                life: 3000
            })
            return false
        } finally {
            isKicking.value = false
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

        // Actions
        navigateToProfile,
        updateNickname,
        confirmUpdateNickname,
        kickMember,

        // Permissions
        canUpdateNickname,
        canKickMember
    }
}
