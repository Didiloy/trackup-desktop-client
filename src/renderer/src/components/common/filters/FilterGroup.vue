<script setup lang="ts">
interface Props {
    icon?: string
}

defineProps<Props>()
</script>

<template>
    <div class="flex items-center gap-2">
        <i v-if="icon" :class="[icon, 'text-surface-800']"></i>
        <slot />
    </div>
</template>
