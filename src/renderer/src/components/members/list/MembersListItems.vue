<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ContextActionMenu from '@/components/common/contexts/ContextActionMenu.vue'
import MemberProfileEditDialog from '@/components/members/profile/MemberProfileEditDialog.vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useMemberActions } from '@/composables/members/useMemberActions'
import type {
    IServerMember,
    IUpdateMemberProfileDto
} from '@shared/contracts/interfaces/entities/member.interfaces'
import Member from '@/components/members/Member.vue'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'

interface Props {
    member: IServerMember
}

const props = defineProps<Props>()

const { t } = useI18n()
const {
    show_profile_dialog,
    updateProfile,
    confirmUpdateProfile,
    canUpdateProfile
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

    if (canUpdateProfile(props.member.public_id)) {
        baseItems.push({
            label: t('views.members_aside.update_profile'),
            icon: 'pi pi-user-edit',
            command: async () => updateProfile(props.member.nickname, props.member.avatar_url)
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

const handleProfileUpdate = async (data: IUpdateMemberProfileDto): Promise<void> => {
    await confirmUpdateProfile(props.member.public_id, data)
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

    <!-- Profile Update Dialog -->
    <MemberProfileEditDialog
        v-model="show_profile_dialog"
        :server-member="props.member"
        :on-confirm="handleProfileUpdate"
    />
</template>
