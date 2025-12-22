<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityStatsStore } from '@/stores/activity-stats'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
    }>(),
    {
        showIdentity: true
    }
)

const { t } = useI18n()
const activity_stats_store = useActivityStatsStore()

const stats = computed(() => activity_stats_store.getDetails)

function formatCount(val: any): string {
    if (Array.isArray(val)) {
        return val.length.toLocaleString()
    }
    return Number(val).toLocaleString()
}

const items = computed(() => {
    if (!stats.value) return []
    return [
        {
            label: t('views.activity.performance_section.unique_participants'),
            value: stats.value.unique_participants.toLocaleString(),
            icon: 'pi pi-users',
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: t('views.activity.card.total_participants'),
            value: formatCount(stats.value.total_participants),
            icon: 'pi pi-user-plus',
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
        },
        {
            label: t('views.activity.card.avg_participants'),
            value: stats.value.avg_participants_per_session.toFixed(1),
            icon: 'pi pi-chart-line',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        }
    ]
})
</script>

<template>
    <div class="relative rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <ActivityIdentityCorner :show="props.showIdentity" />
        <p class="text-sm font-semibold text-surface-600 mb-4">
            {{ t('views.activity.performance_section.participants') }}
        </p>

        <div v-if="items.length" class="space-y-4">
            <div
                v-for="item in items"
                :key="item.label"
                class="flex items-center gap-4 p-4 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 transition-all hover:bg-surface-200/50"
            >
                <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    :class="[item.bg, item.color]"
                >
                    <i :class="item.icon"></i>
                </div>
                <div class="min-w-0">
                    <p class="text-xs text-surface-500 truncate">{{ item.label }}</p>
                    <p class="text-xl font-bold text-surface-900">{{ item.value }}</p>
                </div>
            </div>
        </div>

        <div v-else class="flex items-center justify-center py-10 text-surface-400 text-sm">
            {{ t('common.fields.none') }}
        </div>
    </div>
</template>
