<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityStatsStore } from '@/stores/activity-stats'
import { useServerStore } from '@/stores/server'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import { useRoute } from 'vue-router'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import PeriodSelector from '@/components/common/selectors/PeriodSelector.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import { type IWidgetMetadata, type IActivityWidgetConfig } from '@shared/contracts/interfaces/widget.interfaces'
import type { IActivityGrowthTrends } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-growth-comparison',
        title: 'Comparaison de Croissance',
        icon: 'pi pi-chart-bar',
        description: "Compare la croissance de l'activité",
        category: {
            key: EWidgetCategory.Activity,
            label: 'Activity'
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
const activity_stats_store = useActivityStatsStore()
const server_store = useServerStore()
const { getActivityStatsGrowthTrends } = useActivityStatsCRUD()
const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)

const selectedPeriod = ref<EPeriod>(EPeriod.MONTHLY)
const localGrowthTrends = ref<IActivityGrowthTrends | null>(null)
const isLoadingLocal = ref(false)

async function fetchLocalGrowth(): Promise<void> {
    if (!props.config?.activityId || !server_store.getPublicId) return

    isLoadingLocal.value = true
    try {
        const res = await getActivityStatsGrowthTrends(server_store.getPublicId, props.config.activityId, {
             period: selectedPeriod.value
        })
        if (res.data) {
            localGrowthTrends.value = res.data
        }
    } finally {
        isLoadingLocal.value = false
    }
}

async function fetchGrowth(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId || !activityId.value) return

    if (route.params.activityId) {
        await activity_stats_store.fetchGrowthTrends(serverId, activityId.value, {
            period: selectedPeriod.value
        })
    } else if (props.config?.activityId) {
        await fetchLocalGrowth()
    }
}

onMounted(() => {
    void fetchGrowth()
})

watch(selectedPeriod, () => {
    void fetchGrowth()
})

watch(
    () => [server_store.getPublicId, activityId.value],
    () => {
        void fetchGrowth()
    }
)

const growthTrends = computed(() => activity_stats_store.getGrowthTrends ?? localGrowthTrends.value)
const isLoading = computed(() => activity_stats_store.isGrowthLoading || isLoadingLocal.value)

const metrics = computed(() => {
    if (!growthTrends.value) return []
    const g = growthTrends.value
    return [
        {
            label: t('views.server_stats.sessions'),
            current: g.sessions?.current_value ?? 0,
            previous: g.sessions?.previous_value ?? 0,
            percent: g.sessions?.change_percent ?? 0,
            change: g.sessions?.change ?? 0
        },
        {
            label: t('views.server_stats.duration'),
            current: g.duration?.current_value ?? 0,
            previous: g.duration?.previous_value ?? 0,
            percent: g.duration?.change_percent ?? 0,
            change: g.duration?.change ?? 0,
            isDuration: true
        },
        {
            label: t('views.server_stats.unique_members'),
            current: g.unique_members?.current_value ?? 0,
            previous: g.unique_members?.previous_value ?? 0,
            percent: g.unique_members?.change_percent ?? 0,
            change: g.unique_members?.change ?? 0
        }
    ]
})

function formatValue(val: number, isDuration?: boolean): string {
    if (isDuration) {
        const h = Math.floor(val / 60)
        const m = Math.floor(val % 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }
    return val.toLocaleString()
}
</script>

<template>
    <div
        class="relative rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm flex flex-col"
    >
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                <p class="text-sm font-semibold text-surface-600">
                    {{ t('views.activity.evolution_comparison') }}
                </p>
                <ActivityIdentityCorner :show="props.showIdentity" class="static" :activity-id="activityId" />
            </div>
            <PeriodSelector
                :period="null"
                v-model:selected-period-type="selectedPeriod"
                :show-custom="false"
            />
        </div>

        <div v-if="isLoading" class="flex-1 flex items-center justify-center py-10">
            <i class="pi pi-spin pi-spinner text-primary-500 text-2xl"></i>
        </div>

        <div v-else-if="growthTrends" class="space-y-4 flex-1">
            <div
                v-for="metric in metrics"
                :key="metric.label"
                class="bg-surface-0 rounded-2xl p-4 ring-1 ring-surface-200/60 transition-all hover:bg-surface-50"
            >
                <div class="flex items-center justify-between mb-2">
                    <p class="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                        {{ metric.label }}
                    </p>
                    <span
                        class="text-xs font-bold px-2 py-0.5 rounded-full"
                        :class="
                            metric.percent >= 0
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-red-100 text-red-600'
                        "
                    >
                        {{ metric.percent >= 0 ? '+' : '' }}{{ metric.percent.toFixed(1) }}%
                    </span>
                </div>

                <div class="flex items-end justify-between">
                    <div>
                        <p class="text-2xl font-bold text-surface-900">
                            {{ formatValue(metric.current, metric.isDuration) }}
                        </p>
                        <p class="text-[10px] text-surface-400 mt-1">
                            {{ t('views.activity.previous_period') }}:
                            {{ formatValue(metric.previous, metric.isDuration) }}
                        </p>
                    </div>
                    <div class="text-right">
                        <i
                            class="pi text-xl"
                            :class="[
                                metric.change >= 0
                                    ? 'pi-arrow-up-right text-emerald-500'
                                    : 'pi-arrow-down-right text-red-500'
                            ]"
                        ></i>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex-1 flex items-center justify-center py-10 text-surface-400 text-sm">
            {{ t('common.fields.none') }}
        </div>
    </div>
</template>
