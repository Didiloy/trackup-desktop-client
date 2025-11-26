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

function onChange(value: string[]): void {
    emit('update:modelValue', value)
}
const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
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
        append-to="body"
        :pt="{
            root: { class: 'bg-surface-100', style: background_style },
            overlay: { class: 'bg-surface-100', style: background_style },
            listContainer: { class: 'bg-surface-100', style: background_style }
        }"
        @update:model-value="onChange"
    />
</template>
