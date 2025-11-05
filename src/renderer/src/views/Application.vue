<script setup lang="ts">
import Sidebar from '@/components/layout/sidebar.vue'
import TransitionWrapper from '@/components/common/TransitionWrapper.vue'
</script>

<template>
  <div
    class="w-full h-full flex flex-row justify-between items-center gap-1 pr-2 pb-2 bg-surface-200"
  >
    <Sidebar />
    <div class="grow bg-surface-50 h-full w-full rounded-r-xl">
      <router-view v-slot="{ Component }">
        <TransitionWrapper name="rotate-fade">
          <component :is="Component" />
        </TransitionWrapper>
      </router-view>
    </div>
  </div>
</template>

<style scoped></style>
