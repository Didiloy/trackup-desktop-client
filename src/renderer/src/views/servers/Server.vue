<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import TransitionWrapper from '@/components/common/TransitionWrapper.vue'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'

const route = useRoute()
const server_id = ref<string>(route.params.id as string)
const server_store = useServerStore()
const { getServerDetails } = useServerCRUD()
const { listMembers } = useMemberCRUD()

async function getServerInfos(): Promise<void> {
  server_store.resetState()

  const resServerDetails = await getServerDetails(server_id.value)
  if (resServerDetails.error) return
  server_store.setServer(resServerDetails.data ?? null)

  const resServerMembers = await listMembers(server_id.value)
  if (resServerMembers.error) return
  server_store.setMembers(resServerMembers.data?.data ?? [])
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
      <div v-if="server_store.hasServer" :key="server_id">
        <h1>Server {{ server_store.getPublicId }}</h1>
        <p>
          {{ server_store.getName }}
          {{ server_store.getInvitationCode }}
          {{ server_store.getMembers?.length }} members
          {{ server_store.getDescription }}
          {{ server_store.getInvitationCodeExpDate }}
          {{ server_store.getServerTypePublicId}}
        </p>
      </div>
    </TransitionWrapper>
  </div>
</template>
