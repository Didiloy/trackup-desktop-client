<script setup lang="ts">
import AppDialog from '@/components/common/AppDialog.vue'
import CreateServerForm from '@/components/servers/create/CreateServerForm.vue'
import type { IServer } from '../../../../../shared/contracts/interfaces/entities/server.interfaces'

interface Props {
  modelValue: boolean
  title: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', server: IServer): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleCreated(server: IServer): void {
  emit('created', server)
}

function handleCancel(): void {
  emit('update:modelValue', false)
}
</script>

<template>
  <AppDialog
    :model-value="modelValue"
    :style-class="'w-[560px] max-w-[92vw] rounded-xl'"
    :content-class="'p-0 bg-surface-50'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2 p-3 select-none">
        <i class="pi pi-plus-circle text-primary-500"></i>
        <span class="font-semibold text-surface-900">{{ title }}</span>
      </div>
    </template>
    <div class="p-4">
      <CreateServerForm @created="handleCreated" @cancel="handleCancel" />
    </div>
  </AppDialog>
</template>
