<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-active-activities',
        title_key: 'widgets.server.active_activities.title',
        icon: 'pi pi-bolt',
        description_key: 'widgets.server.active_activities.description',
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
        :label="t('views.server_stats.active_activities')"
        :value="server_stats_store.getDetails?.server_stats.active_activities.toLocaleString() ?? 0"
        :subValue="`/ ${server_stats_store.getDetails?.server_stats.total_activities ?? 0} ${t('common.fields.total', 'Total')}`"
        icon="pi pi-bolt"
        color="text-purple-500"
        bg="bg-purple-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
