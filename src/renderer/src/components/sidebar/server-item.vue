<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  imageUrl?: string | null
  icon?: string | null
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

const shapeClass = computed(() => (props.active ? 'rounded-xl' : 'rounded-2xl'))
const wrapperBgClass = computed(() => {
  return props.active ? 'bg-surface-100' : ''
})
const btnBgClass = computed(() => {
  const hover_scale = 'hover:scale-110'
  if (props.imageUrl) return 'bg-transparent ' + hover_scale
  if (props.icon) return 'bg-surface-300 hover:bg-primary-300 click:bg-primary-400 ' + hover_scale
  return ''
})
</script>

<template>
  <div class="w-full flex items-center justify-center py-1 relative" :class="wrapperBgClass">
    <button
      type="button"
      :title="label"
      class="relative z-10 flex items-center justify-center w-12 h-12 overflow-hidden transition-all duration-200 group"
      :class="[shapeClass, btnBgClass]"
      @click="emit('click')"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="label"
        class="w-full h-full object-cover not-draggable"
      />
      <i v-else-if="icon" :class="props.icon"></i>
      <span v-else class="text-sm font-semibold text-surface-700">
        {{ initials }}
      </span>
    </button>
  </div>
</template>
