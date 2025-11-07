<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerList } from '@/composables/servers/useServerList'
import { useServerNavigation } from '@/composables/servers/useServerNavigation'
import ServersListItems from './ServersListItems.vue'
import ServerCreateJoinDialog from '../create-join/ServerCreateJoinDialog.vue'
import type { IServer } from '../../../../../shared/contracts/interfaces/entities/server.interfaces'

const i18n = useI18n()

// Server list management
const { servers, fetchServers, handleServerCreated } = useServerList()

// Navigation
const { currentServerId, navigateToServer } = useServerNavigation(servers)

// Dialog state
const showActionDialog = ref(false)

// Lifecycle
onMounted(async () => {
  await fetchServers()
})

// Event handlers
function handleOpenActionDialog(): void {
  showActionDialog.value = true
}

async function handleServerAction(server: IServer): Promise<void> {
  showActionDialog.value = false
  await handleServerCreated(server)
}
</script>
<template>
  <ServersListItems
    :servers="servers"
    :active-server-id="currentServerId"
    :create-server-label="i18n.t('userInterface.serverActionView.title')"
    @server-click="navigateToServer"
    @server-action-click="handleOpenActionDialog"
  />

  <ServerCreateJoinDialog v-model="showActionDialog" @server-action="handleServerAction" />
</template>
