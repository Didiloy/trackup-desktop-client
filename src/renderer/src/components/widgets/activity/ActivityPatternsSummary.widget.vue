<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import { useRoute } from 'vue-router'
import {
    type IWidgetMetadata,
    type IActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'activity-patterns-summary',
        title_key: 'widgets.activity.patterns.title',
        icon: 'pi pi-calendar',
        description_key: 'widgets.activity.patterns.description',
        category: {
            key: EWidgetCategory.Activity,
            label_key: 'widgets.categories.activity'
        },
        defaultSize: { w: 4, h: 6, minW: 4, minH: 6 },
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
const { getActivityStatsDetails } = useActivityStatsCRUD()

const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)
const localDetails = ref<IActivityStatsDetails | null>(null)

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!activityId.value || !serverId) return

    try {
        const res = await getActivityStatsDetails(serverId, activityId.value)
        if (res.data) {
            localDetails.value = res.data
        }
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    void fetchStats()
})

watch(
    () => [server_store.getPublicId, activityId.value],
    () => {
        void fetchStats()
    }
)

const patternsData = computed(() => {
    const details = localDetails.value
    return details?.time_patterns
})

const dayNames = computed(() => [
    t('common.weekdays.short.sunday'),
    t('common.weekdays.short.monday'),
    t('common.weekdays.short.tuesday'),
    t('common.weekdays.short.wednesday'),
    t('common.weekdays.short.thursday'),
    t('common.weekdays.short.friday'),
    t('common.weekdays.short.saturday')
])

function formatDay(value: number | null | undefined): string {
    if (value === null || value === undefined) return t('common.fields.none')
    return dayNames.value[value] ?? t('common.fields.none')
}

const cards = computed(() => {
    const p = patternsData.value
    return [
        {
            label: t('views.server_activities.performance_section.peak_day'),
            value: formatDay(p?.peak_day_of_week)
        },
        {
            icon: 'pi pi-clock',
            label: t('views.server_activities.performance_section.peak_hour'),
            value:
                p?.peak_hour !== null && p?.peak_hour !== undefined
                    ? `${p.peak_hour}h`
                    : t('common.fields.none'),
            color: 'text-violet-500',
            bg: 'bg-violet-100'
        },
        {
            icon: 'pi pi-hourglass',
            label: t('views.server_activities.performance_section.avg_session_hours'),
            value:
                p?.avg_session_hours !== undefined
                    ? `${p.avg_session_hours.toFixed(1)}h`
                    : t('common.fields.none'),
            color: 'text-pink-500',
            bg: 'bg-pink-100'
        },
        {
            label: t('views.server_activities.performance_section.current_streak'),
            value: `${p?.streak_current ?? 0} ${t('common.time.days')}`
        },
        {
            label: t('views.server_activities.performance_section.longest_streak'),
            value: `${p?.streak_longest ?? 0} ${t('common.time.days')}`
        },
        {
            label: t('views.server_activities.performance_section.likes_per_session'),
            value: (p?.likes_per_session ?? 0).toFixed(1)
        },
        {
            label: t('views.server_activities.performance_section.unique_participants'),
            value: (p?.unique_participants ?? 0).toLocaleString()
        }
    ]
})
</script>

<template>
    <BaseWidgetContainer>
        <ActivityIdentityCorner :show="props.showIdentity" :activity-id="activityId" />
        <p class="text-sm font-semibold text-surface-600 mb-4">
            {{ t('views.server_activities.performance_section.patterns') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
                v-for="card in cards"
                :key="card.label"
                class="rounded-2xl bg-surface-200/80 p-4 ring-1 ring-surface-200/60"
            >
                <p class="text-xs text-surface-500">{{ card.label }}</p>
                <p class="text-lg font-semibold text-surface-900">{{ card.value }}</p>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
