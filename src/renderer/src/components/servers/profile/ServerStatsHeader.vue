<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useServerStatsStore } from '@/stores/server-stats'

const { t } = useI18n()
const server_store = useServerStore()
const server_stats_store = useServerStatsStore()

function handleRefresh() {
    if (server_store.getPublicId) {
        server_stats_store.fetchAll(server_store.getPublicId)
    }
}
</script>

<template>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            <h1 class="text-2xl font-bold text-surface-900">
                {{ server_store.getName }}
            </h1>
            <p class="text-surface-500 text-sm">
                {{ t('views.server_stats.subtitle') }}
            </p>
        </div>

        <div class="flex items-center gap-3">
            <Button
                icon="pi pi-refresh"
                :loading="server_stats_store.isLoading"
                rounded
                text
                severity="secondary"
                @click="handleRefresh"
            />
        </div>
    </div>
</template>
