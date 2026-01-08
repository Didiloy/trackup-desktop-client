<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()

interface Props {
    modelValue: boolean
    title: string
    message: string
    cancelLabel?: string
    confirmLabel?: string
    cancelSeverity?: string
    confirmSeverity?: string
    confirmationName?: string
    /** Function prop for async confirmation - manages loading state internally */
    onConfirm?: () => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
    cancelSeverity: 'secondary',
    confirmSeverity: 'danger',
    confirmationName: ''
})

// Use new translation key paths under `common.actions` to match provided fr.json
const cancelLabel = computed(() => props.cancelLabel || t('common.actions.cancel'))
const confirmLabel = computed(() => props.confirmLabel || t('common.actions.confirm'))

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => {
        emit('update:modelValue', value)
    }
})

const userInput = ref('')
const loading = ref(false)
const isInputValid = computed(() => {
    if (!props.confirmationName) return true
    return userInput.value === props.confirmationName
})

// Reset input and loading when dialog is closed/opened
watch(visible, (newVal) => {
    if (newVal) {
        userInput.value = ''
        loading.value = false
    }
})

const closeDialog = (): void => {
    emit('update:modelValue', false)
}

const confirmAction = async (): Promise<void> => {
    if (!isInputValid.value || loading.value) return

    if (props.onConfirm) {
        loading.value = true
        try {
            await props.onConfirm()
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
            width: '400px',
            height: 'fit-content',
            userSelect: 'none',
            backgroundColor: 'var(--p-surface-50)',
            color: 'var(--p-surface-900)'
        }"
        :draggable="false"
        :pt="{
            root: {
                style: 'background-color: var(--p-surface-50); color: var(--p-surface-900)'
            }
        }"
    >
        <p>{{ props.message }}</p>

        <div v-if="props.confirmationName" class="confirmation-input">
            <div class="icon-text-container">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
                <!-- use new key path under common.actions.write_to_confirm -->
                <p
                    v-html="
                        t('common.actions.write_to_confirm', { entity: props.confirmationName })
                    "
                />
            </div>
            <InputText v-model="userInput" class="w-full" @keyup.enter="confirmAction" />
        </div>

        <div class="o-delete-buttons">
            <Button
                :label="cancelLabel"
                :severity="props.cancelSeverity"
                :disabled="loading"
                @click="closeDialog"
            />
            <Button
                :label="confirmLabel"
                :severity="props.confirmSeverity"
                :disabled="!isInputValid || loading"
                :loading="loading"
                @click="confirmAction"
            />
        </div>
    </Dialog>
</template>

<style scoped>
.o-delete-buttons {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.icon-text-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.confirmation-input {
    margin: 1rem 0;
    user-select: text;
}

.w-full {
    width: 100%;
}
</style>
