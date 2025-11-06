<script setup lang="ts">
import { ref, computed } from 'vue'
import { session } from '@/composables/auth/utils/authState'
import type {
  IJoinServerRequest,
  IServer
} from '../../../../../shared/contracts/interfaces/entities/server.interfaces'
import { useI18n } from 'vue-i18n'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'joined', server: IServer): void
  (e: 'cancel'): void
}>()

const invitationCode = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)
const { joinServer } = useServerCRUD()

const can_submit = computed(() => {
  return !submitting.value && !!invitationCode.value.trim()
})

async function submit(): Promise<void> {
  if (!can_submit.value) return
  submitting.value = true

  const payload: IJoinServerRequest = {
    code: invitationCode.value.trim()
  }

  const res = await joinServer(payload)
  if (res.error) {
    error.value = t('userInterface.joinServerView.errors')
    submitting.value = false
    return
  } else {
    emit('joined', res.data!)
  }
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
</script>

<template>
  <div class="flex flex-col gap-4 select-none">
    <div class="flex flex-col gap-2">
      <label class="text-sm text-surface-500">
        {{ t('userInterface.joinServerView.invitationCodeLabel') }}
      </label>
      <InputText
        v-model="invitationCode"
        :placeholder="t('userInterface.joinServerView.placeholder.invitationCode')"
        class="w-full"
        :pt="{
          root: {
            style: background_style
          }
        }"
      />
      <small class="text-xs text-surface-500">
        {{ t('userInterface.joinServerView.invitationCodeHint') }}
      </small>
    </div>

    <div v-if="error" class="text-sm text-red-500">{{ error }}</div>

    <div class="flex justify-end gap-2 pt-2">
      <Button :label="t('common.cancel')" severity="secondary" text @click="emit('cancel')" />
      <Button
        :label="t('userInterface.joinServerView.joinButton')"
        :loading="submitting"
        :disabled="!can_submit"
        :style="{ background: 'var(--gradient-primary)' }"
        @click="submit"
      />
    </div>
  </div>
</template>
