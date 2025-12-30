<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import { useServerStore } from '@/stores/server'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import type { IMemberGrowthResponse } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import PeriodSelector from '@/components/common/selectors/PeriodSelector.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-growth-trends',
        title_key: 'widgets.member.growth_trends.title',
        icon: 'pi pi-arrow-up-right',
        description_key: 'widgets.member.growth_trends.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'widgets.categories.member'
        },
        defaultSize: { w: 12, h: 4, minW: 6, minH: 3 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IMemberWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getMemberStatsGrowthTrends } = useMemberStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const selectedPeriodType = ref<EPeriod | null>(EPeriod.MONTHLY)
const period = ref<Date[] | null>(null)
const growthData = ref<IMemberGrowthResponse | null>(null)
const isLoading = ref(false)

async function fetchGrowth(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberStatsGrowthTrends(serverId, memberId.value, {
            period: selectedPeriodType.value || EPeriod.MONTHLY
        })
        if (res.data) {
            growthData.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

watch(
    () => [server_store.getPublicId, memberId.value, selectedPeriodType.value],
    () => {
        void fetchGrowth()
    }
)

onMounted(() => {
    void fetchGrowth()
})

interface IGrowthMetricData {
    key: string
    label: string
    current: number
    change: number
}

const metrics = computed(() => {
    if (!growthData.value) return []

    const { current_period, growth_rates } = growthData.value
    const results: IGrowthMetricData[] = []

    if (current_period && growth_rates) {
        results.push({
            key: 'sessions',
            label: t('views.server_stats.sessions'),
            current: current_period.total_sessions ?? 0,
            change: growth_rates.sessions_growth_rate ?? 0
        })

        results.push({
            key: 'duration',
            label: t('views.server_stats.duration'),
            current: current_period.total_duration ?? 0,
            change: growth_rates.duration_growth_rate ?? 0
        })
    }

    return results
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
                <div
                    class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div class="flex items-center gap-3">
                        <h3 class="text-lg font-bold text-surface-900">
                            {{ t('widgets.member.growth_trends.title') }}
                        </h3>
                        <MemberIdentityCorner
                            :show="props.showIdentity"
                            class="static"
                            :member-id="memberId"
                        />
                    </div>

                    <PeriodSelector
                        v-model:period="period"
                        v-model:selected-period-type="selectedPeriodType"
                    />
                </div>
            </div>
        </template>

        <div v-if="metrics.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 h-full p-4">
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
