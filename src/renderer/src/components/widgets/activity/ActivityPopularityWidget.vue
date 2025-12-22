<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityStatsStore } from '@/stores/activity-stats'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'

const { t } = useI18n()
const activity_stats_store = useActivityStatsStore()

const statsData = computed(() => activity_stats_store.getDetails)
const loading = computed(() => activity_stats_store.isLoading)

const value = computed(() => (statsData.value?.popularity_score ?? 0).toFixed(0))
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.activity.card.popularity')"
        :value="value"
        icon="pi pi-bolt"
        color="text-amber-500"
        bg="bg-amber-50"
        :loading="loading"
    />
</template>
