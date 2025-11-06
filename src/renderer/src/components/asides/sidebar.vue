<script setup lang="ts">
import ServersList from '@/components/servers/list/ServersList.vue'
import ServersActionsList from '@/components/servers/ServersActionsList.vue'
import ProfileButton from '@/components/ProfileButton.vue'
import { useUserStore } from '@/stores/user'

const user_store = useUserStore()
</script>

<template>
  <div class="flex flex-row items-center justify-start w-64 h-full rounded-lg bg-surface-200">
    <div class="flex flex-col items-center w-16 h-full my-2 bg-surface-200 rounded-lg">
      <div class="flex flex-col items-center gap-2 py-2 shrink-0 mx-2">
        <ProfileButton :image-url="user_store.getAvatar" :label="user_store.getUsername || 'Me'" />
        <div class="w-8 h-px bg-surface-400 my-1"></div>
      </div>
      <ServersList />
    </div>
    <ServersActionsList />
  </div>
</template>
