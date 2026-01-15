<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import AvatarButton from '@/components/common/buttons/AvatarButton.vue'
import Icon from '@/components/common/icons/Icon.vue'
import { useServerStore } from '@/stores/server'
import { useServerStatsStore } from '@/stores/server-stats'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'
import { formatMinutesToLabel } from '@/utils/time.utils'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-top-member-month',
        title_key: 'widgets.server.top_member_month.title',
        icon: 'pi pi-star',
        description_key: 'widgets.server.top_member_month.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'widgets.categories.server'
        },
        defaultSize: { w: 2, h: 3, minW: 2, minH: 3 }
    } satisfies IWidgetMetadata
})

const { t } = useI18n()
const server_store = useServerStore()
const server_stats_store = useServerStatsStore()
const { navigateToMemberProfile } = useMemberNavigation()

const top_member_id = computed(() => server_stats_store.getDetails?.server_stats.top_member_month)
const top_member = computed(() => {
    if (!top_member_id.value) return null
    return server_store.getMemberById(top_member_id.value)
})

const member_stats = computed(() => {
    if (!top_member_id.value) return null
    return server_stats_store.getDetails?.top_members?.find(
        (m) => m.member_id === top_member_id.value
    )
})

const HandleMemberClick = async (): Promise<void> => {
    if (top_member_id.value) {
        await navigateToMemberProfile(top_member_id.value)
    }
}
</script>

<template>
    <BaseWidgetContainer :loading="server_stats_store.isLoading">
        <template #header>
            <div class="px-5 pt-5 pb-3">
                <div class="flex items-center gap-2">
                    <Icon icon="pi pi-star" class="text-blue-500" />
                    <h3
                        class="text-lg font-bold text-surface-900"
                        v-tooltip.bottom="t('views.server_stats.top_member_month_tooltip')"
                    >
                        {{ t('views.server_stats.top_member_month') }}
                    </h3>
                </div>
            </div>
        </template>

        <div
            v-if="!top_member"
            class="text-center py-8 text-surface-400 h-full flex items-center justify-center"
        >
            <div class="flex flex-col items-center gap-2">
                <Icon icon="pi pi-inbox" class="text-3xl" />
                <p class="text-sm">{{ t('common.fields.none') }}</p>
            </div>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center h-full gap-3 cursor-pointer hover:bg-surface-50 rounded-xl transition-colors p-4"
            @click="HandleMemberClick"
        >
            <AvatarButton
                :image-url="top_member.avatar_url"
                :label="top_member.nickname"
                size="large"
                @click="HandleMemberClick"
            />
            <div class="text-center w-full">
                <p class="text-lg font-bold text-surface-900 truncate">{{ top_member.nickname }}</p>
                <p class="text-sm text-surface-500">{{ t('views.server_stats.member_of_month') }}</p>
                <div
                    v-if="member_stats"
                    class="mt-2 flex items-center justify-center gap-3 text-xs text-surface-600"
                >
                    <span class="flex items-center gap-1">
                        <Icon icon="pi pi-clock" class="text-[10px]" />
                        {{ formatMinutesToLabel(member_stats.total_duration ?? 0) }}
                    </span>
                    <span class="flex items-center gap-1">
                        <Icon icon="pi pi-calendar" class="text-[10px]" />
                        {{ member_stats.total_sessions }} sessions
                    </span>
                </div>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
