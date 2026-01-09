<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSnapshotStore } from '@/stores/snapshot'
import Badge from 'primevue/badge'

interface Props {
    serverId: string
}

const props = defineProps<Props>()

const { t, d } = useI18n()
const snapshotStore = useSnapshotStore()

/**
 * Configuration for snapshot type cards with PrimeVue icons
 */
const SUMMARY_TYPES = [
    { key: 'daily', icon: 'pi pi-calendar', colorClass: 'blue' },
    { key: 'weekly', icon: 'pi pi-calendar-plus', colorClass: 'green' },
    { key: 'monthly', icon: 'pi pi-calendar-clock', colorClass: 'purple' },
    { key: 'yearly', icon: 'pi pi-history', colorClass: 'orange' }
] as const

onMounted(async () => {
    await snapshotStore.fetchSummary(props.serverId)
})

const summaryCards = computed(() => {
    const summary = snapshotStore.summary

    return SUMMARY_TYPES.map((type) => {
        const snapshot = summary?.[type.key as keyof typeof summary]
        const hasData = snapshot !== undefined && snapshot !== null

        return {
            key: type.key,
            label: t(`views.server_settings.snapshots.summary.${type.key}`),
            value: hasData
                ? d(new Date(snapshot.created_at), 'short')
                : t('views.server_settings.snapshots.summary.no_snapshot'),
            icon: type.icon,
            colorClass: type.colorClass,
            hasData
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
        <div v-if="snapshotStore.isSummaryLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                v-for="n in 4"
                :key="n"
                class="animate-pulse rounded-xl bg-surface-100 border border-surface-200 p-5"
            >
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-lg bg-surface-200"></div>
                    <div class="w-16 h-5 bg-surface-200 rounded"></div>
                </div>
                <div class="space-y-2">
                    <div class="w-20 h-3 bg-surface-200 rounded"></div>
                    <div class="w-24 h-5 bg-surface-300 rounded"></div>
                </div>
            </div>
        </div>

        <!-- Summary cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                v-for="card in summaryCards"
                :key="card.key"
                class="summary-card relative overflow-hidden rounded-xl border transition-all"
                :class="
                    card.hasData
                        ? 'bg-surface-0 border-primary-200 hover:border-primary-400 shadow-sm hover:shadow-md cursor-pointer'
                        : 'bg-surface-50 border-surface-200'
                "
            >
                <!-- Background gradient -->
                <div
                    class="absolute inset-0 opacity-5"
                    :class="{
                        'bg-blue-500': card.colorClass === 'blue',
                        'bg-green-500': card.colorClass === 'green',
                        'bg-purple-500': card.colorClass === 'purple',
                        'bg-orange-500': card.colorClass === 'orange'
                    }"
                ></div>

                <div class="relative z-10 p-5">
                    <!-- Icon and Type -->
                    <div class="flex items-center justify-between mb-4">
                        <div
                            class="flex items-center justify-center w-12 h-12 rounded-lg"
                            :class="{
                                'bg-blue-100 text-blue-600': card.colorClass === 'blue',
                                'bg-green-100 text-green-600': card.colorClass === 'green',
                                'bg-purple-100 text-purple-600': card.colorClass === 'purple',
                                'bg-orange-100 text-orange-600': card.colorClass === 'orange'
                            }"
                        >
                            <i :class="card.icon" class="text-xl"></i>
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
                            {{
                                card.hasData
                                    ? t('views.server_settings.snapshots.summary.last_snapshot')
                                    : t('views.server_settings.snapshots.summary.status')
                            }}
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
                                {{
                                    card.hasData
                                        ? t('views.server_settings.snapshots.summary.available')
                                        : t('views.server_settings.snapshots.summary.not_available')
                                }}
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
    0%,
    100% {
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
