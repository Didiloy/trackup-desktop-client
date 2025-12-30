<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStore } from '@/stores/server'
import { useRoute } from 'vue-router'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import { computed, ref, onMounted, watch } from 'vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import {
    type IWidgetMetadata,
    type IActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-top-contributors',
        title_key: 'widgets.activity.top_contributors.title',
        icon: 'pi pi-star',
        description_key: 'widgets.activity.top_contributors.description',
        category: {
            key: EWidgetCategory.Activity,
            label_key: 'widgets.categories.activity'
        },
        defaultSize: { w: 6, h: 4, minW: 4, minH: 3 },
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
const isLoadingLocal = ref(false)

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!activityId.value || !serverId) return

    isLoadingLocal.value = true
    try {
        const res = await getActivityStatsDetails(serverId, activityId.value)
        if (res.data) {
            localDetails.value = res.data
        }
    } finally {
        isLoadingLocal.value = false
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

const contributorsData = computed(() => {
    const details = localDetails.value
    return details?.top_contributors || []
})
</script>

<template>
    <div class="relative rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <ActivityIdentityCorner :show="props.showIdentity" :activity-id="activityId" />
        <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-surface-600">
                {{ t('views.activity.card.top_contributor') }}
            </p>
            <span class="text-xs text-surface-400">{{ contributorsData.length }} </span>
        </div>

        <div class="space-y-3">
            <div
                v-for="member in contributorsData"
                :key="member.member_id"
                class="flex items-center gap-3 p-3 rounded-2xl bg-surface-100 ring-1 ring-surface-200/60"
            >
                <span class="text-lg font-semibold text-primary-500">#{{ member.rank }}</span>
                <div class="flex-1">
                    <p class="text-sm font-medium text-surface-900">
                        {{ server_store.getMemberById(member.member_id)?.nickname }}
                    </p>
                    <p class="text-xs text-surface-500">
                        {{ member.sessions_count }}
                        {{ t('views.activity.performance_section.sessions') }} ·
                        {{ formatMinutesToLabel(member.total_duration) }}
                    </p>
                </div>
                <span class="text-xl">
                    <i
                        :class="
                            member.rank === 1 ? 'pi pi-crown text-amber-500' : 'text-surface-400'
                        "
                    ></i>
                </span>
            </div>
        </div>

        <div v-if="!contributorsData.length" class="text-sm text-surface-400 text-center py-4">
            {{ t('common.fields.none') }}
        </div>
    </div>
</template>
