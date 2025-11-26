<script setup lang="ts">
interface Props {
    modelValue: Date[] | null
    placeholder?: string
    icon?: string
    size?: 'small' | 'large'
    dateFormat?: string
}

interface Emits {
    (e: 'update:modelValue', value: Date[] | null): void
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select date range',
    size: 'small',
    dateFormat: 'yy-mm-dd'
})

const emit = defineEmits<Emits>()

function onChange(value: Date | Date[] | (Date | null)[] | null | undefined): void {
    let dateArray: Date[] | null = null
    if (Array.isArray(value)) {
        const filtered = value.filter((d): d is Date => d instanceof Date)
        dateArray = filtered.length > 0 ? filtered : null
    }
    emit('update:modelValue', dateArray)
}
</script>

<template>
    <DatePicker
        :model-value="modelValue"
        selection-mode="range"
        :placeholder="placeholder"
        :date-format="dateFormat"
        show-icon
        :size="size"
        class="w-full"
        append-to="body"
        @update:model-value="onChange"
    />
</template>
