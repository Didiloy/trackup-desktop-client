<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-total-sessions',
        title: 'Total Sessions',
        icon: 'pi pi-calendar',
        description: 'Affiche le nombre total de sessions',
        category: EWidgetCategory.Server,
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    }
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_stats.total_sessions', 'Total Sessions')"
        :value="server_stats_store.getDetails?.server_stats.total_sessions.toLocaleString() ?? 0"
        icon="pi pi-calendar"
        color="text-blue-500"
        bg="bg-blue-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
