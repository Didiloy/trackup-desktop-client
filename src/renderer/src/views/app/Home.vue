<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
// import { useUserStatsCRUD } from '@/composables/users/useUserStatsCRUD' // Removed, used in store
import { useUserStatsStore } from '@/stores/user-stats'
import UserProfileHeader from '@/components/users/profile/UserProfileHeader.vue'
import UserStatCard from '@/components/users/UserStatCard.vue'
import UserRecentSessions from '@/components/users/UserRecentSessions.vue'
import { formatMinutesToLabel } from '@/utils/time.utils'

const { t } = useI18n()
const user_store = useUserStore()
const user_stats_store = useUserStatsStore()

onMounted(() => {
    void user_stats_store.fetch_all()
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div
            v-if="user_stats_store.get_error"
            class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
        >
            {{ user_stats_store.get_error }}
        </div>

        <UserProfileHeader :email="user_store.getEmail ?? undefined" />

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <UserStatCard
                :label="t('views.home.stats.total_duration')"
                :value="user_stats_store.get_stats ? formatMinutesToLabel(user_stats_store.get_stats.total_duration) : '0'"
                icon="pi pi-clock"
                color="text-blue-500"
                bg="bg-blue-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.avg_session')"
                :value="user_stats_store.get_stats ? formatMinutesToLabel(user_stats_store.get_stats.avg_session_duration) : '0'"
                icon="pi pi-chart-line"
                color="text-green-500"
                bg="bg-green-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.likes_given')"
                :value="user_stats_store.get_stats ? user_stats_store.get_stats.total_likes_given.toLocaleString() : '0'"
                icon="pi pi-heart"
                color="text-pink-500"
                bg="bg-pink-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.total_sessions')"
                :value="user_stats_store.get_stats ? user_stats_store.get_stats.total_sessions.toLocaleString() : '0'"
                icon="pi pi-calendar"
                color="text-cyan-500"
                bg="bg-cyan-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.unique_activities')"
                :value="user_stats_store.get_stats ? user_stats_store.get_stats.total_unique_activities_played.toLocaleString() : '0'"
                icon="pi pi-star"
                color="text-yellow-500"
                bg="bg-yellow-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.likes_received')"
                :value="user_stats_store.get_stats ? user_stats_store.get_stats.total_likes_received.toLocaleString() : '0'"
                icon="pi pi-heart-fill"
                color="text-red-500"
                bg="bg-red-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.most_active_server')"
                :value="user_stats_store.get_stats?.most_active_server_name ?? t('common.fields.none')"
                icon="pi pi-trophy"
                color="text-amber-500"
                bg="bg-amber-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.avg_participants')"
                :value="user_stats_store.get_stats ? user_stats_store.get_stats.average_session_participants.toFixed(1) : '0'"
                icon="pi pi-user-plus"
                color="text-emerald-500"
                bg="bg-emerald-500/10"
            />
        </div>

        <UserRecentSessions />
    </div>
</template>
