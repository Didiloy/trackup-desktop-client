<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import { useRoute } from 'vue-router'
import { formatMinutesToLabel } from '@/utils/time.utils'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import {
    type IWidgetMetadata,
    type IActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IActivityRanking } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-ranking',
        title_key: 'widgets.activity.ranking.title',
        icon: 'pi pi-chart-bar',
        description_key: 'widgets.activity.ranking.description',
        category: {
            key: EWidgetCategory.Activity,
            label_key: 'widgets.categories.activity'
        },
        defaultSize: { w: 12, h: 4, minW: 6, minH: 3 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IActivityWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getActivityStatsRanking } = useActivityStatsCRUD()
const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)

const localRanking = ref<IActivityRanking | null>(null)
const isLoadingLocal = ref(false)

async function fetchRanking(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId || !activityId.value) return

    isLoadingLocal.value = true
    try {
        const res = await getActivityStatsRanking(serverId, activityId.value)
        if (res.data) {
            localRanking.value = res.data
        }
    } finally {
        isLoadingLocal.value = false
    }
}

onMounted(() => {
    void fetchRanking()
})

watch(
    () => [server_store.getPublicId, activityId.value],
    () => {
        void fetchRanking()
    }
)

const rankingData = computed(() => localRanking.value)
const isLoading = computed(() => isLoadingLocal.value)

const rankPercent = computed(() => {
    if (!rankingData.value) return 0
    return (
        ((rankingData.value.total_activities - (rankingData.value.rank - 1)) /
            rankingData.value.total_activities) *
        100
    )
})
</script>

<template>
    <div class="relative rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
            <p class="text-sm font-semibold text-surface-600">
                {{ t('views.server_activities.performance_section.ranking') }}
            </p>
            <ActivityIdentityCorner
                :show="props.showIdentity"
                class="static"
                :activity-id="activityId"
            />
        </div>

        <div v-if="isLoading" class="flex items-center justify-center py-10">
            <i class="pi pi-spin pi-spinner text-primary-500 text-2xl"></i>
        </div>

        <div v-else-if="rankingData" class="space-y-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-3xl font-bold text-surface-900">
                        {{ t('views.server_activities.ranking_title', { rank: rankingData.rank }) }}
                    </p>
                    <p class="text-xs text-surface-500">
                        {{
                            t('views.server_activities.ranking_out_of', {
                                rank: rankingData.rank,
                                total: rankingData.total_activities
                            })
                        }}
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-semibold text-primary-500">
                        {{ rankingData.popularity_score.toFixed(0) }}
                    </p>
                    <p class="text-xs text-surface-500">
                        {{ t('views.server_activities.card.popularity') }}
                    </p>
                </div>
            </div>

            <div class="space-y-2">
                <div
                    class="h-3 bg-surface-200 rounded-full overflow-hidden ring-1 ring-surface-200/60"
                >
                    <div
                        class="h-full bg-linear-to-r from-primary-500 to-primary-400 transition-all duration-1000"
                        :style="{ width: `${rankPercent}%` }"
                    ></div>
                </div>
                <div class="flex justify-between text-[10px] text-surface-400 font-medium px-1">
                    <span>{{ t('views.server_activities.rank_low') }}</span>
                    <span>{{ t('views.server_activities.rank_high') }}</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="bg-surface-0 rounded-2xl p-3 ring-1 ring-surface-200/60">
                    <p class="text-xs text-surface-500">{{ t('views.server_activities.total_sessions') }}</p>
                    <p class="text-lg font-semibold text-surface-900">
                        {{ rankingData.total_sessions }}
                    </p>
                </div>
                <div class="bg-surface-0 rounded-2xl p-3 ring-1 ring-surface-200/60">
                    <p class="text-xs text-surface-500">{{ t('views.server_activities.card.duration') }}</p>
                    <p class="text-lg font-semibold text-surface-900">
                        {{ formatMinutesToLabel(rankingData.total_duration) }}
                    </p>
                </div>
                <div class="bg-surface-0 rounded-2xl p-3 ring-1 ring-surface-200/60 col-span-2">
                    <p class="text-xs text-surface-500">{{ t('views.server_activities.popularity') }}</p>
                    <p class="text-lg font-semibold text-surface-900">
                        {{ rankingData.popularity_score.toFixed(1) }}
                    </p>
                </div>
            </div>
        </div>

        <div v-else class="flex items-center justify-center py-10 text-surface-400 text-sm">
            {{ t('common.fields.none') }}
        </div>
    </div>
</template>
