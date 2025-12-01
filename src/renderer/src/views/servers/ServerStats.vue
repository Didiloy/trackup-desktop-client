<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useServerStore } from '@/stores/server'
import { useServerStatsCRUD } from '@/composables/servers/useServerStatsCRUD'
import type {
    IServerStatsDetails,
    IStatsTimeline
} from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import ServerStatsHeader from '@/components/servers/stats/ServerStatsHeader.vue'
import ServerStatsOverview from '@/components/servers/stats/ServerStatsOverview.vue'
import ServerTimelineChart from '@/components/servers/stats/ServerTimelineChart.vue'
import ServerTopMembers from '@/components/servers/stats/ServerTopMembers.vue'
import ServerTopActivities from '@/components/servers/stats/ServerTopActivities.vue'
import ServerActivitiesDistribution from '@/components/servers/stats/ServerActivitiesDistribution.vue'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

const server_store = useServerStore()
const { getServerStatsDetails, getServerStatsTimeline } = useServerStatsCRUD()
const toast = useToast()
const { t } = useI18n()

const loading = ref(true)
const details = ref<IServerStatsDetails | null>(null)
const error = ref<string | null>(null)
const selectedPeriodType = ref<EPeriod | null>(null)

// Default to last 30 days
const period = ref<Date[] | null>([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date()
])

const filteredTimeline = computed<IStatsTimeline[]>(() => {
    if (!details.value?.timeline) return []

    // If a period type is selected (API filtered), return the whole timeline
    if (selectedPeriodType.value) return details.value.timeline

    if (!period.value || period.value.length !== 2 || !period.value[0] || !period.value[1]) {
        return details.value.timeline
    }

    const [start, end] = period.value
    // Reset hours to compare dates only
    const startDate = new Date(start)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(end)
    endDate.setHours(23, 59, 59, 999)

    return details.value.timeline.filter((item) => {
        const itemDate = new Date(item.period)
        return itemDate >= startDate && itemDate <= endDate
    })
})

async function loadStats() {
    if (!server_store.getPublicId) return
    loading.value = true
    error.value = null

    try {
        const res = await getServerStatsDetails(server_store.getPublicId)
        if (res.error) throw new Error(res.error)
        if (res.data) {
            details.value = res.data
        }

        if (selectedPeriodType.value) {
            await fetchTimelineForPeriod(selectedPeriodType.value)
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.fetch')
        toast.add({
            severity: 'error',
            summary: t('messages.error.fetch'),
            detail: error.value,
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

async function fetchTimelineForPeriod(periodType: EPeriod) {
    if (!server_store.getPublicId || !details.value) return
    loading.value = true
    try {
        const res = await getServerStatsTimeline(server_store.getPublicId, { period: periodType })
        if (res.error) throw new Error(res.error)
        if (res.data) {
            details.value.timeline = res.data
        }
    } catch (e) {
        console.error(e)
        toast.add({ severity: 'error', summary: t('messages.error.fetch'), life: 3000 })
    } finally {
        loading.value = false
    }
}

watch(selectedPeriodType, async (newType) => {
    if (newType) {
        await fetchTimelineForPeriod(newType)
    } else {
        // Reload full stats to reset timeline or if we want to switch back to default view
        // Or we could just keep current data if it was already fetched.
        // For now let's reload basic stats to be safe and consistent
        await loadStats()
    }
})

watch(period, async (newPeriod) => {
    if (newPeriod) {
        selectedPeriodType.value = null
    }
})

watch(
    () => server_store.getPublicId,
    (newId) => {
        if (newId) {
            loadStats()
        }
    },
    { immediate: true }
)

// Refresh handler
function handleRefresh() {
    loadStats()
}

function handlePeriodTypeUpdate(newType: EPeriod | null) {
    selectedPeriodType.value = newType
}

function handlePeriodUpdate(newPeriod: Date[] | null) {
    period.value = newPeriod
}
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {{ error }}
        </div>

        <ServerStatsHeader
            :server-name="server_store.getName ?? ''"
            v-model:period="period"
            v-model:selected-period-type="selectedPeriodType"
            :loading="loading"
            @refresh="handleRefresh"
            @update:period-type="handlePeriodTypeUpdate"
            @update:period="handlePeriodUpdate"
        />

        <ServerStatsOverview :stats="details?.server_stats" :loading="loading" />

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div class="xl:col-span-2">
                <ServerTimelineChart :data="filteredTimeline" :loading="loading" :height="340" />
            </div>
            <div>
                <ServerActivitiesDistribution
                    :activities="details?.top_activities"
                    :loading="loading"
                />
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ServerTopMembers :members="details?.top_members" :loading="loading" />
            <ServerTopActivities :activities="details?.top_activities" :loading="loading" />
        </div>
    </div>
</template>
