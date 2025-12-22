<script setup lang="ts">
import ServerStatsHeader from '@/components/servers/profile/ServerStatsHeader.vue'
import ServerTotalSessions from '@/components/widgets/server/ServerTotalSessions.vue'
import ServerActiveMembers from '@/components/widgets/server/ServerActiveMembers.vue'
import ServerTotalDuration from '@/components/widgets/server/ServerTotalDuration.vue'
import ServerTotalActivities from '@/components/widgets/server/ServerTotalActivities.vue'
import ServerEngagementScore from '@/components/widgets/server/ServerEngagementScore.vue'
import ServerAvgLikes from '@/components/widgets/server/ServerAvgLikes.vue'
import ServerAvgParticipants from '@/components/widgets/server/ServerAvgParticipants.vue'
import ServerTimelineChart from '@/components/widgets/server/ServerTimelineChart.vue'
import ServerTopMembers from '@/components/widgets/server/ServerTopMembers.vue'
import ServerTopActivities from '@/components/widgets/server/ServerTopActivities.vue'
import ServerActivitiesDistribution from '@/components/widgets/server/ServerActivitiesDistribution.vue'
import { useServerStatsStore } from '@/stores/server-stats'

const server_stats_store = useServerStatsStore()
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div
            v-if="server_stats_store.getError"
            class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
        >
            {{ server_stats_store.getError }}
        </div>

        <ServerStatsHeader />

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
