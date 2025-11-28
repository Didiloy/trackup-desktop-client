<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

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
    placeholder: undefined,
    size: 'small',
    dateFormat: 'yy-mm-dd'
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const placeholderText = computed(() => props.placeholder ?? t('common.filters.date_range'))

function onChange(value: Date | Date[] | (Date | null)[] | null | undefined): void {
    let dateArray: Date[] | null = null
    if (Array.isArray(value)) {
        const collected: Date[] = []
        for (const item of value as unknown[]) {
            if (item instanceof Date) collected.push(item)
        }
        dateArray = collected.length > 0 ? collected : null
    }
    emit('update:modelValue', dateArray)
}
</script>

<template>
    <DatePicker
        :model-value="modelValue"
        selection-mode="range"
        :placeholder="placeholderText"
        :date-format="dateFormat"
        show-icon
        :size="size"
        class="w-full"
        append-to="body"
        @update:model-value="onChange"
    />
</template>
