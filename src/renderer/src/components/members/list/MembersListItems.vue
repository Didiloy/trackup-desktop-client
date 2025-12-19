<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import ContextActionMenu from '@/components/common/contexts/ContextActionMenu.vue'
import InputDialog from '@/components/common/dialogs/InputDialog.vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useMemberNickname } from '@/composables/members/useMemberNickname'
import { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import Member from '@/components/members/Member.vue'

interface Props {
    member: IServerMember
}

const props = defineProps<Props>()

const { t } = useI18n()
const user_store = useUserStore()
const {
    show_nickname_dialog,
    new_nickname,
    is_updating,
    openNicknameDialog,
    handleUpdateNickname
} = useMemberNickname()

const confirmUpdateNickname = (nickname: string): void => {
    handleUpdateNickname(props.member.public_id, nickname, props.member.nickname)
}

const items = computed(() => {
    const baseItems = [
        {
            label: t('views.members_aside.view_profile'),
            icon: 'pi pi-user',
            command: () => {
                console.log('View profile for', props.member?.nickname)
            }
        }
    ]

    // Only add Update Nickname option if the current member is the logged-in user
    if (props.member?.user_email === user_store.getEmail) {
        baseItems.push({
            label: t('views.members_aside.update_nickname'),
            icon: 'pi pi-user-edit',
            command: () => openNicknameDialog(props.member.nickname)
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
        :title="t('views.members_aside.update_nickname')"
        :message="t('views.members_aside.update_nickname_message')"
        :input-label="t('views.members_aside.new_nickname')"
        :input-placeholder="t('views.members_aside.enter_nickname')"
        :confirm-label="t('views.members_aside.update_nickname')"
        :cancel-label="t('common.actions.cancel')"
        confirm-severity="primary"
        :loading="is_updating"
        @confirm="confirmUpdateNickname"
    />
</template>
