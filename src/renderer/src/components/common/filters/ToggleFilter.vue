<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

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
const { t } = useI18n()

const tooltipText = computed(() => {
    if (!props.tooltip) return undefined
    return props.tooltip.includes('.') ? t(props.tooltip) : props.tooltip
})

const labelText = computed(() => {
    if (!props.label) return undefined
    return props.label.includes('.') ? t(props.label) : props.label
})

function onToggle(): void {
    emit('update:modelValue', !props.modelValue)
}
</script>

<template>
    <Button
        :v-tooltip="tooltipText"
        :icon="modelValue && iconActive ? iconActive : icon"
        :class="[rounded ? 'p-button-rounded' : '', 'p-button-text']"
        :aria-label="labelText || tooltipText"
        @click="onToggle"
    />
</template>
