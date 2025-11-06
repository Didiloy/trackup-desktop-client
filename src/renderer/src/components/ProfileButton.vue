<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getInitials } from '@/utils'

interface Props {
  imageUrl?: string | null
  label: string
}

const route = useRoute()

defineProps<Props>()

const shapeClass = computed(() => (route.path === '/' ? 'active' : ''))
</script>

<template>
  <button
    :class="shapeClass"
    class="avatar-container rounded-2xl cursor-pointer transition-all duration-200 hover:scale-110"
    @click="$router.push({ name: 'Home' })"
  >
    <Avatar v-if="imageUrl" :image="imageUrl" size="large" />

    <Avatar v-else :label="getInitials(label, { maxInitials: 2, mode: 'all' })" size="large" />
  </button>
</template>
<style scoped>
.avatar-container {
  width: 48px;
  height: 48px;
  padding: 2px;
  background: none;
  border: none;
}
.avatar-container.active {
  --border-angle: 0deg;
  animation: border-angle-rotate 2s infinite linear;
  background: conic-gradient(
    from var(--border-angle),
    oklch(100% 0.37 0),
    oklch(100% 0.37 45),
    oklch(100% 0.37 90),
    oklch(100% 0.37 135),
    oklch(100% 0.37 180),
    oklch(100% 0.37 225),
    oklch(100% 0.37 270),
    oklch(100% 0.37 315),
    oklch(100% 0.37 360)
  );
}

.avatar-container :deep(.p-avatar) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 0.75rem;
  overflow: hidden;
}

@keyframes border-angle-rotate {
  from {
    --border-angle: 0deg;
  }
  to {
    --border-angle: 360deg;
  }
}

@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
</style>
