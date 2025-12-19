<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'

defineProps<{
    avgLikes: number | undefined
    loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.avg_likes_per_session', 'Avg Likes/Session')"
        :value="avgLikes?.toFixed(2) ?? '0.00'"
        icon="pi pi-thumbs-up"
        color="text-pink-500"
        bg="bg-pink-500/10"
        :loading="loading"
    />
</template>
