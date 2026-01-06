<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { getMetadataTypeTranslationKey } from '@/utils/metadata.utils'

const props = defineProps<{
    def: IActivityMetadataDefinition
    modelValue: number | undefined
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | undefined): void
}>()

const { t, te } = useI18n()

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

function handleEditableInput(event: unknown): void {
    // event is expected to be an object with a `value` prop (PrimeVue Dropdown editable)
    if (isValueEvent(event)) {
        const val = event.value
        if (val !== undefined && val !== null && val !== '') {
            const numVal = typeof val === 'string' ? parseFloat(val) : val
            if (!isNaN(Number(numVal))) {
                emit('update:modelValue', Number(numVal))
            }
        }
    }
}

function isValueEvent(e: unknown): e is { value: unknown } {
    return typeof e === 'object' && e !== null && 'value' in e
}

function filterNumeric(event: KeyboardEvent): void {
    const allowedKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown'
    ]
    const char = event.key
    if (!/[0-9.-]/.test(char) && !allowedKeys.includes(char)) {
        event.preventDefault()
    }
}

// i18n computed helpers
const labelText = computed(() => {
    const label = props.def?.label
    if (!label) return props.def?.key ?? ''
    if (te(label as string)) return t(label as string)
    return label as string
})

const descriptionText = computed(() => {
    const d = props.def?.description
    if (!d) return ''
    if (te(d as string)) return t(d as string)
    return d as string
})
</script>

<template>
    <div
        class="flex flex-col gap-2 p-3 border border-surface-200 rounded-lg bg-surface-50/50 hover:border-primary-200 transition-colors h-full"
    >
        <!-- Header -->
        <div class="flex items-start gap-2">
            <div
                class="flex items-center justify-center w-6 h-6 rounded bg-orange-100 text-orange-600 shrink-0 mt-0.5"
            >
                <i class="pi pi-hashtag text-xs"></i>
            </div>
            <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-surface-700 truncate">
                    {{ labelText || def.key }}
                    <span v-if="def.required" class="text-red-500">*</span>
                </span>
                <p v-if="def.description" class="text-xs text-surface-500 line-clamp-2">
                    {{ descriptionText }}
                </p>
            </div>
            <div class="ml-auto text-xs text-surface-400 italic shrink-0 mt-0.5">
                {{ t(getMetadataTypeTranslationKey('NUMBER')) }}
            </div>
        </div>

        <!-- Input -->
        <div class="mt-auto pt-1">
            <!-- With choices (allow custom) -->
            <Dropdown
                v-if="def.choices && def.choices.length > 0 && def.allow_not_predefined_value"
                v-model="value"
                :options="def.choices"
                :placeholder="labelText || ''"
                editable
                class="w-full p-inputtext-sm"
                @change="handleEditableInput"
                @keydown="filterNumeric"
            />

            <!-- With choices (strict) -->
            <Dropdown
                v-else-if="def.choices && def.choices.length > 0"
                v-model="value"
                :options="def.choices"
                :placeholder="labelText || undefined"
                class="w-full p-inputtext-sm"
            />

            <!-- Free text input -->
            <InputText
                v-else
                :model-value="value?.toString() || ''"
                :placeholder="labelText || ''"
                class="w-full h-full p-inputtext-lg"
                @change="handleEditableInput"
                @keydown="filterNumeric"
                @update:model-value="
                    (val) => emit('update:modelValue', val ? parseFloat(val) : undefined)
                "
            />
        </div>
    </div>
</template>
