<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { session } from '@/composables/auth/utils/authState'
import type { IServer } from '../../../../shared/contracts/interfaces/entities/server.interfaces'

const route = useRoute()
const serverId = ref<string>(route.params.id as string)
const server = ref<IServer | null>(null)

async function refresh(): Promise<void> {
  serverId.value = route.params.id as string
  const token = session.value?.access_token || ''
  if (!token || !serverId.value) {
    server.value = null
    return
  }
  try {
    const res = await window.api.server.getDetails(serverId.value, token)
    server.value = res.data ?? null
    console.log('server details', server.value)
  } catch {
    server.value = null
  }
}

onMounted(() => {
  refresh()
})

watch(
  () => route.params.id,
  () => {
    refresh()
  }
)
</script>

<template>
  <div>
    <h1>Server {{ serverId }}</h1>
    <p v-if="server">{{ server.name }}</p>
  </div>
</template>
