<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'
import ContextActionMenu from '@/components/common/ContextActionMenu.vue'
import InputDialog from '@/components/common/dialogs/InputDialog.vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import Member from '@/components/members/Member.vue'

interface Props {
    member: IServerMember
}

const props = defineProps<Props>()

const { t } = useI18n()
const server_store = useServerStore()
const user_store = useUserStore()
const { updateMemberNickname, listMembers } = useMemberCRUD()

const show_nickname_dialog = ref(false)
const new_nickname = ref('')
const is_updating = ref(false)

const openNicknameDialog = (): void => {
    new_nickname.value = props.member.nickname || ''
    show_nickname_dialog.value = true
}

const closeNicknameDialog = (): void => {
    show_nickname_dialog.value = false
    new_nickname.value = ''
    is_updating.value = false
}

const handleUpdateNickname = async (nickname: string): Promise<void> => {
    if (!props.member?.public_id || !server_store.getPublicId) return
    if (!nickname || nickname === props.member?.nickname) {
        closeNicknameDialog()
        return
    }

    is_updating.value = true

    try {
        const result = await updateMemberNickname(
            server_store.getPublicId,
            props.member.public_id,
            {
                nickname
            }
        )

        if (result.data) {
            // Refresh the members list by fetching again
            const membersResult = await listMembers(server_store.getPublicId)
            if (membersResult.data) {
                server_store.setMembers(membersResult.data.data)
            }
            closeNicknameDialog()
        } else {
            console.error('Failed to update nickname:', result.error)
            // Keep dialog open to show error
            is_updating.value = false
        }
    } catch (error) {
        console.error('Error updating nickname:', error)
        is_updating.value = false
    }
}

const items = computed(() => {
    const baseItems = [
        {
            label: t('userInterface.membersAside.view_profile'),
            icon: 'pi pi-user',
            command: () => {
                console.log('View profile for', props.member?.nickname)
            }
        }
    ]

    // Only add Update Nickname option if the current member is the logged-in user
    if (props.member?.user_email === user_store.getEmail) {
        baseItems.push({
            label: t('userInterface.membersAside.update_nickname'),
            icon: 'pi pi-user-edit',
            command: openNicknameDialog
        })
    }

    return baseItems
})

const { menu, onRightClick } = useContextMenu(items.value)

const handleContextMenu = (event: MouseEvent): void => {
    onRightClick(event)
}

const onItemSelected = (item: unknown): void => {
    const menuItem = item as { command?: () => void }
    menuItem.command?.()
}
</script>

<template>
    <ul class="flex flex-col gap-1">
        <li
            class="px-2 py-1 rounded hover:bg-surface-300 cursor-pointer"
            @contextmenu="handleContextMenu"
            @click="handleContextMenu"
        >
            <Member :member="props.member" />
        </li>
    </ul>

    <ContextActionMenu ref="menu" :items="items" @item-selected="onItemSelected" />

    <!-- Nickname Update Dialog -->
    <InputDialog
        v-model="show_nickname_dialog"
        v-model:input-value="new_nickname"
        :title="t('userInterface.membersAside.update_nickname')"
        :message="t('userInterface.membersAside.update_nickname_message')"
        :input-label="t('userInterface.membersAside.new_nickname')"
        :input-placeholder="t('userInterface.membersAside.enter_nickname')"
        :confirm-label="t('actions.update')"
        :cancel-label="t('actions.cancel')"
        confirm-severity="primary"
        :loading="is_updating"
        @confirm="handleUpdateNickname"
    />
</template>
