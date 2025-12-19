<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'

defineProps<{
    totalActivities: number | undefined
    loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.total_activities', 'Activities')"
        :value="totalActivities?.toLocaleString() ?? 0"
        icon="pi pi-bolt"
        color="text-amber-500"
        bg="bg-amber-500/10"
        :loading="loading"
    />
</template>
