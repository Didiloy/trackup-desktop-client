<script setup lang="ts">
import ServersList from '@/components/servers/list/ServersList.vue'
import ServersActionsList from '@/components/servers/ServersActionsList.vue'
import ProfileButton from '@/components/ProfileButton.vue'
import { useUserStore } from '@/stores/user'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import TransitionWrapper from '@/components/common/TransitionWrapper.vue'

const user_store = useUserStore()
const route = useRoute()
const hasServerActions = computed(() => route.name === 'Server')
</script>

<template>
  <nav
    class="flex flex-row items-center justify-start h-full rounded-lg bg-surface-200 transition-all duration-300 ease-in-out overflow-hidden"
    :class="[hasServerActions ? 'w-64 min-w-64' : 'w-16 min-w-16']"
  >
    <div class="flex flex-col items-center w-16 min-w-16 h-full my-2 bg-surface-200 rounded-lg">
      <div class="flex flex-col items-center gap-2 py-2 shrink-0 mx-2">
        <ProfileButton :image-url="user_store.getAvatar" :label="user_store.getUsername || 'Me'" />
        <div class="w-8 h-px bg-surface-400 my-1"></div>
      </div>
      <ServersList />
    </div>
    <TransitionWrapper name="fade">
      <ServersActionsList v-if="hasServerActions" />
    </TransitionWrapper>
  </nav>
</template>
