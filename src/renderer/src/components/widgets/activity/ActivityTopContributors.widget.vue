<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStore } from '@/stores/server'
import { useActivityStatsStore } from '@/stores/activity-stats'
import { computed } from 'vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-top-contributors',
        title: 'Top Contributeurs',
        icon: 'pi pi-star',
        description: "Affiche les meilleurs contributeurs de l'activité",
        category: {
            key: EWidgetCategory.Activity,
            label: 'Activity'
        },
        defaultSize: { w: 6, h: 4, minW: 4, minH: 3 }
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
    }>(),
    {
        showIdentity: true
    }
)

const { t } = useI18n()
const server_store = useServerStore()
const activity_stats_store = useActivityStatsStore()

const contributorsData = computed(() => activity_stats_store.getDetails?.top_contributors || [])
</script>

<template>
    <div class="relative rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <ActivityIdentityCorner :show="props.showIdentity" />
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
