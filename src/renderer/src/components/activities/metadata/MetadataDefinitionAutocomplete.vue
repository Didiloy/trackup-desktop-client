<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import MetadataTypeBadge from '@/components/common/icons/MetadataTypeBadge.vue'

interface Props {
    modelValue?: string
    placeholder?: string
    initialDefinition?: IActivityMetadataDefinition | null
    disabled?: boolean
    size?: 'small' | 'large' | ''
    activityId?: string
}

interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'select', definition: IActivityMetadataDefinition | null): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    initialDefinition: null,
    disabled: false,
    size: '',
    activityId: undefined
})

const emit = defineEmits<Emits>()
const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()

const query = ref('')
const suggestions = ref<IActivityMetadataDefinition[]>([])
const allDefinitions = ref<IActivityMetadataDefinition[]>([])

const currentActivityId = computed(() => props.activityId || (route.params.activityId as string))

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
    if (!server_store.getPublicId || !currentActivityId.value) return
    try {
        const res = await listMetadataDefinitions(server_store.getPublicId, currentActivityId.value)
        if (res.data) {
            allDefinitions.value = res.data
        }
    } catch (e) {
        console.error('Failed to fetch metadata definitions', e)
    }
}

async function handleComplete(event: { query: string }): Promise<void> {
    const q = event.query.toLowerCase()

    // Fetch if empty
    if (allDefinitions.value.length === 0) {
        await fetchDefinitions()
    }

    if (!q) {
        suggestions.value = [...allDefinitions.value]
    } else {
        suggestions.value = allDefinitions.value.filter(
            (d) => (d.label || d.key).toLowerCase().includes(q) || d.key.toLowerCase().includes(q)
        )
    }
}

function handleItemSelect(event: { value: IActivityMetadataDefinition }): void {
    query.value = event.value.label || event.value.key
    emit('select', event.value)
}

onMounted(() => {
    void fetchDefinitions()

    if (props.initialDefinition) {
        query.value = props.initialDefinition.label || props.initialDefinition.key
    }
})
</script>

<template>
    <AutoComplete
        v-model="query"
        :suggestions="suggestions"
        :option-label="(d: IActivityMetadataDefinition) => d.label || d.key"
        :placeholder="placeholder || t('placeholder.search')"
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
                    <MetadataTypeBadge :type="slotProps.option.type" />
                </div>
                <div class="flex flex-col">
                    <span class="text-sm">{{
                        slotProps.option.label || slotProps.option.key
                    }}</span>
                    <span v-if="slotProps.option.label" class="text-xs text-surface-400">
                        {{ slotProps.option.key }}
                    </span>
                </div>
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
