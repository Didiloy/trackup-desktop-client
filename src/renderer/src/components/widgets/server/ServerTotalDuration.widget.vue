<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStatsStore } from '@/stores/server-stats'
import { EWidgetCategory } from '@shared/contracts/interfaces/widget.interfaces'

defineOptions({
    widgetMetadata: {
        id: 'server-total-duration',
        title: 'Durée Totale',
        icon: 'pi pi-clock',
        description: 'Affiche la durée totale des sessions',
        category: EWidgetCategory.Server,
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    }
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
