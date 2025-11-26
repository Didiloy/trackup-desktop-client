<script setup lang="ts">
interface Props {
    modelValue: string[]
    options: any[]
    placeholder?: string
    icon?: string
    size?: 'small' | 'large'
    optionLabel?: string
    optionValue?: string
    filter?: boolean
    display?: 'comma' | 'chip'
}

interface Emits {
    (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select items',
    size: 'small',
    optionLabel: 'label',
    optionValue: 'value',
    filter: true,
    display: 'chip'
})

const emit = defineEmits<Emits>()

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'

function onChange(value: string[]): void {
    emit('update:modelValue', value)
}
</script>

<template>
    <MultiSelect
        :model-value="modelValue"
        :options="options"
        :option-label="optionLabel"
        :option-value="optionValue"
        :placeholder="placeholder"
        :filter="filter"
        :display="display"
        :size="size"
        class="w-full"
        :pt="{
            root: { style: background_style },
            label: { style: 'color: var(--p-surface-900)' }
        }"
        @update:model-value="onChange"
    />
</template>
