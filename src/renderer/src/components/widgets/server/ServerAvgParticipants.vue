<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'

defineProps<{
    avgParticipants: number | undefined
    loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.avg_participants_per_session', 'Avg Participants')"
        :value="avgParticipants?.toFixed(2) ?? '0.00'"
        icon="pi pi-user-plus"
        color="text-cyan-500"
        bg="bg-cyan-500/10"
        :loading="loading"
    />
</template>
