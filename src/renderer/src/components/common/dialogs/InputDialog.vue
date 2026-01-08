<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
    modelValue: boolean
    title: string
    message?: string
    inputValue?: string
    inputLabel?: string
    inputPlaceholder?: string
    cancelLabel?: string
    confirmLabel?: string
    cancelSeverity?: string
    confirmSeverity?: string
    /** Function prop for async confirmation - manages loading state internally */
    onConfirm?: (inputValue: string) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
    message: '',
    inputValue: '',
    inputLabel: '',
    inputPlaceholder: '',
    cancelSeverity: 'secondary',
    confirmSeverity: 'primary'
})

const cancelLabel = computed(() => props.cancelLabel || t('common.actions.cancel'))
const confirmLabel = computed(() => props.confirmLabel || t('common.actions.confirm'))
const inputPlaceholderComputed = computed(() => props.inputPlaceholder || t('placeholder.enter'))
const dialogWidth = '400px'

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'update:inputValue', value: string): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => {
        emit('update:modelValue', value)
    }
})

const inputText = ref('')
const loading = ref(false)

// Sync input value with prop
watch(
    () => props.inputValue,
    (newVal) => {
        inputText.value = newVal
    },
    { immediate: true }
)

// Reset input and loading when dialog is opened
watch(visible, (newVal) => {
    if (newVal) {
        inputText.value = props.inputValue
        loading.value = false
    }
})

const updateInputValue = (value: string | undefined): void => {
    inputText.value = value || ''
    emit('update:inputValue', value || '')
}

const closeDialog = (): void => {
    emit('update:modelValue', false)
}

const confirmAction = async (): Promise<void> => {
    if (!inputText.value || loading.value) return

    if (props.onConfirm) {
        loading.value = true
        try {
            await props.onConfirm(inputText.value)
            closeDialog()
        } finally {
            loading.value = false
        }
    } else {
        closeDialog()
    }
}
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="props.title"
        :style="{
            width: dialogWidth,
            height: 'fit-content',
            userSelect: 'none'
        }"
        :draggable="false"
        :pt="{
            root: {
                style: 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
            }
        }"
    >
        <p v-if="props.message" class="mb-4">{{ props.message }}</p>

        <div class="input-container">
            <label
                v-if="props.inputLabel"
                for="dialog-input"
                class="text-sm font-medium mb-2 block"
            >
                {{ props.inputLabel }}
            </label>
            <InputText
                id="dialog-input"
                :model-value="inputText"
                :placeholder="inputPlaceholderComputed"
                :disabled="loading"
                class="w-full"
                @update:model-value="updateInputValue"
                @keyup.enter="confirmAction"
            />
        </div>

        <div class="dialog-buttons">
            <Button
                :label="cancelLabel"
                :severity="props.cancelSeverity"
                :disabled="loading"
                @click="closeDialog"
            />
            <Button
                :label="confirmLabel"
                :severity="props.confirmSeverity"
                :disabled="loading || !inputText"
                :loading="loading"
                @click="confirmAction"
            />
        </div>
    </Dialog>
</template>

<style scoped>
.dialog-buttons {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.input-container {
    margin: 1rem 0;
    user-select: text;
}

.w-full {
    width: 100%;
}
</style>
