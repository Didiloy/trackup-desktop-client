<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import PeriodSelector from '@/components/common/selectors/PeriodSelector.vue'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { VueUiXy } from 'vue-data-ui'
import type { VueUiXyConfig, VueUiXyDatasetItem } from 'vue-data-ui'
import 'vue-data-ui/style.css'
import { EPeriod } from '@shared/contracts/enums/period.enum'

defineOptions({
    widgetMetadata: {
        id: 'member-timeline',
        title_key: 'widgets.member.timeline.title',
        icon: 'pi pi-chart-line',
        description_key: 'widgets.member.timeline.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'widgets.categories.member'
        },
        defaultSize: { w: 6, h: 8, minW: 4, minH: 6 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IMemberWidgetConfig
        height?: number
    }>(),
    {
        showIdentity: true,
        config: undefined,
        height: 350
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getMemberStatsTimeline } = useMemberStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const timeline = ref<IStatsTimeline[]>([])
const isLoading = ref(false)
const selectedPeriodType = ref<EPeriod | null>(EPeriod.ALL_TIME)
const period = ref<Date[] | null>(null)

async function fetchTimeline(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        let limit = 365
        if (selectedPeriodType.value === EPeriod.DAILY) limit = 90

        const res = await getMemberStatsTimeline(serverId, memberId.value, {
            period: selectedPeriodType.value || EPeriod.ALL_TIME,
            limit: limit
        })
        if (res.data) {
            timeline.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchTimeline()
})

watch(
    () => [server_store.getPublicId, memberId.value, selectedPeriodType.value],
    () => {
        void fetchTimeline()
    }
)

const sortedTimeline = computed(() => {
    return [...timeline.value].sort((a, b) => {
        const dateA = new Date(a.period).getTime()
        const dateB = new Date(b.period).getTime()
        return dateA - dateB
    })
})

const periods = computed(() =>
    sortedTimeline.value.map((entry) => {
        const date = new Date(entry.period)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    })
)

// Convert durations to hours for better readability
const chartData = computed<VueUiXyDatasetItem[]>(() => [
    {
        name: t('views.server_members.timeline.duration') + ' (h)',
        type: 'line',
        smooth: true,
        useArea: true,
        color: '#6366f1',
        series: sortedTimeline.value.map((t) => Number((t.total_duration / 60).toFixed(2)))
    },
    {
        name: t('views.server_members.timeline.sessions'),
        type: 'bar',
        color: '#10b981',
        series: sortedTimeline.value.map((t) => t.sessions_count)
    }
])

const chartConfig = computed<VueUiXyConfig>(() => ({
    responsive: true,
    chart: {
        backgroundColor: 'transparent',
        height: props.height,
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
        legend: {
            show: true,
            color: '#64748b'
        },
        labels: { fontSize: 12, color: '#64748b' },
        grid: {
            showHorizontalLines: true,
            showVerticalLines: false,
            stroke: '#e2e8f0',
            labels: {
                show: true,
                color: '#64748b',
                fontSize: 10,
                xAxisLabels: {
                    show: true,
                    values: periods.value,
                    rotation: -45,
                    fontSize: 10
                }
            }
        },
        tooltip: {
            show: true,
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: 12,
            borderRadius: 8,
            borderColor: '#e2e8f0',
            showPercentage: false
        },
        title: { show: false },
        userOptions: { show: false }
    },
    bar: {
        borderRadius: 4,
        useGradient: true
    },
    line: {
        useGradient: true,
        strokeWidth: 3,
        dot: {
            useSerieColor: true,
            radius: 4
        }
    }
}))

const hasData = computed(() => sortedTimeline.value.length > 0)
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
                            {{ t('views.server_members.timeline.title') }}
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

        <div v-if="hasData" class="h-full" :style="{ minHeight: `${height}px` }">
            <VueUiXy :config="chartConfig" :dataset="chartData" />
        </div>

        <div
            v-else
            class="h-full rounded-md flex items-center justify-center text-sm text-surface-400"
        >
            {{ t('common.fields.no_data') }}
        </div>
    </BaseWidgetContainer>
</template>
