<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-avg-participants',
        title: 'Participants Moyens',
        icon: 'pi pi-user-plus',
        description: 'Affiche le nombre moyen de participants par session',
        category: EWidgetCategory.Server,
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    }
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_stats.avg_participants_per_session', 'Avg Participants')"
        :value="
            server_stats_store.getDetails?.server_stats.avg_participants_per_session.toFixed(2) ??
            '0.00'
        "
        icon="pi pi-user-plus"
        color="text-cyan-500"
        bg="bg-cyan-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
