<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { computed } from 'vue'
import { useServerStatsStore } from '@/stores/server-stats'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-top-activities',
        title_key: 'widgets.server.top_activities.title',
        icon: 'pi pi-trophy',
        description_key: 'widgets.server.top_activities.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'widgets.categories.server'
        },
        defaultSize: { w: 6, h: 4, minW: 4, minH: 3 }
    } satisfies IWidgetMetadata
})

const server_stats_store = useServerStatsStore()
const { t } = useI18n()

const maxSessions = computed(() => {
    const activities = server_stats_store.getDetails?.top_activities
    if (!activities?.length) return 1
    return Math.max(...activities.map((a) => a.total_sessions))
})
</script>

<template>
    <BaseWidgetContainer :loading="server_stats_store.isLoading">
        <template #header>
            <div class="px-5 pt-5 pb-3">
                <h3 class="text-lg font-bold text-surface-900">
                    {{ t('views.server_stats.top_activities') }}
                </h3>
            </div>
        </template>
        <div
            v-if="!server_stats_store.getDetails?.top_activities?.length"
            class="text-center py-8 text-surface-400 h-full flex items-center justify-center"
        >
            {{ t('common.fields.none') }}
        </div>

        <div v-else class="space-y-5 h-full overflow-y-auto pr-1">
            <div
                v-for="activity in server_stats_store.getDetails.top_activities"
                :key="activity.activity_id"
                class="group"
            >
                <div class="flex justify-between items-center mb-1.5">
                    <span class="text-sm font-medium text-surface-900 truncate pr-4">
                        <router-link
                            :to="{
                                name: 'ServerActivityProfile',
                                params: { activityId: activity.activity_id }
                            }"
                            class="hover:text-primary-600 hover:underline transition-colors"
                        >
                            {{ activity.activity_name }}
                        </router-link>
                    </span>
                    <span class="text-xs text-surface-500 flex items-center gap-2">
                        <span class="flex items-center gap-1">
                            <i class="pi pi-clock text-[10px]"></i>
                            {{ formatMinutesToLabel(activity.total_duration) }}
                        </span>
                        <span class="font-medium text-surface-700">
                            {{ activity.total_sessions }}
                        </span>
                    </span>
                </div>

                <div class="h-2 w-full bg-surface-100 rounded-full overflow-hidden">
                    <div
                        class="h-full bg-primary-500 rounded-full transition-all duration-500 group-hover:bg-primary-400"
                        :style="{ width: `${(activity.total_sessions / maxSessions) * 100}%` }"
                    ></div>
                </div>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
