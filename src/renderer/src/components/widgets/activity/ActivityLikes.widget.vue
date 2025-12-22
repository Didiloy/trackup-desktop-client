<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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

const value = computed(() => statsData.value?.total_likes.toLocaleString() ?? '0')
const subValue = computed(() => {
    if (!statsData.value) return ''
    return t('views.activity.card.avg_likes', {
        value: statsData.value.avg_likes_per_session.toFixed(1)
    })
})
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.activity.card.likes')"
        :value="value"
        :sub-value="subValue"
        icon="pi pi-heart-fill"
        color="text-red-500"
        bg="bg-red-50"
        :show-identity="props.showIdentity"
        :loading="loading"
    >
        <template #corner>
            <ActivityIdentityCorner :show="props.showIdentity" />
        </template>
    </BaseOverviewStatWidget>
</template>
