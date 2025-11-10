<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  inputValue: {
    type: String,
    default: ''
  },
  inputLabel: {
    type: String,
    default: ''
  },
  inputPlaceholder: {
    type: String,
    default: ''
  },
  cancelLabel: {
    type: String
  },
  confirmLabel: {
    type: String
  },
  cancelSeverity: {
    type: String,
    default: 'secondary'
  },
  confirmSeverity: {
    type: String,
    default: 'primary'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const cancelLabel = computed(() => props.cancelLabel || t('actions.cancel'))
const confirmLabel = computed(() => props.confirmLabel || t('actions.confirm'))
const dialogWidth = '400px'

const emit = defineEmits(['update:modelValue', 'update:inputValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

const inputText = ref('')

// Sync input value with prop
watch(
  () => props.inputValue,
  (newVal) => {
    inputText.value = newVal
  },
  { immediate: true }
)

// Reset input when dialog is opened
watch(visible, (newVal) => {
  if (newVal) {
    inputText.value = props.inputValue
  }
})

const updateInputValue = (value: string | undefined): void => {
  inputText.value = value || ''
  emit('update:inputValue', value || '')
}

const closeDialog = (): void => {
  emit('update:modelValue', false)
}

const confirmAction = (): void => {
  emit('confirm', inputText.value)
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
  >
    <p v-if="props.message" class="mb-4">{{ props.message }}</p>

    <div class="input-container">
      <label v-if="props.inputLabel" for="dialog-input" class="text-sm font-medium mb-2 block">
        {{ props.inputLabel }}
      </label>
      <InputText
        id="dialog-input"
        :model-value="inputText"
        :placeholder="props.inputPlaceholder"
        :disabled="props.loading"
        class="w-full"
        @update:model-value="updateInputValue"
        @keyup.enter="confirmAction"
      />
    </div>

    <div class="dialog-buttons">
      <Button
        :label="cancelLabel"
        :severity="props.cancelSeverity"
        :disabled="props.loading"
        @click="closeDialog"
      />
      <Button
        :label="confirmLabel"
        :severity="props.confirmSeverity"
        :disabled="props.loading || !inputText"
        :loading="props.loading"
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
