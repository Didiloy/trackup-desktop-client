<script setup lang="ts">
interface Props {
    modelValue: boolean
    icon?: string
    iconActive?: string
    label?: string
    tooltip?: string
    rounded?: boolean
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
    icon: 'pi pi-check',
    rounded: true
})

const emit = defineEmits<Emits>()

function onToggle(): void {
    emit('update:modelValue', !props.modelValue)
}
</script>

<template>
    <Button
        :v-tooltip="tooltip"
        :icon="modelValue && iconActive ? iconActive : icon"
        :class="[rounded ? 'p-button-rounded' : '', 'p-button-text']"
        :aria-label="label || tooltip"
        @click="onToggle"
    />
</template>
