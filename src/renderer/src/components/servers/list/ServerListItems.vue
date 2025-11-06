<script setup lang="ts">
import Server from '../Server.vue'
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
  <div class="flex-1 w-full scroll-y-hide mb-8">
    <div class="flex flex-col items-center gap-2 pb-2">
      <template v-for="server in servers" :key="server.public_id">
        <Server
          :image-url="server.logo"
          :label="server.name"
          :active="activeServerId === server.public_id"
          @click="emit('server-click', server.public_id)"
        />
      </template>
      <Server icon="pi pi-plus" :label="createServerLabel" @click="emit('create-join-click')" />
    </div>
  </div>
</template>

<style scoped>
.scroll-y-hide {
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.scroll-y-hide::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
