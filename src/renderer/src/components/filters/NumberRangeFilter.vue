<script setup lang="ts">
interface Props {
    min?: number
    max?: number
    placeholderMin?: string
    placeholderMax?: string
    icon?: string
    size?: 'small' | 'large'
    useGrouping?: boolean
}

interface Emits {
    (e: 'update:min', value: number | undefined): void
    (e: 'update:max', value: number | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
    placeholderMin: 'Min',
    placeholderMax: 'Max',
    size: 'small',
    useGrouping: false
})

const emit = defineEmits<Emits>()

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'

function onMinChange(value: number | undefined): void {
    emit('update:min', value)
}

function onMaxChange(value: number | undefined): void {
    emit('update:max', value)
}
</script>

<template>
    <div class="flex items-center gap-2">
        <InputNumber
            :model-value="min"
            :placeholder="placeholderMin"
            :use-grouping="useGrouping"
            :size="size"
            class="w-full"
            :pt="{ root: { style: background_style } }"
            @update:model-value="onMinChange"
        />
        <span class="text-surface-500">-</span>
        <InputNumber
            :model-value="max"
            :placeholder="placeholderMax"
            :use-grouping="useGrouping"
            :size="size"
            class="w-full"
            :pt="{ root: { style: background_style } }"
            @update:model-value="onMaxChange"
        />
    </div>
</template>
