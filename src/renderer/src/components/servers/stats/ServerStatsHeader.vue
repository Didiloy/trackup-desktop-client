<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { EPeriod } from '@shared/contracts/enums/period.enum'

const props = defineProps<{
    serverName: string
    period: Date[] | null
    selectedPeriodType: EPeriod | null
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:period', value: Date[] | null): void
    (e: 'update:periodType', value: EPeriod | null): void
    (e: 'refresh'): void
}>()

const { t } = useI18n()

const periodTypes = [
    { label: t('common.periods.all_time'), value: EPeriod.ALL_TIME },
    { label: t('common.periods.daily'), value: EPeriod.DAILY },
    { label: t('common.periods.weekly'), value: EPeriod.WEEKLY },
    { label: t('common.periods.monthly'), value: EPeriod.MONTHLY },
    { label: t('common.periods.yearly'), value: EPeriod.YEARLY }
]

function selectPeriodType(type: EPeriod) {
    emit('update:periodType', type)
    // Optional: Clear custom date range because we want mutually exclusive behavior
    emit('update:period', null) 
}


</script>

<template>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                {{ props.serverName }}
            </h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm">
                {{ t('views.server_stats.subtitle') }}
            </p>
        </div>

        <div class="flex items-center gap-3">
            <div class="flex items-center gap-1 mr-2">
                <Button 
                    v-for="type in periodTypes"
                    :key="type.value"
                    :label="type.label" 
                    size="small" 
                    :severity="props.selectedPeriodType === type.value ? 'primary' : 'secondary'" 
                    text 
                    @click="selectPeriodType(type.value)"
                />
            </div>
            <div class="w-64">
                <DateRangeFilter
                    :model-value="props.period"
                    @update:model-value="emit('update:period', $event)"
                />
            </div>
            <Button
                icon="pi pi-refresh"
                :loading="props.loading"
                rounded
                text
                severity="secondary"
                @click="emit('refresh')"
            />
        </div>
    </div>
</template>

