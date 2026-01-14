<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
    IServerMember,
    IUpdateMemberProfileDto
} from '@shared/contracts/interfaces/entities/member.interfaces'
import { useMemberActions } from '@/composables/members/useMemberActions'
import { useServerMemberStore } from '@/stores/server-member'
import { useContextMenu } from '@/composables/useContextMenu'
import { getInitials, formatDate } from '@/utils'
import MemberProfileEditDialog from '@/components/members/profile/MemberProfileEditDialog.vue'
import ContextActionMenu from '@/components/common/contexts/ContextActionMenu.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'

const props = defineProps<{
    member: IServerMember
}>()

const { t } = useI18n()
const server_member_store = useServerMemberStore()

const {
    show_profile_dialog,
    updateProfile,
    confirmUpdateProfile,
    kickMember,
    canUpdateProfile,
    canKickMember,
    show_kick_confirmation,
    confirmKickMember
} = useMemberActions()

// Use store data if this is the current user's profile for reactivity
const isOwnProfile = computed(() => props.member.public_id === server_member_store.getPublicId)

const displayMember = computed<IServerMember>(() => {
    if (isOwnProfile.value && server_member_store.hasMember) {
        // Use reactive store data for own profile
        return server_member_store.getMember!
    }
    // Use props data for other members
    return props.member
})

const displayName = computed(() => displayMember.value?.nickname || '')
const initials = computed(() => getInitials(displayName.value, { mode: 'all', maxInitials: 2 }))

const isArchived = computed(() => displayMember.value?.archived ?? false)

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

    if (canUpdateProfile(displayMember.value.public_id)) {
        items.push({
            label: t('views.members_aside.update_profile'),
            icon: 'pi pi-user-edit',
            command: () => updateProfile(displayMember.value.nickname, displayMember.value.avatar_url)
        })
    }

    if (canKickMember(props.member.public_id)) {
        items.push({
            label: t('views.server_members.kick_member'),
            icon: 'pi pi-times',
            severity: 'danger',
            command: () => kickMember(displayMember.value.public_id)
        })
    }

    return items
})

const handleProfileUpdate = async (data: IUpdateMemberProfileDto): Promise<void> => {
    await confirmUpdateProfile(props.member.public_id, data)
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
                    class="w-24 h-24 rounded-2xl overflow-hidden"
                >
                    <img
                        v-if="displayMember.avatar_url"
                        :src="displayMember.avatar_url"
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
                    {{ displayMember.role_name }}
                </div>
            </div>

            <!-- Info & Actions -->
            <div class="flex-1 min-w-0 mt-5">
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
                                {{ formatDate(displayMember.created_at) }}
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

        <!-- Profile Edit Dialog -->
        <MemberProfileEditDialog
            v-model="show_profile_dialog"
            :server-member="displayMember"
            :on-confirm="handleProfileUpdate"
        />

        <!-- Kick Confirmation Dialog -->
        <ConfirmationDialog
            v-model="show_kick_confirmation"
            :title="t('views.server_members.kick_member')"
            :message="t('views.server_members.kick_member_confirm')"
            :confirm-label="t('views.server_members.kick_member')"
            :cancel-label="t('common.actions.cancel')"
            confirm-severity="danger"
            :on-confirm="confirmKickMember"
        />
    </div>
</template>
