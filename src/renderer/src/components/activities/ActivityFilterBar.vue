<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
    query?: string
    searchMode?: 'startsWith' | 'endsWith' | 'contains' | 'exact'
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
    searchMode: 'contains'
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

function onQueryInput(value: string | undefined): void {
    emit('update:query', value ?? '')
    notify()
}

function onSearchModeChange(value: 'startsWith' | 'endsWith' | 'contains' | 'exact'): void {
    emit('update:searchMode', value)
    notify()
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'

const searchModeOptions = [
    { label: 'Contains', value: 'contains' },
    { label: 'Starts With', value: 'startsWith' },
    { label: 'Ends With', value: 'endsWith' },
    { label: 'Exact Match', value: 'exact' }
]
</script>

<template>
    <div class="w-full flex flex-nowrap items-center gap-3 p-2 bg-surface-100 rounded-md">
        <!-- Search -->
        <div class="flex items-center gap-2 flex-1 min-w-[220px] max-w-[320px]">
            <i class="pi pi-search text-surface-800"></i>
            <InputText
                :model-value="localQuery"
                :placeholder="t('placeholder.search')"
                class="w-full"
                size="small"
                :pt="{ root: { style: background_style } }"
                @update:model-value="onQueryInput"
            />
        </div>

        <!-- Search Mode -->
        <div class="flex items-center gap-2 min-w-[180px]">
            <i class="pi pi-filter text-surface-800"></i>
            <Select
                :model-value="localSearchMode"
                :options="searchModeOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                append-to="self"
                size="small"
                :pt="{
                    root: { style: background_style },
                    label: { style: 'color: var(--p-surface-900)' },
                    overlay: { style: background_style },
                    listContainer: { style: background_style }
                }"
                @update:model-value="onSearchModeChange"
            />
        </div>
    </div>
</template>
