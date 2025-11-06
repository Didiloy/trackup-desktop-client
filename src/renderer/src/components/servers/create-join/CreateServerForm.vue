<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { session } from '@/composables/auth/utils/authState'
import type {
  IServer,
  ICreateServerRequest
} from '../../../../../shared/contracts/interfaces/entities/server.interfaces'
import type { IServerType } from '../../../../../shared/contracts/interfaces/entities/server-type.interfaces'
import { useI18n } from 'vue-i18n'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'

const i18n = useI18n()

const emit = defineEmits<{
  (e: 'created', server: IServer): void
  (e: 'cancel'): void
}>()

const name = ref('')
const description = ref('')
const selected_type = ref<IServerType | null>(null)
const server_types = ref<IServerType[]>([])
const logo = ref<string>('')

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

function updateLogo(newLogo: string): void {
  logo.value = newLogo
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
      logo: logo.value || undefined
    }
    const res = await window.api.server.create(payload, token)
    const created: IServer | undefined = res.data as IServer | undefined
    if (!created) throw new Error(res.error || 'Failed to create-join servers')
    emit('created', created)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create-join servers'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadServerTypes()
})

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
</script>

<template>
  <div class="flex flex-col gap-2 select-none">
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-3">
        <label class="text-sm text-surface-500">{{ $t('common.logo') }}</label>
        <EntityLogoHandling
          :logo="logo"
          :initial="name"
          :entity-name="name"
          :display-edit-button="true"
          @update-logo="updateLogo"
        />
      </div>

      <label class="text-sm text-surface-500">{{ $t('common.name') }}</label>
      <InputText
        v-model="name"
        :placeholder="i18n.t('userInterface.createServerView.placeholder.name')"
        class="w-full"
        :pt="{
          root: {
            style: background_style
          }
        }"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm text-surface-500">{{ $t('common.type') }}</label>
      <Select
        v-model="selected_type"
        :options="server_types"
        option-label="name"
        :loading="loading_types"
        :placeholder="i18n.t('userInterface.createServerView.placeholder.type')"
        class="w-full"
        append-to="self"
        :pt="{
          root: { style: background_style },
          list: { class: 'bg-surface-100' },
          label: { style: background_style },
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
        auto-resize
        :placeholder="i18n.t('userInterface.createServerView.placeholder.description')"
        :pt="{
          root: {
            style: background_style
          }
        }"
      />
    </div>

    <div v-if="error" class="text-sm text-red-500">{{ error }}</div>

    <div class="flex justify-end gap-2 pt-2">
      <Button :label="i18n.t('common.cancel')" severity="secondary" text @click="emit('cancel')" />
      <Button
        :label="i18n.t('actions.create-join')"
        :loading="submitting"
        :disabled="!can_submit"
        :style="{ background: 'var(--gradient-primary)' }"
        @click="submit"
      />
    </div>
  </div>
</template>
