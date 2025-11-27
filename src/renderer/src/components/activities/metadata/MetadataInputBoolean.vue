<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

const props = defineProps<{
    def: IActivityMetadataDefinition
    modelValue: any
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>()

const { t } = useI18n()

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})
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
        <div class="mt-1 flex items-center gap-2">
            <InputSwitch v-model="value" />
            <span class="text-sm text-surface-600">
                {{ value ? t('common.yes') : t('common.no') }}
            </span>
        </div>
    </div>
</template>
