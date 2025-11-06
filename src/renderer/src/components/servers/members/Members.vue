<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MembersList from './MembersList.vue'
import { useServerMembersStore } from '@/stores/server_members'

const route = useRoute()
const store = useServerMembersStore()

function currentServerId(): string | null {
  return route.name === 'Server' ? (route.params.id as string) : null
}

onMounted(async () => {
  const id = currentServerId()
  if (id) {
    await store.fetch(id)
  }
})

watch(
  () => route.fullPath,
  async () => {
    const id = currentServerId()
    if (id) {
      await store.fetch(id)
    } else {
      store.clear()
    }
  }
)
</script>

<template>
  <aside class="w-64 min-w-64 h-full bg-surface-200 rounded-r-xl overflow-hidden">
    <div class="h-full flex flex-col">
      <div class="px-3 py-2 text-sm font-semibold text-surface-800 border-b border-surface-300">
        {{ $t('userInterface.serverSidebar.title') }}
      </div>
      <div class="flex-1 overflow-y-auto">
        <MembersList :members="store.members" :loading="store.loading" />
      </div>
    </div>
  </aside>
</template>
