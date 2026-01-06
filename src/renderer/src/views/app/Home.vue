<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useUserStatsCRUD } from '@/composables/users/useUserStatsCRUD'
import UserProfileHeader from '@/components/users/profile/UserProfileHeader.vue'
import UserStatCard from '@/components/users/UserStatCard.vue'
import UserRecentSessions from '@/components/users/UserRecentSessions.vue'
import type { IUserStats, ILastSession } from '@shared/contracts/interfaces/entities-stats/user-stats.interfaces'
import { formatMinutesToLabel } from '@/utils/time.utils'

const { t } = useI18n()
const user_store = useUserStore()
const { getStats, getLastSessions } = useUserStatsCRUD()

const stats = ref<IUserStats | null>(null)
const sessions = ref<ILastSession[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadUserData(): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
        const [statsRes, sessionsRes] = await Promise.all([
            getStats(),
            getLastSessions(5)
        ])

        if (statsRes.error) {
            error.value = statsRes.error
            return
        }
        if (sessionsRes.error) {
            error.value = sessionsRes.error
            return
        }

        stats.value = statsRes.data ?? null
        sessions.value = sessionsRes.data ?? []
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.fetch')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    void loadUserData()
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div
            v-if="error"
            class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
        >
            {{ error }}
        </div>

        <UserProfileHeader :email="user_store.getEmail ?? undefined" :stats="stats" :loading="loading" />

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <UserStatCard
                :label="t('views.home.stats.total_duration')"
                :value="stats ? formatMinutesToLabel(stats.total_duration) : '0'"
                icon="pi pi-clock"
                color="text-blue-500"
                bg="bg-blue-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.avg_session')"
                :value="stats ? formatMinutesToLabel(stats.avg_session_duration) : '0'"
                icon="pi pi-chart-line"
                color="text-green-500"
                bg="bg-green-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.likes_given')"
                :value="stats ? stats.total_likes_given.toLocaleString() : '0'"
                icon="pi pi-heart"
                color="text-pink-500"
                bg="bg-pink-500/10"
            />
            <UserStatCard
                :label="t('views.home.stats.servers_created')"
                :value="stats ? stats.total_servers_created.toLocaleString() : '0'"
                icon="pi pi-users"
                color="text-purple-500"
                bg="bg-purple-500/10"
            />
        </div>

        <UserRecentSessions :sessions="sessions" :loading="loading" />
    </div>
</template>
