<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.engagement_score', 'Engagement Score')"
        :value="server_stats_store.getDetails?.server_stats.engagement_score.toFixed(1) ?? '0.0'"
        icon="pi pi-chart-line"
        color="text-red-500"
        bg="bg-red-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
