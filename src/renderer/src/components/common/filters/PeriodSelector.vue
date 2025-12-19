<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import { computed } from 'vue'

const props = defineProps<{
    period: Date[] | null
    selectedPeriodType: EPeriod | null
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:period', value: Date[] | null): void
    (e: 'update:selectedPeriodType', value: EPeriod | null): void
}>()

const { t } = useI18n()

const periodTypes = [
    { label: t('common.periods.all_time'), value: EPeriod.ALL_TIME },
    { label: t('common.periods.daily'), value: EPeriod.DAILY },
    { label: t('common.periods.weekly'), value: EPeriod.WEEKLY },
    { label: t('common.periods.monthly'), value: EPeriod.MONTHLY },
    { label: t('common.periods.yearly'), value: EPeriod.YEARLY }
]

const selectedValue = computed({
    get: () => props.selectedPeriodType,
    set: (val: EPeriod | null) => {
        emit('update:selectedPeriodType', val)
        if (val) {
            emit('update:period', null)
        }
    }
})

function handleDateRangeChange(newRange: Date[] | null) {
    emit('update:period', newRange)
    if (newRange) {
        emit('update:selectedPeriodType', null)
    }
}
</script>

<template>
    <div class="flex items-center gap-2">
        <Select
            v-model="selectedValue"
            :options="periodTypes"
            option-label="label"
            option-value="value"
            class="w-40"
            size="small"
            :placeholder="t('common.periods.select')"
        />
        
        <div class="w-64">
            <DateRangeFilter
                :model-value="props.period"
                @update:model-value="handleDateRangeChange"
            />
        </div>
    </div>
</template>
