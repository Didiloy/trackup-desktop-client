<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-avg-likes',
        title_key: 'widgets.server.avg_likes.title',
        icon: 'pi pi-thumbs-up',
        description_key: 'widgets.server.avg_likes.description',
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
        :label="t('views.server_stats.avg_likes_per_session')"
        :value="
            server_stats_store.getDetails?.server_stats.avg_likes_per_session.toFixed(2) ?? '0.00'
        "
        icon="pi pi-thumbs-up"
        color="text-pink-500"
        bg="bg-pink-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
