<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSnapshotStatsStore } from '@/stores/snapshot-stats'
import UserStatCard from '@/components/users/UserStatCard.vue'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps<{
    serverId: string
}>()

const { t, d } = useI18n()
const snapshotStore = useSnapshotStatsStore()

onMounted(async () => {
    await snapshotStore.fetchSummary(props.serverId)
})

const summaryCards = computed(() => {
    const summary = snapshotStore.getSummary
    if (!summary) return []

    const types: Array<{ key: keyof typeof summary; icon: string; color: string; bg: string }> = [
        { key: 'daily', icon: 'mdi:calendar-today', color: 'text-blue-600', bg: 'bg-blue-100' },
        { key: 'weekly', icon: 'mdi:calendar-week', color: 'text-green-600', bg: 'bg-green-100' },
        { key: 'monthly', icon: 'mdi:calendar-month', color: 'text-purple-600', bg: 'bg-purple-100' },
        { key: 'yearly', icon: 'mdi:calendar', color: 'text-orange-600', bg: 'bg-orange-100' }
    ]

    return types.map((type) => {
        const snapshot = summary[type.key]
        return {
            label: t(`views.server_settings.snapshots.summary.${type.key}`),
            value: snapshot
                ? d(new Date(snapshot.created_at), 'short')
                : t('views.server_settings.snapshots.summary.no_snapshot'),
            icon: type.icon,
            color: type.color,
            bg: type.bg
        }
    })
})
</script>

<template>
    <div class="flex flex-col gap-4">
        <h3 class="text-lg font-semibold text-surface-900">
            {{ t('views.server_settings.snapshots.summary.title') }}
        </h3>

        <!-- Loading state -->
        <div v-if="snapshotStore.isLoading" class="flex justify-center items-center py-8">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <!-- Summary cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <UserStatCard
                v-for="card in summaryCards"
                :key="card.label"
                :label="card.label"
                :value="card.value"
                :icon="card.icon"
                :color="card.color"
                :bg="card.bg"
            />
        </div>
    </div>
</template>
