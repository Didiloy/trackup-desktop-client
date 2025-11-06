<script setup lang="ts">
import { computed } from 'vue'
import AvatarButton from '@/components/common/AvatarButton.vue'

interface Props {
  imageUrl?: string | null
  icon?: string | null
  label: string
  active?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'click'): void }>()

const wrapperBgClass = computed(() => (props.active ? 'bg-surface-100' : ''))

// Rounding class handled via buttonClass now
const buttonClass = computed(() => {
  const classes = ['hover:scale-110']
  classes.push(props.active ? 'rounded-xl' : 'rounded-2xl')
  if (!props.imageUrl) {
    classes.push('bg-surface-300', 'hover:bg-primary-300', 'click:bg-primary-400')
  }
  return classes.join(' ')
})

const handleClick = (): void => emit('click')
</script>

<template>
  <div class="w-full flex items-center justify-center py-1 relative" :class="wrapperBgClass">
    <AvatarButton
      :image-url="imageUrl"
      :icon="icon"
      :label="!imageUrl && !icon ? label : undefined"
      size="normal"
      shape="rounded"
      :title="label"
      :button-class="buttonClass"
      @click="handleClick"
    />
  </div>
</template>

