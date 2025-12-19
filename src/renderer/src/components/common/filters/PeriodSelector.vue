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

// Visual period types including frontend-only 'custom'
const VISUAL_CUSTOM = 'custom'

const periodTypes = [
    { label: t('common.periods.all_time'), value: EPeriod.ALL_TIME },
    { label: t('common.periods.daily'), value: EPeriod.DAILY },
    { label: t('common.periods.weekly'), value: EPeriod.WEEKLY },
    { label: t('common.periods.monthly'), value: EPeriod.MONTHLY },
    { label: t('common.periods.yearly'), value: EPeriod.YEARLY },
    { label: t('common.periods.custom'), value: VISUAL_CUSTOM }
]

const selectedValue = computed({
    get: () => {
        if (props.period) return VISUAL_CUSTOM
        return props.selectedPeriodType
    },
    set: (val: any) => {
        if (val === VISUAL_CUSTOM) {
            // Selecting custom doesn't change the base period until a date is picked
            // but we can set it to ALL_TIME as a base for filtering if needed
            emit('update:selectedPeriodType', EPeriod.ALL_TIME)
            // We keep the period null until they pick one, or we can set a default
        } else {
            emit('update:selectedPeriodType', val as EPeriod)
            emit('update:period', null)
        }
    }
})

function handleDateRangeChange(newRange: Date[] | null) {
    emit('update:period', newRange)
    // When a range is picked, we are in VISUAL_CUSTOM mode
}
</script>

<template>
    <div class="flex items-center gap-2">
        <Select
            v-model="selectedValue"
            :options="periodTypes"
            option-label="label"
            option-value="value"
            class="w-44"
            size="small"
            :placeholder="t('common.periods.select')"
        />
        
        <div v-if="selectedValue === VISUAL_CUSTOM" class="w-64 animate-in fade-in slide-in-from-left-2 duration-300">
            <DateRangeFilter
                :model-value="props.period"
                @update:model-value="handleDateRangeChange"
            />
        </div>
    </div>
</template>
