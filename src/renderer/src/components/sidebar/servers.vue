<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ServerItem from './server-item.vue'
import { user, session } from '@/composables/auth/utils/authState'
import type { IUserServer } from '../../../../shared/contracts/interfaces/entities/user.interfaces'
import { useUserStore } from '@/stores/user'

const servers = ref<IUserServer[]>([])
const user_store = useUserStore()

const avatarUrl = computed<string | null>(() => {
  return user_store.getAvatar || null
})

onMounted(async () => {
  const token = session.value?.access_token || ''
  if (!token) return
  try {
    const res = await window.api.user.getMyServers(token)
    servers.value = res.data ?? []
    console.log(servers.value)
  } catch {
    servers.value = []
  }
})
</script>
<template>
  <div
    class="flex flex-col items-center w-16 h-full my-2 bg-surface-200 rounded-lg ml-1"
  >
    <div class="flex flex-col items-center gap-2 py-2 shrink-0">
      <ServerItem :image-url="avatarUrl" :label="user?.email || 'Me'" />
      <div class="w-8 h-px bg-surface-400 my-1"></div>
    </div>

    <div class="flex-1 w-full overflow-y-auto">
      <div class="flex flex-col items-center gap-2 pb-2">
        <template v-for="s in servers" :key="s.public_id">
          <ServerItem :image-url="s.logo" :label="s.name" />
        </template>
      </div>
    </div>
  </div>
</template>
