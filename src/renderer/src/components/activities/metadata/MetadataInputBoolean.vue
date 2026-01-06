<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { getMetadataTypeTranslationKey } from '@/utils/metadata.utils'

const props = defineProps<{
    def: IActivityMetadataDefinition
    modelValue: boolean | undefined
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean | undefined): void
}>()

const { t } = useI18n()

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})
</script>

<template>
    <div
        class="flex flex-col p-3 border border-surface-200 rounded-lg bg-surface-50/50 hover:border-primary-200 transition-colors"
    >
        <!-- Header -->
        <div class="flex items-start gap-2">
            <div
                class="flex items-center justify-center w-6 h-6 rounded bg-green-100 text-green-600 shrink-0 mt-0.5"
            >
                <i class="pi pi-check-circle text-xs"></i>
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
            <!-- Input -->
            <div class="m-auto flex items-center gap-2">
                <InputSwitch v-model="value" />
                <span class="text-sm text-surface-600 font-medium">
                    {{ value ? t('common.misc.yes') : t('common.misc.no') }}
                </span>
            </div>
            <div class="ml-auto text-xs text-surface-400 italic shrink-0 mt-1">
                {{ t(getMetadataTypeTranslationKey('BOOLEAN')) }}
            </div>
        </div>
    </div>
</template>
