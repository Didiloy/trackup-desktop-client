<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GenericFilterBar from '@/components/filters/GenericFilterBar.vue'
import SelectFilter from '@/components/filters/SelectFilter.vue'
import GenericPopover from '@/components/common/contexts/GenericPopover.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import MemberAutocomplete from '@/components/members/MemberAutocomplete.vue'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import ActivityAutocomplete from '@/components/activities/ActivityAutocomplete.vue'
import FilterGroup from '@/components/filters/FilterGroup.vue'

interface Props {
    search?: string
    searchField?: 'nickname' | 'email'
    joinedStartDate?: Date
    joinedEndDate?: Date
    count?: number
}

interface Emits {
    (e: 'update:search', value: string): void
    (e: 'update:searchField', value: 'nickname' | 'email'): void
    (e: 'update:joinedStartDate', value: Date | undefined): void
    (e: 'update:joinedEndDate', value: Date | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
    search: '',
    searchField: 'nickname',
    joinedStartDate: undefined,
    joinedEndDate: undefined,
    count: 0
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const localSearch = ref(props.search)
const localSearchField = ref<'nickname' | 'email'>(props.searchField)
const localDateRange = ref<Date[] | null>(
    props.joinedStartDate || props.joinedEndDate
        ? ([props.joinedStartDate, props.joinedEndDate].filter(Boolean) as Date[])
        : null
)
const selectedMember = ref<IServerMember | null>(null)

const searchFieldOptions = computed(() => [
    { label: t('common.filters.search_modes.by_nickname'), value: 'nickname' },
    { label: t('common.filters.search_modes.by_email'), value: 'email' }
])

const activeFiltersCount = computed(() => {
    let count = 0
    if (localDateRange.value && localDateRange.value.length > 0) count++
    return count
})

const hasActiveFilters = computed(() => {
    return localSearch.value !== '' || activeFiltersCount.value > 0
})

watch(
    () => props.search,
    (v) => {
        if (v !== localSearch.value) localSearch.value = v
    }
)

watch(
    () => props.searchField,
    (v) => {
        if (v !== localSearchField.value) localSearchField.value = v
    }
)

function onSearchInput(value: string): void {
    localSearch.value = value
    emit('update:search', value)
}

function onSearchFieldChange(value: unknown): void {
    localSearchField.value = value as 'nickname' | 'email'
    emit('update:searchField', value as 'nickname' | 'email')
}

function onDateRangeChange(value: Date[] | null): void {
    localDateRange.value = value
    if (value && value.length === 2) {
        emit('update:joinedStartDate', value[0])
        emit('update:joinedEndDate', value[1])
    } else if (value && value.length === 1) {
        emit('update:joinedStartDate', value[0])
        emit('update:joinedEndDate', undefined)
    } else {
        emit('update:joinedStartDate', undefined)
        emit('update:joinedEndDate', undefined)
    }
}

function handleMemberSelect(member: IServerMember | null): void {
    selectedMember.value = member
    if (member) {
        localSearch.value = member.nickname || ''
        emit('update:search', member.nickname || '')
    } else {
        localSearch.value = ''
        emit('update:search', '')
    }
}

function clearFilters(): void {
    localSearch.value = ''
    localSearchField.value = 'nickname'
    localDateRange.value = null
    emit('update:search', '')
    emit('update:searchField', 'nickname')
    emit('update:joinedStartDate', undefined)
    emit('update:joinedEndDate', undefined)
}
</script>

<template>
    <GenericFilterBar :count="count">
        <template #primary-filters>
            <FilterGroup icon="pi pi-search" class="flex-1">
                <span class="w-[220px]">
                    <MemberAutocomplete
                        :model-value="localSearch"
                        :placeholder="
                            localSearchField === 'nickname'
                                ? t('placeholder.search_nickname')
                                : t('placeholder.search_email')
                        "
                        size="small"
                        @select="handleMemberSelect"
                        @update:model-value="onSearchInput"
                    />
                </span>
            </FilterGroup>
        </template>

        <template #advanced-filters>
            <div class="flex-1 flex items-center justify-end gap-2">
                <GenericPopover
                    button-icon="pi pi-filter"
                    :button-badge="
                        activeFiltersCount > 0 ? activeFiltersCount.toString() : undefined
                    "
                    button-badge-severity="info"
                >
                    <template #content>
                        <div class="flex flex-col gap-4 p-4 bg-surface-0 rounded-md">
                            <div class="flex items-center justify-between">
                                <span class="font-semibold text-surface-900">{{
                                    t('common.filters.title')
                                }}</span>
                                <Button
                                    :label="t('common.actions.clear_all')"
                                    link
                                    size="small"
                                    class="p-0"
                                    @click="clearFilters"
                                />
                            </div>

                            <!-- Search Field Filter -->
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium text-surface-700">{{
                                    t('common.filters.search_by')
                                }}</label>
                                <SelectFilter
                                    :model-value="localSearchField"
                                    :options="searchFieldOptions"
                                    @update:model-value="onSearchFieldChange"
                                />
                            </div>

                            <!-- Joined Date Filter -->
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium text-surface-700">{{
                                    t('common.filters.joined_date')
                                }}</label>
                                <DateRangeFilter
                                    :model-value="localDateRange"
                                    @update:model-value="onDateRangeChange"
                                />
                            </div>
                        </div>
                    </template>
                </GenericPopover>

                <Button
                    v-if="hasActiveFilters"
                    :label="t('common.actions.clear_all')"
                    link
                    size="small"
                    class="p-0"
                    @click="clearFilters"
                />
            </div>
        </template>
    </GenericFilterBar>
</template>
