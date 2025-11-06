<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { IServer } from '../../../../shared/contracts/interfaces/entities/server.interfaces'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import TransitionWrapper from '@/components/common/TransitionWrapper.vue'

const route = useRoute()
const server_id = ref<string>(route.params.id as string)
const server = ref<IServer | null>(null)
const { getServerDetails } = useServerCRUD()

async function getServerInfos(): Promise<void> {
  const res = await getServerDetails(server_id.value)
  if (res.error) {
    server.value = null
    return
  }
  server.value = res.data ?? null
}

onMounted(() => {
  getServerInfos()
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId && typeof newId === 'string') {
      server_id.value = newId
      getServerInfos()
    }
  }
)
</script>

<template>
  <div>
    <TransitionWrapper name="slide-fade">
      <div :key="server_id">
        <h1>Server {{ server_id }}</h1>
        <p v-if="server">
          {{ server.name }}
          {{ server.invite_code }}
        </p>
      </div>
    </TransitionWrapper>
  </div>
</template>
