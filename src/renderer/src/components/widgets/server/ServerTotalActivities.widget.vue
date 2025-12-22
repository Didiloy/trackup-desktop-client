<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'

defineOptions({
    widgetMetadata: {
        id: 'server-total-activities',
        title: 'Total Activités',
        icon: 'pi pi-bolt',
        description: 'Affiche le nombre total d\'activités',
        category: 'server',
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    }
})

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
