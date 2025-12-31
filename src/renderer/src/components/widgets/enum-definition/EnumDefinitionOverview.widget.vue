<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEnumDefinitionStatsStore } from '@/stores/enum-definition-stats'

const { t } = useI18n()
const store = useEnumDefinitionStatsStore()

function formatDuration(minutes: number): string {
    if (!minutes) return '0h'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}min`
}

const stats = computed(() => [
    {
        label: t('views.server_definitions.profile.overview.total_usage'),
        value: store.totalUsage,
        icon: 'pi-check-square',
        color: 'bg-blue-100 text-blue-600'
    },
    {
        label: t('views.server_definitions.profile.overview.total_sessions'),
        value: store.totalSessions,
        icon: 'pi-calendar',
        color: 'bg-green-100 text-green-600'
    },
    {
        label: t('views.server_definitions.profile.overview.total_duration'),
        value: formatDuration(store.totalDuration),
        icon: 'pi-clock',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        label: t('views.server_definitions.profile.overview.unique_users'),
        value: store.uniqueUsers,
        icon: 'pi-users',
        color: 'bg-orange-100 text-orange-600'
    }
])
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-surface-0 rounded-2xl p-5 shadow-sm ring-1 ring-surface-200/60"
        >
            <!-- Loading state -->
            <div v-if="store.isLoading" class="space-y-3">
                <Skeleton width="40px" height="40px" class="rounded-xl" />
                <Skeleton width="60%" height="2rem" />
                <Skeleton width="80%" height="1rem" />
            </div>

            <!-- Data state -->
            <div v-else class="flex flex-col gap-3">
                <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                    :class="stat.color"
                >
                    <i class="pi text-lg" :class="stat.icon"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold text-surface-900">{{ stat.value }}</p>
                    <p class="text-sm text-surface-500">{{ stat.label }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
