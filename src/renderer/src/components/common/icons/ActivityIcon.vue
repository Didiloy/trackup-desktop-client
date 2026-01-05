<script setup lang="ts">
interface Props {
    /** Classes CSS supplémentaires à appliquer */
    class?: string
}

defineProps<Props>()
</script>

<template>
    <i :class="['pi pi-bell', $props.class]"></i>
</template>
