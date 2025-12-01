<script setup lang="ts">
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import { useI18n } from 'vue-i18n'
import { useContextMenu } from '@/composables/useContextMenu'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useToast } from 'primevue/usetoast'
import ContextActionMenu from '@/components/common/contexts/ContextActionMenu.vue'

const props = defineProps<{
    member: IServerMember
}>()

const { t } = useI18n()
const user_store = useUserStore()
const server_store = useServerStore()
const { kickMember, listMembers } = useMemberCRUD()
const toast = useToast()
const current_user_is_creator = computed(() => {
    const currentMember = server_store.getMembers?.find((m) => m.user_email === user_store.getEmail)
    return currentMember?.role_name === 'creator'
})

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric'
    })
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

    if (current_user_is_creator.value) {
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
        class="group relative rounded-2xl border border-surface-200 bg-surface-100/50 hover:bg-surface-100 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer p-4 flex items-center gap-4"
    >
        <!-- Avatar -->
        <div class="relative shrink-0">
            <div
                class="w-12 h-12 rounded-full overflow-hidden bg-surface-200 ring-2 ring-surface-100"
            >
                <img
                    v-if="member.avatar_url"
                    :src="member.avatar_url"
                    class="w-full h-full object-cover"
                    alt="Member Avatar"
                />
                <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-lg font-bold text-surface-600 bg-surface-200"
                >
                    {{ member.nickname.charAt(0).toUpperCase() }}
                </div>
            </div>
            <div
                class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-surface-100"
                title="Online"
            ></div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
                <h3
                    class="text-sm font-bold text-surface-900 truncate"
                    v-tooltip.top="member.nickname"
                >
                    {{ member.nickname }}
                </h3>
                <span
                    class="text-xs px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 font-medium uppercase tracking-wide text-[10px]"
                >
                    {{ member.role_name }}
                </span>
            </div>
            <p class="text-xs text-surface-500 truncate mt-0.5">
                {{ t('common.filters.sort.joined_at') }}: {{ formatDate(member.created_at) }}
            </p>
        </div>

        <!-- Actions -->
        <Button
            icon="pi pi-ellipsis-v"
            severity="secondary"
            rounded
            variant="outlined"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            @contextmenu="handleContextMenu"
            @click="handleContextMenu"
        >
        </Button>
        <ContextActionMenu ref="menu" :items="items" @item-selected="onItemSelected" />
    </div>
</template>
