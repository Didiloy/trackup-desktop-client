<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GenericFilterBar from '@/components/filters/GenericFilterBar.vue'
import TextFilter from '@/components/filters/TextFilter.vue'
import SelectFilter from '@/components/filters/SelectFilter.vue'
import FilterGroup from '@/components/filters/FilterGroup.vue'

interface Props {
    query?: string
    searchMode?: 'startsWith' | 'endsWith' | 'contains' | 'exact'
    count?: number
}

interface Emits {
    (e: 'update:query', value: string): void
    (e: 'update:searchMode', value: 'startsWith' | 'endsWith' | 'contains' | 'exact'): void
    (
        e: 'change',
        payload: { query: string; searchMode: 'startsWith' | 'endsWith' | 'contains' | 'exact' }
    ): void
}

const props = withDefaults(defineProps<Props>(), {
    query: '',
    searchMode: 'contains',
    count: 0
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const localQuery = ref(props.query)
const localSearchMode = ref<'startsWith' | 'endsWith' | 'contains' | 'exact'>(props.searchMode)

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

function onSearchModeChange(value: 'startsWith' | 'endsWith' | 'contains' | 'exact'): void {
    localSearchMode.value = value
    emit('update:searchMode', value)
    notify()
}

const searchModeOptions = computed(() => [
    { label: t('filters.search_modes.contains'), value: 'contains' },
    { label: t('filters.search_modes.starts_with'), value: 'startsWith' },
    { label: t('filters.search_modes.ends_with'), value: 'endsWith' },
    { label: t('filters.search_modes.exact_match'), value: 'exact' }
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
        </template>
    </GenericFilterBar>
</template>
