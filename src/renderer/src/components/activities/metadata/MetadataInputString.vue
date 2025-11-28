<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

const props = defineProps<{
    def: IActivityMetadataDefinition
    modelValue: string | undefined
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void
}>()

const { t, te } = useI18n()

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

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

const typeText = computed(() => {
    const type = props.def?.type
    if (!type) return ''
    const candidate = `views.activity.add_modal.${type}`
    if (te(candidate)) return t(candidate)
    if (te(type as string)) return t(type as string)
    return type as string
})
</script>

<template>
    <div
        class="flex flex-col gap-2 p-3 border border-surface-200 rounded-lg bg-surface-50/50 hover:border-primary-200 transition-colors h-full"
    >
        <!-- Header -->
        <div class="flex items-start gap-2">
            <div
                class="flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-600 shrink-0 mt-0.5"
            >
                <i class="pi pi-align-left text-xs"></i>
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
                {{ t('views.activity.add_modal.metadata_type_string') }}
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
                v-model="value"
                :placeholder="labelText || ''"
                class="w-full h-full p-inputtext-lg"
            />
        </div>
    </div>
</template>
