<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
    query?: string
    sort?: 'recent' | 'popular' | 'active'
    onlyMine?: boolean
}
interface Emits {
    (e: 'update:query', value: string): void
    (e: 'update:sort', value: 'recent' | 'popular' | 'active'): void
    (e: 'update:onlyMine', value: boolean): void
    (
        e: 'change',
        payload: { query: string; sort: 'recent' | 'popular' | 'active'; onlyMine: boolean }
    ): void
}

const props = withDefaults(defineProps<Props>(), {
    query: '',
    sort: 'recent',
    onlyMine: false
})
const emit = defineEmits<Emits>()
const { t } = useI18n()

const localQuery = ref(props.query)
const localSort = ref<'recent' | 'popular' | 'active'>(props.sort)
const localOnlyMine = ref<boolean>(props.onlyMine)

watch(
    () => props.query,
    (v) => {
        if (v !== localQuery.value) localQuery.value = v
    }
)
watch(
    () => props.sort,
    (v) => {
        if (v !== localSort.value) localSort.value = v
    }
)
watch(
    () => props.onlyMine,
    (v) => {
        if (v !== localOnlyMine.value) localOnlyMine.value = v
    }
)

function notify(): void {
    emit('change', {
        query: localQuery.value,
        sort: localSort.value,
        onlyMine: localOnlyMine.value
    })
}

function onQueryInput(value: string | undefined): void {
    emit('update:query', value ?? '')
    notify()
}
function onSortChange(value: 'recent' | 'popular' | 'active'): void {
    emit('update:sort', value)
    notify()
}
function onOnlyMineChange(value: boolean): void {
    emit('update:onlyMine', value)
    notify()
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
const sortOptions = [
    {
        label: t('userInterface.serverActivitiesView.filters.sort.recent') || 'Plus récentes',
        value: 'recent'
    },
    {
        label: t('userInterface.serverActivitiesView.filters.sort.popular') || 'Plus populaires',
        value: 'popular'
    },
    {
        label: t('userInterface.serverActivitiesView.filters.sort.active') || 'Plus actives',
        value: 'active'
    }
]

onMounted(() => {
    console.log('ActivityFilterBar mounted')
})
</script>

<template>
    <div class="w-full flex flex-nowrap items-center gap-3 p-2 bg-surface-100 rounded-md">
        <!-- Search -->
        <div class="flex items-center gap-2 flex-1 min-w-[220px]">
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

        <!-- Sort -->
        <div class="flex items-center gap-2 min-w-[220px]">
            <i class="pi pi-sort-amount-down text-surface-800"></i>
            <Select
                :model-value="localSort"
                :options="sortOptions"
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
                @update:model-value="onSortChange"
            />
        </div>

        <!-- Only mine -->
        <div class="flex items-center gap-2">
            <i
                class="pi pi-user text-surface-500 hover:cursor-pointer select-none"
                @click="onOnlyMineChange(!localOnlyMine)"
            ></i>
            <span
                class="text-sm text-surface-700 hover:cursor-pointer select-none"
                @click="onOnlyMineChange(!localOnlyMine)"
            >
                {{ t('userInterface.serverActivitiesView.filters.onlyMine') }}
            </span>
            <InputSwitch :model-value="localOnlyMine" @update:model-value="onOnlyMineChange" />
        </div>
    </div>
</template>
