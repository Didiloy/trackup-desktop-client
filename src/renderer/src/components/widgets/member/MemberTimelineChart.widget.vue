<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { VueUiXy } from 'vue-data-ui'
import type { VueUiXyConfig, VueUiXyDatasetItem } from 'vue-data-ui'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-timeline',
        title: 'Timeline',
        icon: 'pi pi-chart-line',
        description: 'Affiche la timeline d\'activité du membre',
        category: {
            key: EWidgetCategory.Member,
            label: 'Member'
        },
        defaultSize: { w: 6, h: 8, minW: 4, minH: 6 },
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
const { getMemberStatsTimeline } = useMemberStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const timeline = ref<IStatsTimeline[]>([])
const isLoading = ref(false)
const selectedPeriod = ref<EPeriod>(EPeriod.WEEKLY)

async function fetchTimeline(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberStatsTimeline(serverId, memberId.value, {
            period: selectedPeriod.value,
            limit: 30
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
    () => [server_store.getPublicId, memberId.value, selectedPeriod.value],
    () => {
        void fetchTimeline()
    }
)

const periods = computed(() =>
    timeline.value.map((entry) => {
        const date = new Date(entry.period)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    })
)

// Convert durations to hours for better readability
const chartData = computed<VueUiXyDatasetItem[]>(() => [
    {
        name: t('views.member.timeline.duration') + ' (h)',
        type: 'line',
        smooth: true,
        useArea: true,
        color: '#6366f1',
        series: timeline.value.map((t) => Number((t.total_duration / 60).toFixed(2)))
    },
    {
        name: t('views.member.timeline.sessions'),
        type: 'bar',
        color: '#10b981',
        series: timeline.value.map((t) => t.sessions_count)
    }
])

const chartConfig = computed<VueUiXyConfig>(() => ({
    responsive: true,
    chart: {
        backgroundColor: 'transparent',
        height: 300,
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
                xAxisLabels: {
                    show: true,
                    values: periods.value,
                    rotation: -45
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
        userOptions: {
            show: false
        }
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
</script>

<template>
    <BaseWidgetContainer :title="t('views.member.timeline.title')" :loading="isLoading">
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        <template #actions>
            <SelectButton
                v-model="selectedPeriod"
                :options="[
                    { label: t('common.periods.daily'), value: EPeriod.DAILY },
                    { label: t('common.periods.weekly'), value: EPeriod.WEEKLY },
                    { label: t('common.periods.monthly'), value: EPeriod.MONTHLY }
                ]"
                option-label="label"
                option-value="value"
                aria-labelledby="basic"
                size="small"
            />
        </template>
        <div v-if="timeline.length > 0" class="w-full h-96">
            <VueUiXy :config="chartConfig" :dataset="chartData" />
        </div>
        <div v-else class="flex items-center justify-center h-64 text-gray-500">
            {{ t('common.no_data') }}
        </div>
    </BaseWidgetContainer>
</template>
