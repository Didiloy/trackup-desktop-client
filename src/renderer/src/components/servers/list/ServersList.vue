<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { useServerList } from '@/composables/servers/useServerList'
import { useServerNavigation } from '@/composables/servers/useServerNavigation'
import ServerListHeader from './ServerListHeader.vue'
import ServerListItems from './ServerListItems.vue'
import CreateServerDialog from '../create/CreateServerDialog.vue'
import type { IServer } from '../../../../../shared/contracts/interfaces/entities/server.interfaces'

const i18n = useI18n()
const userStore = useUserStore()

// Server list management
const { servers, fetchServers, handleServerCreated } = useServerList()

// Navigation
const { currentServerId, navigateToServer } = useServerNavigation(servers)

// Dialog state
const showCreateDialog = ref(false)

// Computed properties
const createServerLabel = i18n.t('userInterface.createServerView.title')

// Lifecycle
onMounted(async () => {
  await fetchServers()
})

// Event handlers
function handleOpenCreate(): void {
  showCreateDialog.value = true
}

async function handleCreated(server: IServer): Promise<void> {
  showCreateDialog.value = false
  await handleServerCreated(server)
}
</script>
<template>
  <div class="flex flex-col items-center w-16 h-full my-2 bg-surface-200 rounded-lg">
    <ServerListHeader :image-url="userStore.getAvatar" :label="userStore.getEmail || undefined" />

    <ServerListItems
      :servers="servers"
      :active-server-id="currentServerId"
      :create-server-label="createServerLabel"
      @server-click="navigateToServer"
      @create-click="handleOpenCreate"
    />

    <CreateServerDialog
      v-model="showCreateDialog"
      :title="createServerLabel"
      @created="handleCreated"
    />
  </div>
</template>
