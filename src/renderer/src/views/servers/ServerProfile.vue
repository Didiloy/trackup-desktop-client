<script setup lang="ts">
import ServerAvgLikesWidget from '@/components/widgets/server/ServerAvgLikes.widget.vue'
import ServerTopActivitiesWidget from '@/components/widgets/server/ServerTopActivities.widget.vue'
import ServerTimelineChartWidget from '@/components/widgets/server/ServerTimelineChart.widget.vue'
import ServerAvgParticipantsWidget from '@/components/widgets/server/ServerAvgParticipants.widget.vue'
import ServerTotalDurationWidget from '@/components/widgets/server/ServerTotalDuration.widget.vue'
import ServerEngagementScoreWidget from '@/components/widgets/server/ServerEngagementScore.widget.vue'
import ServerTotalActivitiesWidget from '@/components/widgets/server/ServerTotalActivities.widget.vue'
import ServerHeader from '@/components/servers/profile/ServerHeader.vue'
import ServerActiveMembersWidget from '@/components/widgets/server/ServerActiveMembers.widget.vue'
import ServerTopMembersWidget from '@/components/widgets/server/ServerTopMembers.widget.vue'
import ServerGrowthTrendsWidget from '@/components/widgets/server/ServerGrowthTrends.widget.vue'
import ServerActivitiesDistributionWidget from '@/components/widgets/server/ServerActivitiesDistribution.widget.vue'
import ServerTotalSessionsWidget from '@/components/widgets/server/ServerTotalSessions.widget.vue'
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

        <ServerHeader />

        <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <ServerTotalSessionsWidget />
            <ServerActiveMembersWidget />
            <ServerTotalDurationWidget />
            <ServerTotalActivitiesWidget />
            <ServerEngagementScoreWidget />
            <ServerAvgLikesWidget />
            <ServerAvgParticipantsWidget />
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div class="xl:col-span-2">
                <ServerTimelineChartWidget :height="340" />
            </div>
            <div>
                <ServerActivitiesDistributionWidget />
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ServerTopMembersWidget />
            <ServerTopActivitiesWidget />
            <ServerGrowthTrendsWidget />
        </div>
    </div>
</template>
