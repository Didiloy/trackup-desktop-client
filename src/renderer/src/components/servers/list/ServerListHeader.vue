<script setup lang="ts">
import ProfileButton from '../../sidebar/profile-button.vue'

interface Props {
  imageUrl?: string
  label?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-center gap-2 py-2 shrink-0 mx-2">
    <ProfileButton :image-url="imageUrl" :label="label || 'Me'" />
    <div class="w-8 h-px bg-surface-400 my-1"></div>
  </div>
</template>
