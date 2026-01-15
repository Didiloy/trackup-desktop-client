<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { useActivityNavigation } from '@/composables/activities/useActivityNavigation'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import Icon from '@/components/common/icons/Icon.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-activity-of-week',
        title_key: 'widgets.server.activity_of_week.title',
        icon: 'pi pi-fire',
        description_key: 'widgets.server.activity_of_week.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'widgets.categories.server'
        },
        defaultSize: { w: 2, h: 3, minW: 2, minH: 3 }
    } satisfies IWidgetMetadata
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
const { navigateToActivityProfile } = useActivityNavigation()

const activity_id = computed(() => server_stats_store.getDetails?.server_stats.activity_of_week)
const activity = computed(() => {
    if (!activity_id.value) return null
    return server_stats_store.getDetails?.top_activities?.find(
        (a) => a.activity_id === activity_id.value
    )
})

const HandleActivityClick = async (): Promise<void> => {
    if (activity_id.value) {
        await navigateToActivityProfile(activity_id.value)
    }
}
</script>

<template>
    <BaseWidgetContainer :loading="server_stats_store.isLoading">
        <template #header>
            <div class="px-5 pt-5 pb-3">
                <div class="flex items-center gap-2">
                    <Icon icon="pi pi-fire" class="text-red-500" />
                    <h3
                        class="text-lg font-bold text-surface-900"
                        v-tooltip.bottom="t('views.server_stats.activity_of_week_tooltip')"
                    >
                        {{ t('views.server_stats.activity_of_week') }}
                    </h3>
                </div>
            </div>
        </template>

        <div
            v-if="!activity"
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
            @click="HandleActivityClick"
        >
            <div
                class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center shadow-sm"
            >
                <Icon icon="pi pi-fire" class="text-red-500 text-3xl" />
            </div>
            <div class="text-center w-full">
                <p class="text-lg font-bold text-surface-900 truncate">
                    {{ activity.activity_name }}
                </p>
                <p class="text-sm text-surface-500">
                    {{ t('views.server_stats.most_played_this_week') }}
                </p>
                <div class="mt-2 flex items-center justify-center gap-3 text-xs text-surface-600">
                    <span class="flex items-center gap-1">
                        <Icon icon="pi pi-calendar" class="text-[10px]" />
                        {{ activity.total_sessions }} sessions
                    </span>
                </div>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
