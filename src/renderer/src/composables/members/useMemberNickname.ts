import { ref } from 'vue'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'


export function useMemberNickname()  {
    const server_store = useServerStore()
    const { updateMemberNickname, listMembers } = useMemberCRUD()
    const toast = useToast()
    const { t } = useI18n()

    const show_nickname_dialog = ref(false)
    const new_nickname = ref('')
    const is_updating = ref(false)

    const openNicknameDialog = (currentNickname: string): void => {
        new_nickname.value = currentNickname || ''
        show_nickname_dialog.value = true
    }

    const closeNicknameDialog = (): void => {
        show_nickname_dialog.value = false
        new_nickname.value = ''
        is_updating.value = false
    }

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
            const result = await updateMemberNickname(server_store.getPublicId, memberId, {
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

    return {
        show_nickname_dialog,
        new_nickname,
        is_updating,
        openNicknameDialog,
        closeNicknameDialog,
        handleUpdateNickname
    }
}
