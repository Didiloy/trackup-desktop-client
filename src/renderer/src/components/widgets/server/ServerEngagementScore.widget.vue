<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-engagement-score',
        title_key: 'widgets.server.engagement_score.title',
        icon: 'pi pi-chart-line',
        description_key: 'widgets.server.engagement_score.description',
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
        :label="t('views.server_stats.engagement_score')"
        :description="t('views.server_stats.engagement_score_description')"
        :value="server_stats_store.getDetails?.server_stats.engagement_score.toFixed(1) ?? '0.0'"
        icon="pi pi-chart-line"
        color="text-red-500"
        bg="bg-red-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
