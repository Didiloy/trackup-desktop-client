<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { VueUiXy } from 'vue-data-ui'
import type { VueUiXyConfig, VueUiXyDatasetItem } from 'vue-data-ui'
import 'vue-data-ui/style.css'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useMemberActivityStatsCRUD } from '@/composables/members/useMemberActivityStatsCRUD'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import type { IMemberActivityProgression } from '@shared/contracts/interfaces/entities-stats/member-activity-stats.interfaces'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import {
    type IWidgetMetadata,
    type IMemberActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { useRoute } from 'vue-router'
import PeriodSelector from '@/components/common/selectors/PeriodSelector.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-activity-progression',
        title_key: 'widgets.member_activity.progression.title',
        icon: 'pi pi-chart-line',
        description_key: 'widgets.member_activity.progression.description',
        discoverable: false,
        category: {
            key: EWidgetCategory.MemberActivities,
            label_key: 'widgets.categories.member_activity'
        },
        defaultSize: { w: 6, h: 8, minW: 4, minH: 6 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IMemberActivityWidgetConfig
        height?: number
    }>(),
    {
        showIdentity: true,
        config: undefined,
        height: 300
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getMemberActivityStatsProgression } = useMemberActivityStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)

const selectedPeriodType = ref<EPeriod | null>(EPeriod.ALL_TIME)
const period = ref<Date[] | null>(null)
const progressionData = ref<IMemberActivityProgression[]>([])
const isLoading = ref(false)

async function fetchProgression(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !activityId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberActivityStatsProgression(
            serverId,
            memberId.value,
            activityId.value,
            {
                period: selectedPeriodType.value || EPeriod.ALL_TIME,
                limit: 12
            }
        )

        if (res.data) {
            progressionData.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchProgression()
})

watch(
    () => [server_store.getPublicId, memberId.value, activityId.value, selectedPeriodType.value],
    () => {
        void fetchProgression()
    }
)

const periods = computed(() =>
    progressionData.value.map((entry) => {
        const date = new Date(entry.period_start)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    })
)

const dataset = computed<VueUiXyDatasetItem[]>(() => [
    {
        name: t('widgets.member_activity.progression.sessions'),
        type: 'bar',
        color: '#6366f1',
        series: progressionData.value.map((entry) => entry.total_sessions)
    },
    {
        name: t('widgets.member_activity.progression.proficiency'),
        type: 'line',
        color: '#10b981',
        smooth: true,
        series: progressionData.value.map((entry) => entry.proficiency_score)
    }
])

const xyConfig = computed<VueUiXyConfig>(() => ({
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
            borderColor: '#e2e8f0'
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

const hasData = computed(() => progressionData.value && progressionData.value.length > 0)
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
                            {{ t('widgets.member_activity.progression.title') }}
                        </h3>
                        <ActivityIdentityCorner
                            :show="props.showIdentity"
                            class="static ml-2"
                            :activity-id="activityId"
                        />
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
            <VueUiXy :dataset="dataset" :config="xyConfig" />
        </div>

        <div
            v-else
            class="h-full rounded-md flex items-center justify-center text-sm text-surface-400"
        >
            {{ t('common.fields.no_data') }}
        </div>
    </BaseWidgetContainer>
</template>
