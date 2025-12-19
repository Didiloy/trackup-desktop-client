<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import { useServerStore } from '@/stores/server'
import { useServerStatsStore } from '@/stores/server-stats'

const { t } = useI18n()
const server_store = useServerStore()
const server_stats_store = useServerStatsStore()

const periodTypes = [
    { label: t('common.periods.all_time'), value: EPeriod.ALL_TIME },
    { label: t('common.periods.daily'), value: EPeriod.DAILY },
    { label: t('common.periods.weekly'), value: EPeriod.WEEKLY },
    { label: t('common.periods.monthly'), value: EPeriod.MONTHLY },
    { label: t('common.periods.yearly'), value: EPeriod.YEARLY }
]

function selectPeriodType(type: EPeriod) {
    server_stats_store.setSelectedPeriodType(type)
    server_stats_store.setPeriod(null)
}

function handleRefresh() {
    if (server_store.getPublicId) {
        server_stats_store.fetchAll(server_store.getPublicId)
    }
}
</script>

<template>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            <h1 class="text-2xl font-bold text-surface-900">
                {{ server_store.getName }}
            </h1>
            <p class="text-surface-500 text-sm">
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
                    :severity="server_stats_store.getSelectedPeriodType === type.value ? 'primary' : 'secondary'"
                    text
                    @click="selectPeriodType(type.value)"
                />
            </div>
            <div class="w-64">
                <DateRangeFilter
                    :model-value="server_stats_store.getPeriod"
                    @update:model-value="server_stats_store.setPeriod($event)"
                />
            </div>
            <Button
                icon="pi pi-refresh"
                :loading="server_stats_store.isLoading"
                rounded
                text
                severity="secondary"
                @click="handleRefresh"
            />
        </div>
    </div>
</template>
