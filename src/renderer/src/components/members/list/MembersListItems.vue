<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ContextActionMenu from '@/components/common/contexts/ContextActionMenu.vue'
import InputDialog from '@/components/common/dialogs/InputDialog.vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useMemberActions } from '@/composables/members/useMemberActions'
import { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import Member from '@/components/members/Member.vue'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'

interface Props {
    member: IServerMember
}

const props = defineProps<Props>()

const { t } = useI18n()
const {
    show_nickname_dialog,
    new_nickname,
    updateNickname,
    confirmUpdateNickname,
    canUpdateNickname
} = useMemberActions()

const { navigateToMemberProfile } = useMemberNavigation()

const items = computed(() => {
    const baseItems = [
        {
            label: t('views.members_aside.view_profile'),
            icon: 'pi pi-user',
            command: async () => {
                await navigateToMemberProfile(props.member.public_id)
            }
        }
    ]

    if (canUpdateNickname(props.member.user_email)) {
        baseItems.push({
            label: t('views.members_aside.update_nickname'),
            icon: 'pi pi-user-edit',
            command: async () => updateNickname(props.member.nickname)
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

const handleNicknameUpdate = async (nickname: string): Promise<void> => {
    await confirmUpdateNickname(props.member.public_id, nickname, props.member.nickname)
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
        @confirm="handleNicknameUpdate"
    />
</template>
