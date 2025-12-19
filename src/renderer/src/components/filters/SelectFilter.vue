<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface SelectOption {
    label: string
    value: unknown
}

interface Props {
    modelValue: unknown
    options: SelectOption[]
    placeholder?: string
    icon?: string
    size?: 'small' | 'large'
    optionLabel?: string
    optionValue?: string
}

interface Emits {
    (e: 'update:modelValue', value: unknown): void
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: undefined,
    size: 'small',
    optionLabel: 'label',
    optionValue: 'value'
})

const emit = defineEmits<Emits>()
const { t } = useI18n()
const placeholderText = computed(() => props.placeholder ?? t('placeholder.select'))

function onChange(value: unknown): void {
    emit('update:modelValue', value)
}
</script>

<template>
    <div class="flex items-center gap-2">
        <i v-if="icon" :class="[icon, 'text-surface-800']"></i>
        <Select
            :model-value="modelValue"
            :options="options"
            :option-label="optionLabel"
            :option-value="optionValue"
            :placeholder="placeholderText"
            class="w-full"
            append-to="body"
            :pt="{
                root: { class: 'bg-surface-100' },
                overlay: { class: 'bg-surface-100' },
                listContainer: { class: 'bg-surface-100' }
            }"
            @update:model-value="onChange"
        />
    </div>
</template>
