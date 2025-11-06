<script setup lang="ts">
import { computed } from 'vue'
import { getInitials, type IInitialsOptions } from '@/utils'

type SizeProp = 'small' | 'normal' | 'large' | 'xlarge' | number

type ShapeProp = 'square' | 'rounded' | 'circle'

const props = withDefaults(
  defineProps<{
    imageUrl?: string | null
    icon?: string | null
    label?: string | null
    initialsOptions?: IInitialsOptions
    size?: SizeProp
    shape?: ShapeProp
    hoverScale?: boolean
    bgVariant?: 'transparent' | 'soft' | 'solid'
    disabled?: boolean
    buttonType?: 'button' | 'submit' | 'reset'
    title?: string
    ariaLabel?: string
    // class overrides
    buttonClass?: string
    avatarClass?: string
  }>(),
  {
    initialsOptions: () => ({ maxInitials: 2, mode: 'all' }),
    size: 'normal',
    shape: 'rounded',
    hoverScale: true,
    bgVariant: 'transparent',
    buttonType: 'button'
  }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const computedInitials = computed(() => {
  const label = props.label?.trim()
  if (!label) return null
  try {
    return getInitials(label, props.initialsOptions)
  } catch {
    return label.slice(0, 2).toUpperCase()
  }
})

const dimensionClass = computed(() => {
  if (typeof props.size === 'number') return null
  switch (props.size) {
    case 'small':
      return 'w-10 h-10'
    case 'large':
      return 'w-14 h-14'
    case 'xlarge':
      return 'w-16 h-16'
    default:
      return 'w-12 h-12'
  }
})

const dimensionStyle = computed(() => {
  if (typeof props.size === 'number') {
    const px = `${props.size}px`
    return { width: px, height: px }
  }
  return undefined
})

const shapeClass = computed(() => {
  if (props.shape === 'circle') return 'rounded-full'
  if (props.shape === 'square') return 'rounded-none'
  return 'rounded-2xl'
})

const bgClass = computed(() => {
  if (props.imageUrl) return 'bg-transparent'
  switch (props.bgVariant) {
    case 'soft':
      return 'bg-surface-300 hover:bg-primary-300'
    case 'solid':
      return 'bg-primary-300 hover:bg-primary-400'
    default:
      return ''
  }
})

const hoverScaleClass = computed(() => (props.hoverScale ? 'hover:scale-110' : ''))

const avatarSizeProp = computed(() => {
  if (typeof props.size === 'string' && (props.size === 'large' || props.size === 'xlarge')) {
    return props.size
  }
  return undefined
})

const ariaLabel = computed(() => props.ariaLabel || props.title || props.label || undefined)

// Determine content mode
const isImage = computed(() => !!props.imageUrl)

// Default contrast backgrounds only when no image
const wrapperContrastClass = computed(() => {
  if (isImage.value) return null
  if (props.buttonClass) return null
  // apply only when no explicit bg variant
  return props.bgVariant === 'transparent' ? 'bg-surface-500' : null
})

const innerAvatarBgClass = computed(() => (isImage.value ? null : 'bg-surface-500'))

const onClick = (e: MouseEvent): void => {
  if (props.disabled) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  emit('click', e)
}
</script>

<template>
  <button
    v-tooltip.right="label || title || ''"
    :type="buttonType"
    :disabled="disabled"
    :aria-label="ariaLabel"
    class="avatar-button relative inline-flex items-center justify-center overflow-hidden transition-all duration-200 group cursor-pointer"
    :class="[
      dimensionClass,
      shapeClass,
      hoverScaleClass,
      bgClass,
      wrapperContrastClass,
      { 'is-disabled pointer-events-none opacity-60': disabled },
      buttonClass
    ]"
    :style="dimensionStyle"
    @click="onClick"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  >
    <Avatar
      v-if="imageUrl"
      :image="imageUrl!"
      :size="avatarSizeProp"
      :shape="shape === 'circle' ? 'circle' : 'square'"
      :class="[avatarClass, innerAvatarBgClass]"
    />
    <Avatar
      v-else-if="computedInitials"
      :label="computedInitials!"
      :size="avatarSizeProp"
      :shape="shape === 'circle' ? 'circle' : 'square'"
      :class="[avatarClass, innerAvatarBgClass]"
    />
    <Avatar
      v-else
      :icon="icon || 'pi pi-user'"
      :size="avatarSizeProp"
      :shape="shape === 'circle' ? 'circle' : 'square'"
      :class="[avatarClass, innerAvatarBgClass]"
    />

    <slot />
  </button>
</template>

<style scoped>
.avatar-button {
  padding: 2px;
  border: none;
}

.avatar-button :deep(.p-avatar) {
  width: 100% !important;
  height: 100% !important;
  border-radius: inherit;
  overflow: hidden;
  background: none;
}
</style>
