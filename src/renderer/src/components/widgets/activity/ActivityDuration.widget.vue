<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useActivityStatsStore } from '@/stores/activity-stats'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
    }>(),
    {
        showIdentity: true
    }
)
const { t } = useI18n()
const activity_stats_store = useActivityStatsStore()

const statsData = computed(() => activity_stats_store.getDetails)
const loading = computed(() => activity_stats_store.isLoading)

const value = computed(() =>
    statsData.value ? formatMinutesToLabel(statsData.value.avg_duration) : ''
)
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.activity.card.avg_duration', { value })"
        :value="value"
        icon="pi pi-clock"
        color="text-primary-500"
        bg="bg-primary-50"
        :loading="loading"
    >
        <template #corner>
            <ActivityIdentityCorner :show="props.showIdentity" />
        </template>
    </BaseOverviewStatWidget>
</template>
