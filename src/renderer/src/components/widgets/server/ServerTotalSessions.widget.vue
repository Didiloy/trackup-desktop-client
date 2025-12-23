<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-total-sessions',
        title: 'Total Sessions',
        icon: 'pi pi-calendar',
        description: 'Affiche le nombre total de sessions',
        category: {
            key: EWidgetCategory.Server,
            label: 'Server'
        },
        defaultSize: { w: 4, h: 4, minW: 2, minH: 4 }
    } satisfies IWidgetMetadata
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
