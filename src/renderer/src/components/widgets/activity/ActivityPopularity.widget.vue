<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityStatsStore } from '@/stores/activity-stats'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-popularity',
        title: 'Popularité',
        icon: 'pi pi-bolt',
        description: "Affiche le score de popularité de l'activité",
        category: {
            key: EWidgetCategory.Activity,
            label: 'Activity'
        },
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    } satisfies IWidgetMetadata
})

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

const value = computed(() => (statsData.value?.popularity_score ?? 0).toFixed(0))
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.activity.card.popularity')"
        :value="value"
        icon="pi pi-bolt"
        color="text-amber-500"
        bg="bg-amber-50"
        :show-identity="props.showIdentity"
        :loading="loading"
    >
        <template #corner>
            <ActivityIdentityCorner :show="props.showIdentity" />
        </template>
    </BaseOverviewStatWidget>
</template>
