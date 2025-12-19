<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'

defineProps<{
    totalSessions: number | undefined
    loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.total_sessions', 'Total Sessions')"
        :value="totalSessions?.toLocaleString() ?? 0"
        icon="pi pi-calendar"
        color="text-blue-500"
        bg="bg-blue-500/10"
        :loading="loading"
    />
</template>
