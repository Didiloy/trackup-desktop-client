<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-total-activities',
        title: 'Total Activités',
        icon: 'pi pi-bolt',
        description: "Affiche le nombre total d'activités",
        category: {
            key: EWidgetCategory.Server,
            label: 'Server'
        },
        defaultSize: { w: 2, h: 3, minW: 2, minH: 3 }
    } satisfies IWidgetMetadata
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
