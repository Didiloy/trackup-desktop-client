<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import AvatarButton from '@/components/common/buttons/AvatarButton.vue'
import { useServerStore } from '@/stores/server'
import { useServerStatsStore } from '@/stores/server-stats'
import { useMemberActions } from '@/composables/members/useMemberActions'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'

defineOptions({
    widgetMetadata: {
        id: 'server-top-members',
        title_key: 'widgets.server.top_members.title',
        icon: 'pi pi-star',
        description_key: 'widgets.server.top_members.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'widgets.categories.server'
        },
        defaultSize: { w: 6, h: 4, minW: 4, minH: 3 }
    } satisfies IWidgetMetadata
})

const server_store = useServerStore()
const server_stats_store = useServerStatsStore()
const { navigateToMemberProfile } = useMemberNavigation()
const { t } = useI18n()

const handleMemberClick = async (memberId: string): Promise<void> => {
    await navigateToMemberProfile(memberId)
}
</script>

<template>
    <BaseWidgetContainer
        :title="t('views.server_stats.top_members')"
        :loading="server_stats_store.isLoading"
    >
        <div
            v-if="!server_stats_store.getDetails?.top_members?.length"
            class="text-center py-8 text-surface-400 h-full flex items-center justify-center"
        >
            {{ t('common.fields.none') }}
        </div>

        <div v-else class="space-y-4 h-full overflow-y-auto pr-1">
            <div
                v-for="(member, index) in server_stats_store.getDetails.top_members"
                :key="member.member_id"
                class="flex items-center gap-4 p-2 rounded-xl hover:bg-surface-50 transition-colors"
            >
                <div class="relative shrink-0 font-bold text-surface-400 w-6 text-center">
                    <i v-if="index === 0" class="pi pi-crown text-amber-500 text-lg"></i>
                    <span v-else>#{{ index + 1 }}</span>
                </div>

                <AvatarButton
                    :image-url="server_store.getMemberById(member.member_id)?.avatar_url"
                    :label="server_store.getMemberById(member.member_id)?.nickname"
                    size="normal"
                    @click="handleMemberClick(member.member_id)"
                />

                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-surface-900 truncate">
                        {{ server_store.getMemberById(member.member_id)?.nickname }}
                    </p>
                    <p class="text-xs text-surface-500 truncate">
                        {{ member.total_sessions }}
                        {{ t('views.server_activities.performance_section.sessions', 'sessions') }}
                    </p>
                </div>

                <div class="text-right shrink-0">
                    <span
                        class="text-sm font-medium text-primary-600 bg-primary-200 px-2 py-1 rounded-md select-none"
                    >
                        {{ formatMinutesToLabel(member.total_duration ?? 0) }}
                    </span>
                </div>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
