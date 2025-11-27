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

const background_class = '!bg-surface-100 !text-surface-900'
</script>

<template>
    <div class="flex flex-col gap-1">
        <!-- Label -->
        <div class="flex items-center gap-2">
            <i class="pi pi-database text-surface-500"></i>
            <span class="text-sm font-medium text-surface-700">
                {{ def.label || def.key }}
                <span v-if="def.required" class="text-red-500">*</span>
            </span>
        </div>
        <p v-if="def.description" class="text-xs text-surface-500">
            {{ def.description }}
        </p>

        <!-- Input -->
        <div class="mt-1">
            <!-- With choices (allow custom) -->
            <Dropdown
                v-if="def.choices && def.choices.length > 0 && def.allow_not_predefined_value"
                v-model="value"
                :options="def.choices"
                :placeholder="def.label || ''"
                editable
                class="w-full"
                :pt="{ root: { class: background_class }, input: { class: background_class } }"
            />

            <!-- With choices (strict) -->
            <Dropdown
                v-else-if="def.choices && def.choices.length > 0"
                v-model="value"
                :options="def.choices"
                :placeholder="def.label || undefined"
                class="w-full"
                :pt="{ root: { class: background_class }, input: { class: background_class } }"
            />

            <!-- Free text -->
            <InputText
                v-else
                v-model="value"
                :placeholder="def.label || undefined"
                class="w-full"
                :class="background_class"
            />
        </div>
    </div>
</template>
