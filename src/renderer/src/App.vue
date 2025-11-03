<script setup lang="ts">
import Topbar from '@/components/layout/topbar.vue'
import Sidebar from '@/components/layout/sidebar.vue'
import UpdateModal from '@/components/UpdateModal.vue'
import { useAuth } from '@/composables/auth/useAuth'
import { onMounted } from 'vue'
import Login from '@/views/Login.vue'

const { isAuthenticated, session } = useAuth()

onMounted(async () => {
  console.log(isAuthenticated.value)
  console.log(session.value)

  const accessToken = session.value?.access_token

  if (accessToken) {
    const result = await window.api.server.create(
      {
        name: 'My Server',
        type_public_id: 'srvtype_123',
        description: 'Test server'
      },
      accessToken
    )

    if (result.error) {
      console.error('Error creating server:', result.error)
    } else {
      console.log('Server created:', result.data)
    }
  }
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-start h-screen w-screen p-2 bg-linear-to-br from-surface-100 to-surface-200 overflow-hidden"
  >
    <Topbar />
    <UpdateModal />
    <template v-if="!isAuthenticated">
      <Login />
    </template>
    <template v-else>
      <div
        class="w-full h-full flex flex-row justify-between items-center gap-4 pt-2 bg-linear-to-br from-surface-100 to-surface-200"
      >
        <Sidebar />
        <div class="grow bg-surface-50 h-full w-full rounded-xl">
          <RouterView />
        </div>
      </div>
    </template>
  </div>
</template>
