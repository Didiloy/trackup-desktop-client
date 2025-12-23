<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStatsStore } from '@/stores/server-stats'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-total-duration',
        title: 'Durée Totale',
        icon: 'pi pi-clock',
        description: 'Affiche la durée totale des sessions',
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
