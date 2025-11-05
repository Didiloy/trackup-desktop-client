<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { session } from '@/composables/auth/utils/authState'
import type {
  IServer,
  ICreateServerRequest
} from '../../../../../shared/contracts/interfaces/entities/server.interfaces'
import type { IServerType } from '../../../../../shared/contracts/interfaces/entities/server-type.interfaces'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const emit = defineEmits<{
  (e: 'created', server: IServer): void
  (e: 'cancel'): void
}>()

const name = ref('')
const description = ref('')
const selected_type = ref<IServerType | null>(null)
const server_types = ref<IServerType[]>([])
const logo_base_64 = ref<string | null>(null)
const logo_url = ref<string>('')

const submitting = ref(false)
const loading_types = ref(false)
const error = ref<string | null>(null)

const can_submit = computed(() => {
  return !submitting.value && !!name.value.trim() && !!selected_type.value
})

async function loadServerTypes(): Promise<void> {
  const token = session.value?.access_token || ''
  if (!token) return
  loading_types.value = true
  try {
    const res = await window.api.serverType.getAll(token)
    server_types.value = res.data ?? []
  } catch (e) {
    error.value = 'Failed to load servers types'
  } finally {
    loading_types.value = false
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string) || '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function onLogoSelect(event: { files: File[] }): Promise<void> {
  const file = event?.files?.[0]
  if (!file) return
  logo_base_64.value = await fileToBase64(file)
}

function clearLogo(): void {
  logo_base_64.value = null
  logo_url.value = ''
}

async function submit(): Promise<void> {
  if (!can_submit.value) return
  submitting.value = true
  error.value = null
  const token = session.value?.access_token || ''
  try {
    const payload: ICreateServerRequest = {
      name: name.value.trim(),
      type_public_id: selected_type.value!.public_id,
      description: description.value.trim() || undefined,
      logo: logo_base_64.value || logo_url.value.trim() || undefined
    }
    const res = await window.api.server.create(payload, token)
    const created: IServer | undefined = res.data as IServer | undefined
    if (!created) throw new Error(res.error || 'Failed to create servers')
    emit('created', created)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create servers'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadServerTypes()
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-2">
      <label class="text-sm text-surface-500">{{ $t('common.name') }}</label>
      <InputText
        v-model="name"
        :placeholder="i18n.t('userInterface.createServerView.placeholder.name')"
        class="w-full"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm text-surface-500">{{ $t('common.type') }}</label>
      <Select
        v-model="selected_type"
        :options="server_types"
        optionLabel="name"
        :loading="loading_types"
        :placeholder="i18n.t('userInterface.createServerView.placeholder.type')"
        class="w-full"
        appendTo="self"
        :pt="{
          panel: { class: 'bg-surface-100 border border-surface-300 rounded-md shadow-md' },
          list: { class: 'bg-surface-100' },
          item: { class: 'text-surface-900 dark:text-surface-0' },
          itemLabel: { class: 'text-surface-900 dark:text-surface-0' }
        }"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm text-surface-500">{{ $t('common.description') }}</label>
      <Textarea
        v-model="description"
        rows="2"
        autoResize
        :placeholder="i18n.t('userInterface.createServerView.placeholder.description')"
      />
    </div>

    <Divider />

    <div class="flex flex-col gap-3">
      <label class="text-sm text-surface-500">{{ $t('common.logo') }}</label>
      <div class="flex items-center gap-3">
        <FileUpload
          mode="basic"
          customUpload
          :chooseLabel="i18n.t('common.choose')"
          :auto="false"
          accept="image/*"
          @select="onLogoSelect"
        />
        <Button
          v-if="logo_base_64 || logo_url"
          :label="i18n.t('common.clear')"
          severity="secondary"
          text
          @click="clearLogo"
        />
        <div v-if="logo_base_64 || logo_url" class="mt-2">
          <img
            :src="logo_base_64 || logo_url"
            alt="Logo preview"
            class="h-20 w-20 object-cover rounded-md"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-surface-500">{{ $t('common.or') }}</span>
        <InputText v-model="logo_url" placeholder="https://example.com/logo.png" class="w-full" />
      </div>
    </div>

    <div v-if="error" class="text-sm text-red-500">{{ error }}</div>

    <div class="flex justify-end gap-2 pt-2">
      <Button :label="i18n.t('common.cancel')" severity="secondary" text @click="emit('cancel')" />
      <Button
        :label="i18n.t('actions.create')"
        :loading="submitting"
        :disabled="!can_submit"
        @click="submit"
        :style="{ background: 'var(--gradient-primary)' }"
      />
    </div>
  </div>
</template>
