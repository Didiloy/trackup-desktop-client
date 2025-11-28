<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
interface Props {
    modelValue: string[]
    options: string[]
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

withDefaults(defineProps<Props>(), {
    placeholder: undefined,
    size: 'small',
    optionLabel: 'label',
    optionValue: 'value',
    filter: true,
    display: 'chip'
})

const emit = defineEmits<Emits>()
const { t } = useI18n()
const placeholderText = computed(() => {
    const ph = ({} as Props).placeholder
    return typeof ph !== 'undefined' ? ph : t('placeholder.select')
})

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
        :placeholder="placeholderText"
        :filter="filter"
        :display="display"
        :size="size"
        class="w-full"
        append-to="body"
        @update:model-value="onChange"
    />
</template>
