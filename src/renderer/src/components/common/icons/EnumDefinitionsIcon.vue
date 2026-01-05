<script setup lang="ts">
interface Props {
    /** Classes CSS supplémentaires à appliquer */
    class?: string
}

defineProps<Props>()
</script>

<template>
    <i :class="['pi pi-list', $props.class]"></i>
</template>
