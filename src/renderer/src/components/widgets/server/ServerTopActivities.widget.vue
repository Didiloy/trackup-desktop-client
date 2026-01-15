<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { computed } from 'vue'
import { useServerStatsStore } from '@/stores/server-stats'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { useActivityNavigation } from '@/composables/activities/useActivityNavigation'

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
        defaultSize: { w: 4, h: 4, minW: 4, minH: 4 }
    } satisfies IWidgetMetadata
})

const server_stats_store = useServerStatsStore()
const { t } = useI18n()
const { navigateToActivityProfile } = useActivityNavigation()
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
            <div class="flex flex-col items-center gap-2">
                <i class="pi pi-inbox text-3xl"></i>
                <p class="text-sm">{{ t('common.fields.none') }}</p>
            </div>
        </div>

        <div v-else class="px-5 pb-4 space-y-2 overflow-y-auto" style="height: calc(80% - 60px)">
            <div
                v-for="activity in server_stats_store.getDetails.top_activities"
                :key="activity.activity_id"
                class="group p-3 rounded-xl border border-surface-200 hover:border-primary-300 hover:text-primary-600 transition-colors cursor-pointer hover:bg-primary-50/30 duration-300 hover:shadow-sm"
                @click="navigateToActivityProfile(activity.activity_id)"
            >
                <div class="flex items-center gap-3">
                    <!-- Activity info -->
                    <div class="flex-1 min-w-0">
                        <span class="block font-semibold text-surface-900 truncate">
                            {{ activity.activity_name }}
                        </span>

                        <!-- Stats row -->
                        <div class="flex items-center gap-3 mt-1 text-xs text-surface-500">
                            <span class="flex items-center gap-1.5">
                                <i class="pi pi-calendar text-[10px] text-primary-500"></i>
                                <span class="font-medium text-surface-700">{{
                                    activity.total_sessions
                                }}</span>
                                sessions
                            </span>
                            <span class="flex items-center gap-1.5">
                                <i class="pi pi-clock text-[10px] text-primary-500"></i>
                                {{ formatMinutesToLabel(activity.total_duration) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
