<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStatsStore } from '@/stores/server-stats'

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.total_duration', 'Total Duration')"
        :value="
            formatMinutesToLabel(server_stats_store.getDetails?.server_stats.total_duration ?? 0)
        "
        icon="pi pi-clock"
        color="text-purple-500"
        bg="bg-purple-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
