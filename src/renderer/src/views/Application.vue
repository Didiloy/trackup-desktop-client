<script setup lang="ts">
import ServersAside from '@/components/asides/ServersAside.vue'
import TransitionWrapper from '@/components/common/TransitionWrapper.vue'
import MembersAside from '@/components/asides/MembersAside.vue'
import { useServerSidebar } from '@/composables/servers/useServerSidebar'
import { useRoute } from 'vue-router'
import { watch } from 'vue'
import { useServerMembersStore } from '@/stores/server_members'

const { visible, hide } = useServerSidebar()
const route = useRoute()
const serverMembers = useServerMembersStore()

watch(
  () => route.name,
  (name) => {
    if (name !== 'Server') {
      serverMembers.clear()
      hide()
    }
  }
)
</script>

<template>
  <div
    class="w-full h-full flex flex-row justify-between items-center gap-1 pr-2 pb-2 bg-surface-200"
  >
    <ServersAside />
    <main class="grow bg-surface-50 h-full w-full rounded-r-xl flex flex-row overflow-hidden">
      <router-view v-slot="{ Component }">
        <TransitionWrapper name="fade">
          <component :is="Component" />
        </TransitionWrapper>
      </router-view>
    </main>
    <MembersAside v-if="visible" />
  </div>
</template>

<style scoped></style>
