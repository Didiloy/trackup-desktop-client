<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_stats.total_activities', 'Activities')"
        :value="server_stats_store.getDetails?.server_stats.total_activities.toLocaleString() ?? 0"
        icon="pi pi-bolt"
        color="text-amber-500"
        bg="bg-amber-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
