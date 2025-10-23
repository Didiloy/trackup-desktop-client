<script setup lang="ts">
import Topbar from '@/components/layout/topbar.vue'
import Sidebar from '@/components/layout/sidebar.vue'
</script>

<template>
  <div
    class="flex flex-col items-center justify-start h-screen w-screen bg-linear-to-br from-surface-200 to-surface-500"
  >
    <Topbar />
    <div
      class="w-full h-full flex flex-row justify-between items-center px-2 pb-2 bg-linear-to-br from-surface-200 via-surface-200 to-surface-600"
    >
      <Sidebar />
      <div class="grow bg-surface-50 h-full w-full rounded">
        <RouterView />
      </div>
    </div>
  </div>
</template>
