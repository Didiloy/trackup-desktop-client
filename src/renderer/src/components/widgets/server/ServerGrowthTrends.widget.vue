<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import { useServerStatsStore } from '@/stores/server-stats'
import { useServerStore } from '@/stores/server'
import type { IServerGrowthResponse } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-growth-trends',
        title_key: 'common.widgets.server.growth_trends.title',
        icon: 'pi pi-arrow-up-right',
        description_key: 'common.widgets.server.growth_trends.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'common.widgets.categories.server'
        },
        defaultSize: { w: 12, h: 4, minW: 6, minH: 3 }
    } satisfies IWidgetMetadata
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
const server_store = useServerStore()

const selectedPeriod = ref<EPeriod>(EPeriod.MONTHLY)
const growthData = ref<IServerGrowthResponse | null>(null)
const isLoading = ref(false)

async function fetchGrowth(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId) return

    isLoading.value = true
    try {
        const res = await server_stats_store.fetchGrowthTrends(serverId, {
            period: selectedPeriod.value
        })
        if ('data' in res && res.data) {
            growthData.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

const periodOptions = [
    { label: t('common.periods.daily'), value: EPeriod.DAILY },
    { label: t('common.periods.weekly'), value: EPeriod.WEEKLY },
    { label: t('common.periods.monthly'), value: EPeriod.MONTHLY },
    { label: t('common.periods.yearly'), value: EPeriod.YEARLY }
]

watch(selectedPeriod, fetchGrowth)
watch(
    () => server_store.getPublicId,
    (newId) => {
        if (newId) fetchGrowth()
    }
)

onMounted(() => {
    if (server_store.getPublicId) {
        fetchGrowth()
    }
})

const metrics = computed(() => {
    if (!growthData.value) return []

    const { current_period, growth_rates } = growthData.value
    if (!current_period || !growth_rates) return []

    return [
        {
            key: 'sessions',
            label: t('views.server_stats.sessions'),
            current: current_period.total_sessions ?? 0,
            change: growth_rates.sessions_growth_rate ?? 0
        },
        {
            key: 'duration',
            label: t('views.server_stats.duration'),
            current: current_period.total_duration ?? 0,
            change: growth_rates.duration_growth_rate ?? 0
        },
        {
            key: 'members',
            label: t('views.server_stats.members'),
            current: current_period.total_members ?? 0,
            change: growth_rates.members_growth_rate ?? 0
        },
        {
            key: 'active_members',
            label: t('views.server_stats.active_members'),
            current: current_period.active_members ?? 0,
            change: growth_rates.active_members_growth_rate ?? 0
        }
    ]
})

function formatChange(value: number): string {
    if (value === undefined || value === null) return '0.0%'
    const prefix = value > 0 ? '+' : ''
    return `${prefix}${value.toFixed(1)}%`
}

function getGrowthColor(value: number): string {
    if (value > 0) return 'text-emerald-500'
    if (value < 0) return 'text-rose-500'
    return 'text-surface-400'
}

function getGrowthIcon(value: number): string {
    if (value > 0) return 'pi pi-arrow-up-right'
    if (value < 0) return 'pi pi-arrow-down-right'
    return 'pi pi-minus'
}
</script>

<template>
    <BaseWidgetContainer :loading="isLoading">
        <template #header>
            <div class="px-5 pt-5 pb-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-bold text-surface-900">
                        {{ t('views.server_stats.growth_trends') }}
                    </h3>
                    <Select
                        v-model="selectedPeriod"
                        :options="periodOptions"
                        option-label="label"
                        option-value="value"
                        class="w-32"
                        size="small"
                    />
                </div>
            </div>
        </template>

        <div v-if="metrics.length > 0" class="grid grid-cols-1 gap-4 h-full">
            <div
                v-for="metric in metrics"
                :key="metric.key"
                class="flex items-center justify-between p-3 rounded-2xl bg-surface-50/50"
            >
                <div>
                    <p class="text-xs font-medium text-surface-500 uppercase tracking-wider mb-1">
                        {{ metric.label }}
                    </p>
                    <p class="text-xl font-bold text-surface-900">
                        {{
                            metric.key === 'duration'
                                ? (metric.current / 60).toFixed(1) + 'h'
                                : metric.current.toLocaleString()
                        }}
                    </p>
                </div>

                <div class="text-right">
                    <div
                        class="flex items-center gap-1 font-bold text-sm"
                        :class="getGrowthColor(metric.change)"
                    >
                        <i :class="getGrowthIcon(metric.change)"></i>
                        {{ formatChange(metric.change) }}
                    </div>
                    <p class="text-[10px] text-surface-400 mt-0.5">
                        vs {{ t('common.time.previous') }}
                    </p>
                </div>
            </div>
        </div>

        <div v-else class="h-full flex items-center justify-center text-sm text-surface-400">
            {{ t('common.fields.none') }}
        </div>
    </BaseWidgetContainer>
</template>
