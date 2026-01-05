<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GenericFilterBar from '@/components/filters/GenericFilterBar.vue'
import SelectFilter from '@/components/filters/SelectFilter.vue'
import GenericPopover from '@/components/common/contexts/GenericPopover.vue'
import FilterGroup from '@/components/filters/FilterGroup.vue'
import EnumDefinitionAutocomplete from '@/components/definitions/EnumDefinitionAutocomplete.vue'

interface Props {
    search?: string
    searchField?: 'name' | 'description'
    sortBy?: 'name' | 'choices_count'
    sortOrder?: 'asc' | 'desc'
    count?: number
}

interface Emits {
    (e: 'update:search', value: string): void
    (e: 'update:searchField', value: 'name' | 'description'): void
    (e: 'update:sortBy', value: 'name' | 'choices_count'): void
    (e: 'update:sortOrder', value: 'asc' | 'desc'): void
}

const props = withDefaults(defineProps<Props>(), {
    search: '',
    searchField: 'name',
    sortBy: 'name',
    sortOrder: 'asc',
    count: 0
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const localSearch = ref(props.search)
const localSearchField = ref<'name' | 'description'>(props.searchField)
const localSortBy = ref<'name' | 'choices_count' | 'total_usage' | 'unique_users'>(props.sortBy)
const localSortOrder = ref<'asc' | 'desc'>(props.sortOrder)

const searchFieldOptions = computed(() => [
    { label: t('common.filters.search_modes.by_name'), value: 'name' },
    { label: t('common.filters.search_modes.by_description'), value: 'description' }
])

const sortByOptions = computed(() => [
    { label: t('common.filters.sort_by.name'), value: 'name' },
    { label: t('common.filters.sort_by.choices_count'), value: 'choices_count' },
])

const sortOrderOptions = computed(() => [
    { label: t('common.filters.sort_order.asc'), value: 'asc' },
    { label: t('common.filters.sort_order.desc'), value: 'desc' }
])

const activeFiltersCount = computed(() => {
    let count = 0
    if (localSortBy.value !== 'name') count++
    if (localSortOrder.value !== 'asc') count++
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

watch(
    () => props.sortBy,
    (v) => {
        if (v !== localSortBy.value) localSortBy.value = v
    }
)

watch(
    () => props.sortOrder,
    (v) => {
        if (v !== localSortOrder.value) localSortOrder.value = v
    }
)

function onSearchInput(value: string | undefined): void {
    localSearch.value = value ?? ''
    emit('update:search', value ?? '')
}

function onSearchFieldChange(value: unknown): void {
    localSearchField.value = value as 'name' | 'description'
    emit('update:searchField', value as 'name' | 'description')
}

function onSortByChange(value: unknown): void {
    localSortBy.value = value as 'name' | 'choices_count'
    emit('update:sortBy', value as 'name' | 'choices_count')
}

function onSortOrderChange(value: unknown): void {
    localSortOrder.value = value as 'asc' | 'desc'
    emit('update:sortOrder', value as 'asc' | 'desc')
}

function clearFilters(): void {
    localSearch.value = ''
    localSearchField.value = 'name'
    localSortBy.value = 'name'
    localSortOrder.value = 'asc'
    emit('update:search', '')
    emit('update:searchField', 'name')
    emit('update:sortBy', 'name')
    emit('update:sortOrder', 'asc')
}
</script>

<template>
    <GenericFilterBar :count="count">
        <template #primary-filters>
            <FilterGroup icon="pi pi-search" class="flex-1">
                <span class="w-[220px]">
                    <EnumDefinitionAutocomplete
                        :model-value="localSearch"
                        :placeholder="
                            localSearchField === 'name'
                                ? t('placeholder.search_name')
                                : t('placeholder.search_description')
                        "
                        size="small"
                        class="w-full"
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
                                    v-if="hasActiveFilters"
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
                                    class="w-48"
                                    @update:model-value="onSearchFieldChange"
                                />
                            </div>

                            <!-- Sort By Filter -->
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium text-surface-700">{{
                                    t('common.filters.sort_by.label')
                                }}</label>
                                <SelectFilter
                                    :model-value="localSortBy"
                                    :options="sortByOptions"
                                    class="w-48"
                                    @update:model-value="onSortByChange"
                                />
                            </div>

                            <!-- Sort Order Filter -->
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium text-surface-700">{{
                                    t('common.filters.sort_order.label')
                                }}</label>
                                <SelectFilter
                                    :model-value="localSortOrder"
                                    :options="sortOrderOptions"
                                    class="w-48"
                                    @update:model-value="onSortOrderChange"
                                />
                            </div>
                        </div>
                    </template>
                </GenericPopover>
            </div>
        </template>
    </GenericFilterBar>
</template>

