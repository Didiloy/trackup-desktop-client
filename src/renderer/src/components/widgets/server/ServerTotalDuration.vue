<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'
import { formatMinutesToLabel } from '@/utils/time.utils'

defineProps<{
    totalDuration: number | undefined
    loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.total_duration', 'Total Duration')"
        :value="formatMinutesToLabel(totalDuration ?? 0)"
        icon="pi pi-clock"
        color="text-purple-500"
        bg="bg-purple-500/10"
        :loading="loading"
    />
</template>
