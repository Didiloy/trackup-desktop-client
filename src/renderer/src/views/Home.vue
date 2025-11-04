<script setup lang="ts">
import Versions from '@/components/Versions.vue'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuth } from '@/composables/auth/useAuth'

const ipcHandle = (): void => window.api.app.ping()
const user_store = useUserStore()
const { signOut } = useAuth()

onMounted(() => {
  console.log('Home component mounted')
  console.log('User Store State:', user_store.$state)
  console.log('User Store getUsername:', user_store.getUsername)
  console.log('User Store getAvatar:', user_store.getAvatar)
  console.log('User Store getId:', user_store.getId)
  console.log('User Store getEmail:', user_store.getEmail)
  console.log('User Store getAccessToken:', user_store.getAccessToken)
})
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center">
    <div class="creator">Powered by electron-vite</div>
    <div class="text">
      Build an Electron app with
      <span class="vue">Vue</span>
      and
      <span class="ts">TypeScript</span>
    </div>
    <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
    <div class="actions">
      <div class="action">
        <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
      </div>
      <div class="action">
        <Button
          label="Send IPC"
          class="text-white border-0 px-4 py-2 rounded-lg transition hover:opacity-90"
          :style="{ background: 'var(--gradient-primary)' }"
          @click="ipcHandle"
        />
        <Button label="signout" @click="signOut"></Button>
      </div>
    </div>
    <Versions />
  </div>
</template>
