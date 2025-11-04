<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  imageUrl?: string | null
  label: string
  active?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'click'): void }>()

const initials = computed(() => {
  const trimmed = (props.label || '').trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
})

const shapeClass = computed(() => (props.active ? 'rounded-2xl active' : 'rounded-2xl'))
</script>

<template>
  <div class="w-full flex items-center justify-center py-1 relative">
      <button
      type="button"
      :title="label"
        class="relative z-10 flex items-center justify-center w-12 h-12 overflow-hidden transition-all duration-200 group"
        :class="shapeClass"
        @click="emit('click')"
        >
        <img v-if="imageUrl" :src="imageUrl" :alt="label" class="w-full h-full object-cover" />
        <span v-else class="text-sm font-semibold text-surface-700">
          {{ initials }}
        </span>
      </button>
  </div>
</template>
<style scoped>
.active {
  --border-angle: 0deg;
  animation: border-angle-rotate 2s infinite linear;
  border: 0.2rem solid transparent;
  position: relative;
    background: linear-gradient(white, white) padding-box,
      conic-gradient(
          from var(--border-angle),
          oklch(100% 100% 0deg),
          oklch(100% 100% 45deg),
          oklch(100% 100% 90deg),
          oklch(100% 100% 135deg),
          oklch(100% 100% 180deg),
          oklch(100% 100% 225deg),
          oklch(100% 100% 270deg),
          oklch(100% 100% 315deg),
          oklch(100% 100% 360deg)
        )
        border-box;


}

@keyframes border-angle-rotate {
  from { --border-angle: 0deg; }
  to { --border-angle: 360deg; }
}

@property --border-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
</style>