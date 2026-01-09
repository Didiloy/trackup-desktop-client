<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSnapshotStatsStore } from '@/stores/snapshot-stats'
import ProgressSpinner from 'primevue/progressspinner'
import Icon from '@/components/common/icons/Icon.vue'
import Badge from 'primevue/badge'

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
    
    const types: Array<{ key: 'daily' | 'weekly' | 'monthly' | 'yearly'; icon: string; color: string; bg: string }> = [
        { key: 'daily', icon: 'mdi:calendar-today', color: 'text-blue-600', bg: 'bg-blue-100' },
        { key: 'weekly', icon: 'mdi:calendar-week', color: 'text-green-600', bg: 'bg-green-100' },
        { key: 'monthly', icon: 'mdi:calendar-month', color: 'text-purple-600', bg: 'bg-purple-100' },
        { key: 'yearly', icon: 'mdi:calendar', color: 'text-orange-600', bg: 'bg-orange-100' }
    ]

    return types.map((type) => {
        const snapshot = summary?.[type.key]
        return {
            label: t(`views.server_settings.snapshots.summary.${type.key}`),
            value: snapshot
                ? d(new Date(snapshot.created_at), 'short')
                : t('views.server_settings.snapshots.summary.no_snapshot'),
            icon: type.icon,
            color: type.color,
            bg: type.bg,
            hasData: !!snapshot
        }
    })
})
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-surface-900">
                {{ t('views.server_settings.snapshots.summary.title') }}
            </h3>
        </div>

        <!-- Loading state -->
        <div v-if="snapshotStore.isLoading" class="flex justify-center items-center py-8">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                v-for="card in summaryCards"
                :key="card.label"
                class="summary-card relative overflow-hidden rounded-xl border-2 transition-all"
                :class="card.hasData ? 'bg-surface-0 border-primary-200 hover:border-primary-400 shadow-sm hover:shadow-md cursor-pointer' : 'bg-surface-50 border-surface-200'"
            >
                <!-- Background gradient -->
                <div :class="`absolute inset-0 opacity-5 ${card.bg}`"></div>
                
                <div class="relative z-10 p-5">
                    <!-- Icon and Type -->
                    <div class="flex items-center justify-between mb-4">
                        <div :class="`flex items-center justify-center w-12 h-12 rounded-lg ${card.bg} ${card.color}`">
                            <Icon :icon="card.icon" class="text-xl" />
                        </div>
                        <Badge 
                            :value="card.label" 
                            :severity="card.hasData ? 'success' : 'secondary'"
                            class="text-xs"
                        />
                    </div>

                    <!-- Value -->
                    <div class="space-y-2">
                        <p class="text-xs font-medium text-surface-500 uppercase tracking-wide">
                            {{ card.hasData ? 'Dernier snapshot' : 'Statut' }}
                        </p>
                        <p 
                            class="text-lg font-bold"
                            :class="card.hasData ? 'text-surface-900' : 'text-surface-400'"
                        >
                            {{ card.value }}
                        </p>
                    </div>

                    <!-- Indicator -->
                    <div class="mt-4 pt-3 border-t border-surface-200">
                        <div class="flex items-center gap-2">
                            <div 
                                class="w-2 h-2 rounded-full"
                                :class="card.hasData ? 'bg-green-500 animate-pulse' : 'bg-surface-300'"
                            ></div>
                            <p class="text-xs text-surface-500">
                                {{ card.hasData ? 'Disponible' : 'Non disponible' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
