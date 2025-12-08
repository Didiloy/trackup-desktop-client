<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useServerList } from '@/composables/servers/useServerList'
import { useServerNavigation } from '@/composables/servers/useServerNavigation'
import ServersListItems from './ServersListItems.vue'
import ServerCreateJoinDialog from '../create-join/ServerCreateJoinDialog.vue'
import type { IServer } from '@shared/contracts/interfaces/entities/server.interfaces'

// Server list management
const { fetchServers, handleServerCreated } = useServerList()

// Navigation
const { navigateToServer } = useServerNavigation()

// Dialog state
const show_action_dialog = ref(false)

// Lifecycle
onMounted(async () => {
    await fetchServers()
})

// Event handlers
function handleOpenActionDialog(): void {
    show_action_dialog.value = true
}

async function handleServerAction(server: IServer): Promise<void> {
    show_action_dialog.value = false
    await handleServerCreated(server)
}
</script>
<template>
    <ServersListItems
        @server-click="navigateToServer"
        @server-action-click="handleOpenActionDialog"
    />

    <ServerCreateJoinDialog v-model="show_action_dialog" @server-action="handleServerAction" />
</template>
