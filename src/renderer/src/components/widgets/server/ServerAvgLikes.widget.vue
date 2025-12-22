<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'

defineOptions({
    widgetMetadata: {
        id: 'server-avg-likes',
        title: 'Likes Moyens',
        icon: 'pi pi-thumbs-up',
        description: 'Affiche le nombre moyen de likes par session',
        category: 'server',
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    }
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_stats.avg_likes_per_session', 'Avg Likes/Session')"
        :value="
            server_stats_store.getDetails?.server_stats.avg_likes_per_session.toFixed(2) ?? '0.00'
        "
        icon="pi pi-thumbs-up"
        color="text-pink-500"
        bg="bg-pink-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
