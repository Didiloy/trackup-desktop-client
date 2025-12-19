<script setup lang="ts">
const server_store = useServerStore()
const server_stats_store = useServerStatsStore()

async function fetchTimelineForPeriod(periodType: EPeriod) {
    if (!server_store.getPublicId) return
    const res = await server_stats_store.fetchTimeline(server_store.getPublicId, {
        period: periodType,
        limit: 365
    })
}

watch(() => server_stats_store.getSelectedPeriodType, async (newType) => {
    if (newType) {
        await fetchTimelineForPeriod(newType)
    } else {
        if (server_store.getPublicId) {
            await server_stats_store.fetchDetails(server_store.getPublicId)
        }
    }
})

// Initial load if store is empty but server is selected
onMounted(async () => {
    if (server_store.getPublicId && !server_stats_store.getDetails) {
        await server_stats_store.fetchAll(server_store.getPublicId)
    }
})

// Refresh handler
function handleRefresh() {
    if (server_store.getPublicId) {
        server_stats_store.fetchAll(server_store.getPublicId)
    }
}

function handlePeriodTypeUpdate(newType: EPeriod | null) {
    server_stats_store.setSelectedPeriodType(newType)
}

function handlePeriodUpdate(newPeriod: Date[] | null) {
    server_stats_store.setPeriod(newPeriod)
}
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div v-if="server_stats_store.getError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {{ server_stats_store.getError }}
        </div>

        <ServerStatsHeader
            v-model:period="period"
            v-model:selected-period-type="selectedPeriodType"
            :server-name="server_store.getName ?? ''"
            :loading="server_stats_store.isLoading"
            @refresh="handleRefresh"
            @update:period-type="handlePeriodTypeUpdate"
            @update:period="handlePeriodUpdate"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
            <ServerTotalSessions />
            <ServerActiveMembers />
            <ServerTotalDuration />
            <ServerTotalActivities />
            <ServerEngagementScore />
            <ServerAvgLikes />
            <ServerAvgParticipants />
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div class="xl:col-span-2">
                <ServerTimelineChart :height="340" />
            </div>
            <div>
                <ServerActivitiesDistribution />
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ServerTopMembers />
            <ServerTopActivities />
        </div>
    </div>
</template>
