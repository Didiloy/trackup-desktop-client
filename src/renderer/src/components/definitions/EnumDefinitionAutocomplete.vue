<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'

interface Props {
    modelValue?: string
    placeholder?: string
    initialDefinition?: IEnumDefinition | null
    disabled?: boolean
    size?: 'small' | 'large' | ''
}

interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'select', definition: IEnumDefinition | null): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    initialDefinition: null,
    disabled: false,
    size: ''
})

const emit = defineEmits<Emits>()
const { t } = useI18n()
const server_store = useServerStore()
const { listEnumDefinitions } = useEnumDefinitionCRUD()

const query = ref('')
const suggestions = ref<IEnumDefinition[]>([])

// Sync prop to internal ref
watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal !== query.value) {
            query.value = newVal || ''
        }
    },
    { immediate: true }
)

// Sync internal ref to emit
watch(query, (newVal) => {
    emit('update:modelValue', newVal || '')
    if (!newVal) {
        emit('select', null)
    }
})

async function fetchDefinitions(): Promise<void> {
    if (!server_store.getPublicId) return
    try {
        const res = await listEnumDefinitions(server_store.getPublicId)
        if (res.data) {
            server_store.setEnumsDefinition(res.data)
        }
    } catch (e) {
        console.error('Failed to fetch enum definitions', e)
    }
}

async function handleComplete(event: { query: string }): Promise<void> {
    const q = event.query.toLowerCase()

    // 1. Check store first
    let definitions = server_store.getEnumsDefinition || []

    // 2. If store is empty, fetch from API
    if (definitions.length === 0) {
        await fetchDefinitions()
        definitions = server_store.getEnumsDefinition || []
    }

    if (!q) {
        suggestions.value = [...definitions]
    } else {
        suggestions.value = definitions.filter((d) => d.name.toLowerCase().includes(q))
    }
}

function handleItemSelect(event: { value: IEnumDefinition }): void {
    query.value = event.value.name
    emit('select', event.value)
}

onMounted(() => {
    // If store is empty, we can pre-fetch, but handleComplete also handles it.
    // Pre-fetching is good for UX.
    if (!server_store.getEnumsDefinition || server_store.getEnumsDefinition.length === 0) {
        void fetchDefinitions()
    }

    if (props.initialDefinition) {
        query.value = props.initialDefinition.name
    }
})
</script>

<template>
    <AutoComplete
        v-model="query"
        :suggestions="suggestions"
        option-label="name"
        :placeholder="placeholder || t('views.server_definitions.create_modal.name_placeholder')"
        :size="size"
        :disabled="disabled"
        :pt="{
            root: { style: 'width: 100%;' }
        }"
        @complete="handleComplete"
        @item-select="handleItemSelect"
    >
        <template #option="slotProps">
            <div class="flex items-center gap-2">
                <div
                    class="w-6 h-6 rounded bg-surface-200 flex items-center justify-center text-xs text-surface-600"
                >
                    <i class="pi pi-list text-[10px]"></i>
                </div>
                <span>{{ slotProps.option.name }}</span>
            </div>
        </template>
    </AutoComplete>
</template>

<style scoped>
:deep(.p-autocomplete) {
    width: 100% !important;
}

:deep(.p-autocomplete-input-wrapper) {
    width: 100% !important;
}

:deep(.p-inputtext) {
    width: 100% !important;
}

:deep(.p-autocomplete-panel) {
    width: 100% !important;
}
</style>
