<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import GenericFilterBar from '@/components/filters/GenericFilterBar.vue'
import GenericPopover from '@/components/common/GenericPopover.vue'
import FilterGroup from '@/components/filters/FilterGroup.vue'
import ActivityAutocomplete from '@/components/activities/ActivityAutocomplete.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import NumberRangeFilter from '@/components/filters/NumberRangeFilter.vue'
import MultiSelectFilter from '@/components/filters/MultiSelectFilter.vue'
import ToggleFilter from '@/components/filters/ToggleFilter.vue'
import { useServerStore } from '@/stores/server'

interface Props {
    count?: number
    activityQuery?: string
    participantIds?: string[]
    startDate?: Date
    endDate?: Date
    minDuration?: number
    maxDuration?: number
    likedByMe?: boolean
}

interface Emits {
    (e: 'update:activityQuery', value: string): void
    (e: 'select-activity', activity: IActivity | null): void
    (e: 'update:participantIds', value: string[]): void
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
const server_store = useServerStore()

// Local state
const localActivityQuery = ref(props.activityQuery || '')
const localParticipantIds = ref<string[]>(props.participantIds || [])
const localDateRange = ref<Date[] | null>(null)
const localMinDuration = ref(props.minDuration)
const localMaxDuration = ref(props.maxDuration)
const localLikedByMe = ref(props.likedByMe || false)

// Popover ref
const filtersPopoverRef = ref()

// Sync props to local state
watch(
    () => props.activityQuery,
    (v) => {
        if (v !== localActivityQuery.value) localActivityQuery.value = v || ''
    }
)

watch(
    () => [props.startDate, props.endDate],
    ([start, end]) => {
        if (start && end) {
            localDateRange.value = [start, end]
        } else if (start) {
            localDateRange.value = [start]
        } else {
            localDateRange.value = null
        }
    }
)

watch(
    () => props.likedByMe,
    (v) => {
        localLikedByMe.value = v || false
    }
)

watch(
    () => props.participantIds,
    (v) => {
        if (JSON.stringify(v) !== JSON.stringify(localParticipantIds.value)) {
            localParticipantIds.value = v || []
        }
    }
)

// Computed for active filters count
const activeFiltersCount = computed(() => {
    let count = 0
    if (localParticipantIds.value.length > 0) count++
    if (localDateRange.value && localDateRange.value.length > 0) count++
    if (localMinDuration.value !== undefined || localMaxDuration.value !== undefined) count++
    return count
})

function onActivityQueryChange(value: string): void {
    localActivityQuery.value = value
    emit('update:activityQuery', value)
    emit('change')
}

function onActivitySelect(activity: IActivity | null): void {
    emit('select-activity', activity)
    emit('change')
}

function onDateRangeChange(value: Date[] | null): void {
    localDateRange.value = value
    if (value && value.length === 2) {
        emit('update:startDate', value[0])
        emit('update:endDate', value[1])
    } else if (value && value.length === 1) {
        emit('update:startDate', value[0])
        emit('update:endDate', undefined)
    } else {
        emit('update:startDate', undefined)
        emit('update:endDate', undefined)
    }
    emit('change')
}

function onLikedByMeToggle(value: boolean): void {
    localLikedByMe.value = value
    emit('update:likedByMe', value ? true : undefined)
    emit('change')
}

function onMinDurationChange(value: number | undefined): void {
    localMinDuration.value = value
    emit('update:minDuration', value)
    emit('change')
}

function onMaxDurationChange(value: number | undefined): void {
    localMaxDuration.value = value
    emit('update:maxDuration', value)
    emit('change')
}

function onParticipantIdsChange(value: string[]): void {
    localParticipantIds.value = value
    emit('update:participantIds', value)
    emit('change')
}

function clearFilters(): void {
    localActivityQuery.value = ''
    localParticipantIds.value = []
    localDateRange.value = null
    localMinDuration.value = undefined
    localMaxDuration.value = undefined
    localLikedByMe.value = false

    emit('update:activityQuery', '')
    emit('select-activity', null)
    emit('update:participantIds', [])
    emit('update:startDate', undefined)
    emit('update:endDate', undefined)
    emit('update:minDuration', undefined)
    emit('update:maxDuration', undefined)
    emit('update:likedByMe', undefined)
    emit('change')
}
</script>

<template>
    <GenericFilterBar :count="count">
        <!-- Primary Filter: Activity Search -->
        <template #primary-filters>
            <FilterGroup icon="pi pi-search" class="flex-1">
                <span class="w-[220px]">
                    <ActivityAutocomplete
                        :model-value="localActivityQuery"
                        :placeholder="t('placeholder.search')"
                        :size="'small'"
                        @update:model-value="onActivityQueryChange"
                        @select="onActivitySelect"
                    />
                </span>
            </FilterGroup>
        </template>

        <!-- Advanced Filters in Popover -->
        <template #advanced-filters>
            <ToggleFilter
                :model-value="localLikedByMe"
                icon="pi pi-heart"
                icon-active="pi pi-heart-fill"
                tooltip="Liked by me"
                :class="localLikedByMe ? 'text-red-500' : 'text-surface-600'"
                @update:model-value="onLikedByMeToggle"
            />
        </template>

        <!-- Actions: Liked Toggle -->
        <template #actions>
            <GenericPopover
                ref="filtersPopoverRef"
                button-icon="pi pi-filter"
                :button-class="`${activeFiltersCount > 0 ? 'p-button-badge' : ''}`"
                :popover-class="'w-fit-content'"
            >
                <template #content>
                    <div class="flex flex-col gap-4 p-4 bg-surface-0 rounded-md">
                        <div class="flex items-center justify-between">
                            <span class="font-semibold text-surface-900">Filters</span>
                            <Button
                                label="Clear All"
                                link
                                size="small"
                                class="p-0"
                                @click="clearFilters"
                            />
                        </div>

                        <!-- Participants Filter -->
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-700">Participants</label>
                            <MultiSelectFilter
                                :model-value="localParticipantIds"
                                :options="server_store.getMembers || []"
                                option-label="nickname"
                                option-value="public_id"
                                placeholder="Select participants"
                                @update:model-value="onParticipantIdsChange"
                            />
                        </div>

                        <!-- Date Range Filter -->
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-700">Date Range</label>
                            <DateRangeFilter
                                :model-value="localDateRange"
                                @update:model-value="onDateRangeChange"
                            />
                        </div>

                        <!-- Duration Filter -->
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-medium text-surface-700"
                                >Duration (minutes)</label
                            >
                            <NumberRangeFilter
                                :min="localMinDuration"
                                :max="localMaxDuration"
                                placeholder-min="Min"
                                placeholder-max="Max"
                                @update:min="onMinDurationChange"
                                @update:max="onMaxDurationChange"
                            />
                        </div>
                    </div>
                </template>
            </GenericPopover>
        </template>
    </GenericFilterBar>
</template>
