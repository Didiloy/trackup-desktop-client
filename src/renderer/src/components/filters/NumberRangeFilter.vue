<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

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
    placeholderMin: undefined,
    placeholderMax: undefined,
    size: 'small',
    useGrouping: false
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const placeholderMinText = computed(() => props.placeholderMin ?? t('common.actions.min'))
const placeholderMaxText = computed(() => props.placeholderMax ?? t('common.actions.max'))

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
            :placeholder="placeholderMinText"
            :use-grouping="useGrouping"
            :size="size"
            class="w-full"
            @update:model-value="onMinChange"
        />
        <span class="text-surface-500">-</span>
        <InputNumber
            :model-value="max"
            :placeholder="placeholderMaxText"
            :use-grouping="useGrouping"
            :size="size"
            class="w-full"
            @update:model-value="onMaxChange"
        />
    </div>
</template>
