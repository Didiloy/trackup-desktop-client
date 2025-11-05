<script setup lang="ts">
import ServerItem from '../../sidebar/server-item.vue'
import type { IUserServer } from '../../../../../shared/contracts/interfaces/entities/user.interfaces'

interface Props {
  servers: IUserServer[]
  activeServerId?: string
  createServerLabel: string
}

interface Emits {
  (e: 'server-click', id: string): void
  (e: 'create-click'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="flex-1 w-full overflow-y-auto">
    <div class="flex flex-col items-center gap-2 pb-2">
      <template v-for="server in servers" :key="server.public_id">
        <ServerItem
          :image-url="server.logo"
          :label="server.name"
          :active="activeServerId === server.public_id"
          @click="emit('server-click', server.public_id)"
        />
      </template>
      <ServerItem icon="pi pi-plus" :label="createServerLabel" @click="emit('create-click')" />
    </div>
  </div>
</template>
