<script setup lang="ts">
import ServersList from '@/components/servers/list/ServersList.vue'
import ServersActions from '@/components/sidebar/servers-actions.vue'
</script>
<template>
  <div class="flex flex-row items-center justify-start w-64 h-full rounded-lg bg-surface-200">
    <ServersList />
    <ServersActions />
  </div>
</template>
