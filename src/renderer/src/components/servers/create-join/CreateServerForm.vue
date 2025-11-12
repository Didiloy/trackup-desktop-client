<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type {
  IServer,
  ICreateServerRequest
} from '@shared/contracts/interfaces/entities/server.interfaces'
import type { IServerType } from '@shared/contracts/interfaces/entities/server-type.interfaces'
import { useI18n } from 'vue-i18n'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import EntityBannerHandling from '@/components/common/EntityBannerHandling.vue'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { useServerTypeCRUD } from '@/composables/servers/useServerTypeCRUD'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'created', server: IServer | undefined): void
  (e: 'cancel'): void
}>()

const name = ref('')
const description = ref('')
const selected_type = ref<IServerType | null>(null)
const server_types = ref<IServerType[]>([])
const logo = ref<string>('')
const banner = ref<string>('')

const submitting = ref(false)
const loading_types = ref(false)
const error = ref<string | null>(null)
const { createServer } = useServerCRUD()
const { getAllServerTypes } = useServerTypeCRUD()

const can_submit = computed(() => {
  return !submitting.value && !!name.value.trim() && !!selected_type.value
})

async function loadServerTypes(): Promise<void> {
  loading_types.value = true
  const res = await getAllServerTypes()
  if (res.error) {
    error.value = 'Failed to load servers types'
    loading_types.value = false
    return
  }
  server_types.value = res.data ?? []
  loading_types.value = false
}

function updateLogo(newLogo: string): void {
  logo.value = newLogo
}

function updateBanner(newBanner: string): void {
  banner.value = newBanner
}

async function createNewServer(): Promise<void> {
  if (!can_submit.value) return
  submitting.value = true
  error.value = null
  const payload: ICreateServerRequest = {
    name: name.value.trim(),
    type_public_id: selected_type.value!.public_id,
    description: description.value.trim(),
    logo: logo.value,
    banner: banner.value
  }
  const res = await createServer(payload)
  if (res.error) {
    error.value = res.error
    submitting.value = false
    return
  }
  const created: IServer | undefined = res.data
  emit('created', created)
  submitting.value = false
}

onMounted(async () => {
  await loadServerTypes()
})

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
</script>

<template>
  <div class="flex flex-col gap-2 select-none">
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-3">
        <label class="text-sm text-surface-500">{{ t('common.logo') }}</label>
        <EntityLogoHandling
          :logo="logo"
          :initial="name"
          :entity-name="name"
          :display-edit-button="true"
          @update-logo="updateLogo"
        />
      </div>

      <div class="flex flex-col gap-3">
        <label class="text-sm text-surface-500">{{ t('common.banner') }}</label>
        <EntityBannerHandling
          :banner="banner"
          :display-edit-button="true"
          @update-banner="updateBanner"
        />
      </div>

      <label class="text-sm text-surface-500">{{ t('common.name') }}</label>
      <InputText
        v-model="name"
        :placeholder="t('userInterface.createServerView.placeholder.name')"
        class="w-full"
        :pt="{
          root: {
            style: background_style
          }
        }"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm text-surface-500">{{ t('common.type') }}</label>
      <Select
        v-model="selected_type"
        :options="server_types"
        option-label="name"
        :loading="loading_types"
        :placeholder="t('userInterface.createServerView.placeholder.type')"
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
      <label class="text-sm text-surface-500">{{ t('common.description') }}</label>
      <Textarea
        v-model="description"
        rows="2"
        auto-resize
        :placeholder="t('userInterface.createServerView.placeholder.description')"
        :pt="{
          root: {
            style: background_style
          }
        }"
      />
    </div>

    <div v-if="error" class="text-sm text-red-500">{{ error }}</div>

    <div class="flex justify-end gap-2 pt-2">
      <Button :label="t('common.cancel')" severity="secondary" text @click="emit('cancel')" />
      <Button
        :label="t('actions.create')"
        :loading="submitting"
        :disabled="!can_submit"
        :style="{ background: 'var(--gradient-primary)' }"
        @click="createNewServer"
      />
    </div>
  </div>
</template>
