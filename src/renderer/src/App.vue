<script setup lang="ts">
import Topbar from '@/components/layout/topbar.vue'
import Sidebar from '@/components/layout/sidebar.vue'
</script>

<template>
  <div
    class="flex flex-col items-center justify-start h-screen w-screen p-2 bg-linear-to-br from-surface-100 to-surface-200"
  >
    <Topbar />
    <div
      class="w-full h-full flex flex-row justify-between items-center gap-4 pt-2 bg-linear-to-br from-surface-100 to-surface-200"
    >
      <Sidebar />
      <div class="grow bg-surface-50 h-full w-full rounded-xl">
        <RouterView />
      </div>
    </div>
  </div>
</template>
