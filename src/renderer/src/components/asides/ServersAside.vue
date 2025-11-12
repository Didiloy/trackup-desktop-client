<script setup lang="ts">
import ServersList from '@/components/servers/list/ServersList.vue'
import ServersActionsList from '@/components/servers/ServersActionsList.vue'
import ProfileButton from '@/components/ProfileButton.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import TransitionWrapper from '@/components/common/TransitionWrapper.vue'

const route = useRoute()
const hasServerActions = computed(
  () => typeof route.name === 'string' && route.name.startsWith('Server')
)
</script>

<template>
  <aside
    id="ServersAside"
    class="flex flex-row items-center justify-start h-full bg-surface-200 transition-all duration-300 ease-in-out overflow-hidden select-none"
    :class="[hasServerActions ? 'w-64 min-w-64' : 'w-16 min-w-16']"
  >
    <div class="flex flex-col items-center w-16 min-w-16 h-full my-2 bg-surface-200 rounded-lg">
      <div class="flex flex-col items-center gap-2 py-2 shrink-0 mx-2">
        <ProfileButton />
        <div class="w-8 h-px bg-surface-400 my-1"></div>
      </div>
      <ServersList />
    </div>
    <TransitionWrapper name="fade">
      <ServersActionsList v-if="hasServerActions" key="server-actions" />
    </TransitionWrapper>
  </aside>
</template>
