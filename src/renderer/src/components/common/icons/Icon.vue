<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
    /** L'icône à afficher - soit une classe PrimeIcon (string) soit un composant Vue */
    icon: string | Component | undefined | null
    /** Classes CSS supplémentaires à appliquer */
    class?: string
}

const props = defineProps<Props>()
</script>

<template>
    <!-- Si l'icône est une string (classe PrimeIcon) -->
    <i v-if="typeof props.icon === 'string'" :class="[props.icon, props.class]"></i>

    <!-- Si l'icône est un composant Vue -->
    <component :is="props.icon" v-else-if="props.icon" :class="props.class" />
</template>
