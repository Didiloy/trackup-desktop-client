<script setup lang="ts">
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import { useI18n } from 'vue-i18n'
import { useContextMenu } from '@/composables/useContextMenu'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useMemberNickname } from '@/composables/members/useMemberNickname'
import { useToast } from 'primevue/usetoast'
import ContextActionMenu from '@/components/common/contexts/ContextActionMenu.vue'
import InputDialog from '@/components/common/dialogs/InputDialog.vue'
import { formatDate, getInitials } from '@/utils'

const props = defineProps<{
    member: IServerMember
}>()

const { t } = useI18n()
const user_store = useUserStore()
const server_store = useServerStore()
const { kickMember, listMembers } = useMemberCRUD()
const toast = useToast()

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

    if (server_store.isOwnership && props.member?.user_email !== user_store.getEmail) {
        baseItems.push({
            label: t('views.server_members.kick_member'),
            icon: 'pi pi-times',
            command: async () => {
                const result = await kickMember(server_store.getPublicId!, props.member?.public_id)
                if (result.data) {
                    const resMembers = await listMembers(server_store.getPublicId!)
                    if (resMembers.data) {
                        server_store.setMembers(resMembers.data.data)
                    }
                    toast.add({
                        severity: 'success',
                        summary: t('views.server_members.member_kicked'),
                        detail: t('views.server_members.member_kicked_detail'),
                        life: 3000
                    })
                } else {
                    console.error('Failed to kick member', result)
                    toast.add({
                        severity: 'error',
                        summary: t('views.server_members.member_kicked_error'),
                        detail: t('views.server_members.member_kicked_error_detail'),
                        life: 3000
                    })
                }
            }
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
    <div
        class="group relative rounded-2xl border border-surface-200 bg-white hover:bg-surface-50 hover:shadow-md hover:border-primary-200 transition-all duration-300 overflow-hidden cursor-pointer p-5 flex items-center gap-4 w-full"
        @contextmenu="handleContextMenu"
    >
        <!-- Avatar -->
        <div class="relative shrink-0">
            <div
                class="w-14 h-14 rounded-full overflow-hidden bg-primary-200 ring-2 ring-white shadow-sm"
            >
                <img
                    v-if="member.avatar_url"
                    :src="member.avatar_url"
                    class="w-full h-full object-cover"
                    alt="Member Avatar"
                />
                <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-base font-bold text-primary-800"
                >
                    {{ getInitials(member.nickname, { mode: 'all', maxInitials: 2 }) }}
                </div>
            </div>
            <!--            <div-->
            <!--                class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"-->
            <!--                title="Online"-->
            <!--            />-->
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
                <h3
                    v-tooltip.top="member.nickname"
                    class="text-base font-semibold text-surface-900 truncate"
                >
                    {{ member.nickname }}
                </h3>
                <span
                    class="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 font-semibold uppercase tracking-wide"
                >
                    {{ member.role_name }}
                </span>
            </div>
            <p class="text-xs text-surface-600 truncate">
                {{ t('common.filters.joined_date') }}: {{ formatDate(member.created_at) }}
            </p>
        </div>

        <!-- Actions -->
        <Button
            icon="pi pi-ellipsis-v"
            severity="secondary"
            text
            rounded
            class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            @click.stop="handleContextMenu"
        >
        </Button>
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
    </div>
</template>
