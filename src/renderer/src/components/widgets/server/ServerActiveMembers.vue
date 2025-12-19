<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.active_members', 'Active Members')"
        :value="server_stats_store.getDetails?.server_stats.active_members.toLocaleString() ?? 0"
        :subValue="`/ ${server_stats_store.getDetails?.server_stats.total_members ?? 0} ${t('common.fields.total', 'Total')}`"
        icon="pi pi-users"
        color="text-green-500"
        bg="bg-green-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
