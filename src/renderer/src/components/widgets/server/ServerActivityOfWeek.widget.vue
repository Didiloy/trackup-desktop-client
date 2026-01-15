<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { useActivityNavigation } from '@/composables/activities/useActivityNavigation'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
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
                    <i class="pi pi-fire text-red-500"></i>
                    <h3 class="text-lg font-bold text-surface-900">
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
                <i class="pi pi-inbox text-3xl"></i>
                <p class="text-sm">{{ t('common.fields.none') }}</p>
            </div>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center h-full gap-4 cursor-pointer hover:bg-surface-50 rounded-xl transition-colors p-4"
            @click="HandleActivityClick"
        >
            <div
                class="w-16 h-16 rounded-full bg-linear-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg"
            >
                <i class="pi pi-fire text-white text-3xl"></i>
            </div>
            <div class="text-center">
                <p class="text-lg font-bold text-surface-900">{{ activity.activity_name }}</p>
                <p class="text-sm text-surface-500">
                    {{ t('views.server_stats.most_played_this_week') }}
                </p>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
