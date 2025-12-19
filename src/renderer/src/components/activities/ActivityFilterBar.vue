<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GenericFilterBar from '@/components/filters/GenericFilterBar.vue'
import TextFilter from '@/components/filters/TextFilter.vue'
import SelectFilter from '@/components/filters/SelectFilter.vue'
import FilterGroup from '@/components/filters/FilterGroup.vue'
import { ESearchMode } from '@shared/contracts/enums/search-mode.enum'

interface Props {
    query?: string
    searchMode?: ESearchMode
    count?: number
}

interface Emits {
    (e: 'update:query', value: string): void
    (e: 'update:searchMode', value: ESearchMode): void
    (
        e: 'change',
        payload: { query: string; searchMode: ESearchMode }
    ): void
    (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
    query: '',
    searchMode: ESearchMode.CONTAINS,
    count: 0
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const localQuery = ref(props.query)
const localSearchMode = ref<ESearchMode>(props.searchMode)

watch(
    () => props.query,
    (v) => {
        if (v !== localQuery.value) localQuery.value = v
    }
)

watch(
    () => props.searchMode,
    (v) => {
        if (v !== localSearchMode.value) localSearchMode.value = v
    }
)

function notify(): void {
    emit('change', {
        query: localQuery.value,
        searchMode: localSearchMode.value
    })
}

function onQueryInput(value: string): void {
    localQuery.value = value
    emit('update:query', value)
    notify()
}

function onSearchModeChange(value: ESearchMode): void {
    localSearchMode.value = value
    emit('update:searchMode', value)
    notify()
}

function clearFilters(): void {
    localQuery.value = ''
    localSearchMode.value = ESearchMode.CONTAINS
    emit('update:query', '')
    emit('update:searchMode', ESearchMode.CONTAINS)
    emit('change', { query: '', searchMode: ESearchMode.CONTAINS })
    emit('clear')
}

const hasActiveFilters = computed(() => {
    return localQuery.value !== '' || localSearchMode.value !== ESearchMode.CONTAINS
})

const searchModeOptions = computed(() => [
    { label: t('common.filters.search_modes.contains'), value: ESearchMode.CONTAINS },
    { label: t('common.filters.search_modes.starts_with'), value: ESearchMode.STARTS_WITH },
    { label: t('common.filters.search_modes.ends_with'), value: ESearchMode.ENDS_WITH },
    { label: t('common.filters.search_modes.exact_match'), value: ESearchMode.EXACT }
])
</script>

<template>
    <GenericFilterBar :count="count">
        <template #primary-filters>
            <FilterGroup icon="pi pi-search" class="flex-1">
                <TextFilter
                    class="flex-1 max-w-[220px]"
                    :model-value="localQuery"
                    :placeholder="t('placeholder.search')"
                    @update:model-value="onQueryInput"
                />
            </FilterGroup>
        </template>

        <template #advanced-filters>
            <SelectFilter
                :model-value="localSearchMode"
                :options="searchModeOptions"
                icon="pi pi-filter"
                @update:model-value="onSearchModeChange"
            />
            <Button
                v-if="hasActiveFilters"
                :label="t('common.actions.clear_all')"
                link
                size="small"
                class="p-0 ml-2"
                @click="clearFilters"
            />
        </template>
    </GenericFilterBar>
</template>
