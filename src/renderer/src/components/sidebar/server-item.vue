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

const shapeClass = computed(() => (props.active ? 'rounded-xl' : 'rounded-2xl'))
const wrapperBgClass = computed(() => (props.active ? 'bg-surface-100' : ''))
const btnBgClass = computed(() =>
  props.active ? 'bg-transparent' : 'bg-surface-200 hover:bg-surface-300'
)
</script>

<template>
  <div class="w-full flex items-center justify-center py-1" :class="wrapperBgClass">
    <button
      type="button"
      :title="label"
      class="relative flex items-center justify-center w-12 h-12 overflow-hidden transition-all duration-200 group"
      :class="[shapeClass, btnBgClass]"
      @click="emit('click')"
    >
      <img v-if="imageUrl" :src="imageUrl" :alt="label" class="w-full h-full object-cover" />
      <span v-else class="text-sm font-semibold text-surface-700">
        {{ initials }}
      </span>

      <span
        class="absolute -right-1.5 h-6 w-1.5 bg-primary-500 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </button>
  </div>
</template>
