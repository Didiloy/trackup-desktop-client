<script setup lang="ts">
import type { Provider } from '@supabase/supabase-js'

const props = defineProps<{
  provider: Provider
  label: string
  icon?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', provider: Provider): void
}>()

function onClick() {
  // Forward provider so parent can handle the sign-in logic
  // @ts-ignore - props inferred above
  emit('click', props.provider)
}
</script>

<template>
  <button
    class="w-full h-11 px-3 rounded-lg bg-surface-100 hover:bg-surface-200 text-gray-900 flex items-center justify-center gap-2 border border-surface-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    :disabled="disabled"
    @click="onClick"
  >
    <i v-if="icon" :class="['pi', icon]"></i>
    <span class="font-medium">{{ label }}</span>
  </button>
  
</template>

<style scoped>
</style>


