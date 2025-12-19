<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'

defineProps<{
    engagementScore: number | undefined
    loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.engagement_score', 'Engagement Score')"
        :value="engagementScore?.toFixed(1) ?? '0.0'"
        icon="pi pi-chart-line"
        color="text-red-500"
        bg="bg-red-500/10"
        :loading="loading"
    />
</template>
