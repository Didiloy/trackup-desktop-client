<script setup lang="ts">
import { computed } from 'vue'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

const props = defineProps<{
    def: IActivityMetadataDefinition
    modelValue: any
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>()

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const background_class = '!bg-surface-0 !text-surface-900'
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
                    {{ def.label || def.key }}
                    <span v-if="def.required" class="text-red-500">*</span>
                </span>
                <p v-if="def.description" class="text-xs text-surface-500 line-clamp-2">
                    {{ def.description }}
                </p>
            </div>
            <div class="ml-auto text-xs text-surface-400 italic shrink-0 mt-0.5">
                {{ def.type }}
            </div>
        </div>

        <!-- Input -->
        <div class="mt-auto pt-1">
            <!-- With choices (allow custom) -->
            <Dropdown
                v-if="def.choices && def.choices.length > 0 && def.allow_not_predefined_value"
                v-model="value"
                :options="def.choices"
                :placeholder="def.label || ''"
                editable
                class="w-full p-inputtext-sm"
                :pt="{ root: { class: background_class }, input: { class: background_class } }"
            />

            <!-- With choices (strict) -->
            <Dropdown
                v-else-if="def.choices && def.choices.length > 0"
                v-model="value"
                :options="def.choices"
                :placeholder="def.label || undefined"
                class="w-full p-inputtext-sm"
                :pt="{ root: { class: background_class }, input: { class: background_class } }"
            />

            <!-- Free text -->
            <InputText
                v-else
                v-model="value"
                :placeholder="def.label || undefined"
                class="w-full p-inputtext-sm"
                :class="background_class"
            />
        </div>
    </div>
</template>
