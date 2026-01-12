<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import type { IMemberStatsDetails } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { useMemberActions } from '@/composables/members/useMemberActions'
import { useContextMenu } from '@/composables/useContextMenu'
import { getInitials, formatDate } from '@/utils'
import InputDialog from '@/components/common/dialogs/InputDialog.vue'
import ContextActionMenu from '@/components/common/contexts/ContextActionMenu.vue'

const props = defineProps<{
    member: IServerMember
}>()

const { t } = useI18n()
const {
    show_nickname_dialog,
    new_nickname,
    updateNickname,
    confirmUpdateNickname,
    kickMember,
    canUpdateNickname,
    canKickMember
} = useMemberActions()

const displayName = computed(() => props.member?.nickname || '')
const initials = computed(() => getInitials(displayName.value, { mode: 'all', maxInitials: 2 }))

const isArchived = computed(() => props.member?.archived ?? false)

const menuItems = computed<
    Array<{
        label: string
        icon: string
        severity?: string
        command: () => void | Promise<boolean>
    }>
>(() => {
    const items: Array<{
        label: string
        icon: string
        severity?: string
        command: () => void | Promise<boolean>
    }> = []

    // Don't show any actions if member has left the server
    if (isArchived.value) {
        return items
    }

    if (canUpdateNickname(props.member.user_email)) {
        items.push({
            label: t('views.members_aside.update_nickname'),
            icon: 'pi pi-user-edit',
            command: () => updateNickname(props.member.nickname)
        })
    }

    if (canKickMember(props.member.user_email)) {
        items.push({
            label: t('views.server_members.kick_member'),
            icon: 'pi pi-times',
            severity: 'danger',
            command: () => kickMember(props.member.public_id)
        })
    }

    return items
})

const handleNicknameUpdate = async (nickname: string): Promise<void> => {
    await confirmUpdateNickname(props.member.public_id, nickname, props.member.nickname)
}

const { menu, onRightClick } = useContextMenu(menuItems.value)

const handleActionsClick = (event: MouseEvent): void => {
    event.stopPropagation()
    onRightClick(event)
}

const onItemSelected = (item: unknown): void => {
    const menuItem = item as { command?: () => void | Promise<boolean> }
    menuItem.command?.()
}
</script>

<template>
    <div
        class="relative rounded-3xl bg-surface-0 p-8 shadow-sm overflow-hidden border border-surface-200"
    >
        <!-- Content -->
        <div class="relative flex items-start gap-6">
            <!-- Avatar -->
            <div class="relative shrink-0">
                <div
                    class="w-24 h-24 rounded-2xl overflow-hidden bg-primary-100 ring-4 ring-primary-200 shadow-lg"
                >
                    <img
                        v-if="member.avatar_url"
                        :src="member.avatar_url"
                        class="w-full h-full object-cover"
                        alt="Member Avatar"
                    />
                    <div
                        v-else
                        class="w-full h-full flex items-center justify-center text-3xl font-bold text-primary-700"
                    >
                        {{ initials }}
                    </div>
                </div>
                <div
                    class="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-primary-100 text-xs font-bold text-primary-700 shadow-lg border-2 border-white"
                >
                    {{ member.role_name }}
                </div>
            </div>

            <!-- Info & Actions -->
            <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4 mb-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-2">
                            <h1 class="text-3xl font-bold text-surface-900 truncate">
                                {{ displayName }}
                            </h1>
                            <Badge
                                v-if="isArchived"
                                :value="t('common.fields.left_server')"
                                severity="warn"
                                class="shadow-lg"
                            />
                        </div>
                        <div class="flex items-center gap-2 text-surface-600 text-sm">
                            <i class="pi pi-calendar"></i>
                            <span>
                                {{ t('views.server_members.joined') }}
                                {{ formatDate(member.created_at) }}
                            </span>
                        </div>
                    </div>

                    <!-- Actions Button -->
                    <div v-if="menuItems.length > 0" class="shrink-0">
                        <Button
                            icon="pi pi-cog"
                            severity="secondary"
                            text
                            rounded
                            @click="handleActionsClick"
                        />
                        <ContextActionMenu
                            ref="menu"
                            :items="menuItems"
                            @item-selected="onItemSelected"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Nickname Dialog -->
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
    </div>
</template>
