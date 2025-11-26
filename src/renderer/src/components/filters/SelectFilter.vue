<script setup lang="ts">
interface SelectOption {
    label: string
    value: any
}

interface Props {
    modelValue: any
    options: SelectOption[]
    placeholder?: string
    icon?: string
    size?: 'small' | 'large'
    optionLabel?: string
    optionValue?: string
}

interface Emits {
    (e: 'update:modelValue', value: any): void
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select...',
    size: 'small',
    optionLabel: 'label',
    optionValue: 'value'
})

const emit = defineEmits<Emits>()

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'

function onChange(value: any): void {
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
            :placeholder="placeholder"
            class="w-full"
            append-to="self"
            :size="size"
            :pt="{
                root: { style: background_style },
                label: { style: 'color: var(--p-surface-900)' },
                overlay: { style: background_style },
                listContainer: { style: background_style }
            }"
            @update:model-value="onChange"
        />
    </div>
</template>
