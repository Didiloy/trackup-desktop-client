<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-engagement-score',
        title: "Score d'Engagement",
        icon: 'pi pi-chart-line',
        description: "Affiche le score d'engagement du serveur",
        category: {
            key: EWidgetCategory.Server,
            label: 'Server'
        },
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    } satisfies IWidgetMetadata
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_stats.engagement_score', 'Engagement Score')"
        :value="server_stats_store.getDetails?.server_stats.engagement_score.toFixed(1) ?? '0.0'"
        icon="pi pi-chart-line"
        color="text-red-500"
        bg="bg-red-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
