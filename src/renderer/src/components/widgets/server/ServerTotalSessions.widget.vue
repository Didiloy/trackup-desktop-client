<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-total-sessions',
        title_key: 'widgets.server.total_sessions.title',
        icon: 'pi pi-calendar',
        description_key: 'widgets.server.total_sessions.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'widgets.categories.server'
        },
        defaultSize: { w: 2, h: 3, minW: 2, minH: 3 }
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
