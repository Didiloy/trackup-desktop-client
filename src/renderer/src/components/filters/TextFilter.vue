<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

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
    placeholder: undefined,
    size: 'small'
})

const emit = defineEmits<Emits>()
const { t } = useI18n()
const placeholderText = computed(() => props.placeholder ?? t('placeholder.search'))

function onInput(value: string | undefined): void {
    emit('update:modelValue', value ?? '')
}
</script>

<template>
    <div class="flex items-center gap-2 flex-1">
        <i v-if="icon" :class="[icon, 'text-surface-800']"></i>
        <InputText
            :model-value="modelValue"
            :placeholder="placeholderText"
            class="w-full"
            :size="size"
            @update:model-value="onInput"
        />
    </div>
</template>
