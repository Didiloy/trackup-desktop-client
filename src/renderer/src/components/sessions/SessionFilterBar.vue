<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

interface Props {
    count?: number
    activityQuery?: string
    activitySuggestions?: IActivity[]
    startDate?: Date
    endDate?: Date
    minDuration?: number
    maxDuration?: number
    likedByMe?: boolean
}

interface Emits {
    (e: 'update:activityQuery', value: string): void
    (e: 'search-activity', query: string): void
    (e: 'update:startDate', value: Date | undefined): void
    (e: 'update:endDate', value: Date | undefined): void
    (e: 'update:minDuration', value: number | undefined): void
    (e: 'update:maxDuration', value: number | undefined): void
    (e: 'update:likedByMe', value: boolean | undefined): void
    (e: 'change'): void
}

const props = withDefaults(defineProps<Props>(), {
    count: 0
})
const emit = defineEmits<Emits>()
const { t } = useI18n()

const localActivityQuery = ref(props.activityQuery || '')
const localStartDate = ref(props.startDate)
const localEndDate = ref(props.endDate)
const localMinDuration = ref(props.minDuration)
const localMaxDuration = ref(props.maxDuration)
const localLikedByMe = ref(props.likedByMe)

watch(
    () => props.activityQuery,
    (v) => {
        if (v !== localActivityQuery.value) localActivityQuery.value = v || ''
    }
)

watch(
    () => props.startDate,
    (v) => {
        if (v !== localStartDate.value) localStartDate.value = v
    }
)

watch(
    () => props.endDate,
    (v) => {
        if (v !== localEndDate.value) localEndDate.value = v
    }
)

function onActivityQueryChange(value: string | IActivity): void {
    const query = typeof value === 'string' ? value : value.name
    localActivityQuery.value = query
    emit('update:activityQuery', query)
    emit('change')
}

function searchActivities(event: { query: string }): void {
    emit('search-activity', event.query)
}

function onStartDateChange(value: Date | Date[] | (Date | null)[] | null | undefined): void {
    emit('update:startDate', value instanceof Date ? value : undefined)
    emit('change')
}

function onEndDateChange(value: Date | Date[] | (Date | null)[] | null | undefined): void {
    emit('update:endDate', value instanceof Date ? value : undefined)
    emit('change')
}

function onLikedByMeChange(value: boolean): void {
    emit('update:likedByMe', value ? true : undefined)
    emit('change')
}

function onMinDurationChange(value: number | undefined): void {
    emit('update:minDuration', value)
    emit('change')
}

function onMaxDurationChange(value: number | undefined): void {
    emit('update:maxDuration', value)
    emit('change')
}

function clearFilters(): void {
    localActivityQuery.value = ''
    localStartDate.value = undefined
    localEndDate.value = undefined
    localMinDuration.value = undefined
    localMaxDuration.value = undefined
    localLikedByMe.value = false

    emit('update:activityQuery', '')
    emit('update:startDate', undefined)
    emit('update:endDate', undefined)
    emit('update:minDuration', undefined)
    emit('update:maxDuration', undefined)
    emit('update:likedByMe', undefined)
    emit('change')
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
</script>

<template>
    <div class="session-filter-bar">
        <!-- Activity Search -->
        <div class="filter-group">
            <i class="pi pi-search text-surface-800"></i>
            <AutoComplete
                :model-value="localActivityQuery"
                :suggestions="activitySuggestions"
                option-label="name"
                placeholder="Search activity..."
                size="small"
                :pt="{ root: { style: background_style } }"
                @update:model-value="onActivityQueryChange"
                @complete="searchActivities"
            />
        </div>

        <!-- Date Range Filters -->
        <div class="filter-group">
            <i class="pi pi-calendar text-surface-800"></i>
            <DatePicker
                :model-value="localStartDate"
                placeholder="Start Date"
                date-format="yy-mm-dd"
                show-icon
                size="small"
                :pt="{ root: { style: background_style } }"
                @update:model-value="onStartDateChange"
            />
            <span class="separator">→</span>
            <DatePicker
                :model-value="localEndDate"
                placeholder="End Date"
                date-format="yy-mm-dd"
                show-icon
                size="small"
                :pt="{ root: { style: background_style } }"
                @update:model-value="onEndDateChange"
            />
        </div>

        <!-- Duration Filters -->
        <div class="filter-group">
            <i class="pi pi-clock text-surface-800"></i>
            <InputNumber
                :model-value="localMinDuration"
                placeholder="Min (minutes)"
                :use-grouping="false"
                size="small"
                :pt="{ root: { style: background_style } }"
                @update:model-value="onMinDurationChange"
            />
            <span class="separator">-</span>
            <InputNumber
                :model-value="localMaxDuration"
                placeholder="Max (minutes)"
                :use-grouping="false"
                size="small"
                :pt="{ root: { style: background_style } }"
                @update:model-value="onMaxDurationChange"
            />
        </div>

        <!-- Liked Filter -->
        <div class="filter-group">
            <i class="pi pi-heart text-surface-800"></i>
            <Checkbox
                :model-value="localLikedByMe"
                :binary="true"
                input-id="liked-filter"
                @update:model-value="onLikedByMeChange"
            />
            <label for="liked-filter" class="filter-label">Liked by me</label>
        </div>

        <!-- Clear Filters -->
        <Button
            icon="pi pi-filter-slash"
            label="Clear Filters"
            severity="secondary"
            outlined
            size="small"
            @click="clearFilters"
        />

        <!-- Session Count -->
        <div class="session-count">
            <i class="pi pi-list mr-2"></i>
            <span>{{ props.count }} {{ t('common.items') ?? 'sessions' }}</span>
        </div>
    </div>
</template>

<style scoped>
.session-filter-bar {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgb(var(--p-surface-100));
    border: 1px solid rgb(var(--p-surface-200));
    border-radius: 12px;
    margin-bottom: 1rem;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
}

.filter-group i {
    font-size: 1.125rem;
}

.separator {
    color: rgb(var(--p-surface-400));
    font-weight: 600;
    padding: 0 0.25rem;
}

.filter-label {
    font-size: 0.875rem;
    color: rgb(var(--p-surface-700));
    font-weight: 500;
    cursor: pointer;
    user-select: none;
}

.session-count {
    display: flex;
    align-items: center;
    margin-left: auto;
    font-size: 0.875rem;
    color: rgb(var(--p-surface-700));
    font-weight: 600;
    background: rgb(var(--p-surface-200));
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: 1px solid rgb(var(--p-surface-100));
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}
</style>
