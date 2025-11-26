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
            append-to="body"
            @update:model-value="onChange"
            :pt="{
                root: { class: 'bg-surface-100' },
                overlay: { class: 'bg-surface-100' },
                listContainer: { class: 'bg-surface-100' }
            }"
        />
    </div>
</template>
