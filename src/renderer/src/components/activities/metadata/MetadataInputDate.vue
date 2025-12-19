<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

const props = defineProps<{
    def: IActivityMetadataDefinition
    modelValue: Date | undefined
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Date | undefined): void
}>()

const { t, te } = useI18n()

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

// Translate label if it's a translation key (or return raw label/key)
const labelText = computed(() => {
    const label = props.def?.label
    if (!label) return props.def?.key ?? ''
    if (te(label)) return t(label)
    return label
})

const descriptionText = computed(() => {
    const d = props.def?.description
    if (!d) return ''
    if (te(d)) return t(d)
    return d
})
</script>

<template>
    <div
        class="flex flex-col gap-2 p-3 border border-surface-200 rounded-lg bg-surface-50/50 hover:border-primary-200 transition-colors h-full"
    >
        <!-- Header -->
        <div class="flex items-start gap-2">
            <div
                class="flex items-center justify-center w-6 h-6 rounded bg-purple-100 text-purple-600 shrink-0 mt-0.5"
            >
                <i class="pi pi-calendar text-xs"></i>
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
                {{ t('views.activity.add_modal.metadata_type_date') }}
            </div>
        </div>

        <!-- Input -->
        <div class="mt-auto pt-1">
            <DatePicker
                v-model="value"
                show-time
                hour-format="24"
                :placeholder="labelText || undefined"
                class="w-full p-inputtext-sm"
            />
        </div>
    </div>
</template>
