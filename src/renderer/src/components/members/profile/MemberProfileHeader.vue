<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import type { IMemberStatsDetails } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { useMemberActions } from '@/composables/members/useMemberActions'
import { getInitials, formatDate } from '@/utils'
import InputDialog from '@/components/common/dialogs/InputDialog.vue'

const props = withDefaults(
    defineProps<{
        member: IServerMember
        stats?: IMemberStatsDetails | null
        showStats?: boolean
    }>(),
    {
        stats: null,
        showStats: true
    }
)

const { t } = useI18n()
const {
    show_nickname_dialog,
    new_nickname,
    is_updating,
    isKicking,
    updateNickname,
    confirmUpdateNickname,
    kickMember,
    canUpdateNickname,
    canKickMember
} = useMemberActions()

const displayName = computed(() => props.member?.nickname || '')
const initials = computed(() => getInitials(displayName.value, { mode: 'all', maxInitials: 2 }))

const menuItems = computed<Array<{ label: string; icon: string; severity?: string; command: () => void | Promise<boolean> }>>(() => {
    const items: Array<{ label: string; icon: string; severity?: string; command: () => void | Promise<boolean> }> = []

    if (canUpdateNickname(props.member.user_email)) {
        items.push({
            label: t('views.members_aside.update_nickname'),
            icon: 'pi pi-user-edit',
            command: () => updateNickname(props.member.public_id, props.member.nickname)
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

const handleNicknameUpdate = (nickname: string): void => {
    confirmUpdateNickname(props.member.public_id, nickname, props.member.nickname)
}
</script>

<template>
    <div class="relative rounded-3xl bg-linear-to-br from-primary-500 to-primary-700 p-8 shadow-xl overflow-hidden">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        <!-- Content -->
        <div class="relative flex items-start gap-6">
            <!-- Avatar -->
            <div class="relative shrink-0">
                <div
                    class="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm ring-4 ring-white/30 shadow-2xl"
                >
                    <img
                        v-if="member.avatar_url"
                        :src="member.avatar_url"
                        class="w-full h-full object-cover"
                        alt="Member Avatar"
                    />
                    <div
                        v-else
                        class="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                    >
                        {{ initials }}
                    </div>
                </div>
                <div
                    class="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-primary-700 shadow-lg"
                >
                    {{ member.role_name }}
                </div>
            </div>

            <!-- Info & Actions -->
            <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4 mb-3">
                    <div class="flex-1 min-w-0">
                        <h1 class="text-3xl font-bold text-white mb-2 truncate">
                            {{ displayName }}
                        </h1>
                        <div class="flex items-center gap-2 text-white/80 text-sm">
                            <i class="pi pi-calendar"></i>
                            <span>
                                {{ t('views.server_members.joined') }}
                                {{ formatDate(member.created_at) }}
                            </span>
                        </div>
                    </div>

                    <!-- Actions Menu -->
                    <div v-if="menuItems.length > 0" class="shrink-0">
                        <SplitButton
                            :model="menuItems"
                            :loading="isKicking"
                            severity="secondary"
                            class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                            :pt="{
                                root: { class: 'border-white/30' },
                                button: { class: 'text-white' },
                                menuButton: { class: 'text-white' }
                            }"
                        >
                            <template #default>
                                <i class="pi pi-cog"></i>
                                <span class="ml-2">{{ t('common.actions.actions') }}</span>
                            </template>
                        </SplitButton>
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
            :loading="is_updating"
            @confirm="handleNicknameUpdate"
        />
    </div>
</template>
