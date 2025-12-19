<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.total_sessions', 'Total Sessions')"
        :value="server_stats_store.getDetails?.server_stats.total_sessions.toLocaleString() ?? 0"
        icon="pi pi-calendar"
        color="text-blue-500"
        bg="bg-blue-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
