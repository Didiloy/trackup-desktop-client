<script setup lang="ts">
interface Props {
    modelValue: string
    placeholder?: string
    icon?: string
    size?: 'small' | 'large'
}

interface Emits {
    (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Search...',
    size: 'small'
})

const emit = defineEmits<Emits>()

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'

function onInput(value: string | undefined): void {
    emit('update:modelValue', value ?? '')
}
</script>

<template>
    <div class="flex items-center gap-2 flex-1">
        <i v-if="icon" :class="[icon, 'text-surface-800']"></i>
        <InputText
            :model-value="modelValue"
            :placeholder="placeholder"
            class="w-full"
            :size="size"
            :pt="{ root: { style: background_style } }"
            @update:model-value="onInput"
        />
    </div>
</template>
