<script setup lang="ts">
import { computed } from 'vue'

/**
 * Composant pour afficher un badge d'icône de métadonnée avec fond coloré
 */

type MetadataType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE'

interface Props {
    type: MetadataType | string
    size?: 'sm' | 'md' | 'lg'
    rounded?: 'md' | 'lg' | 'xl' | '2xl'
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    rounded: 'xl'
})

const iconClass = computed(() => {
    switch (props.type.toUpperCase()) {
        case 'NUMBER':
            return 'pi pi-hashtag'
        case 'BOOLEAN':
            return 'pi pi-check-square'
        case 'DATE':
            return 'pi pi-calendar'
        case 'STRING':
        default:
            return 'pi pi-align-left'
    }
})

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                container: 'w-8 h-8',
                icon: 'text-sm'
            }
        case 'md':
            return {
                container: 'w-10 h-10',
                icon: 'text-lg'
            }
        case 'lg':
            return {
                container: 'w-12 h-12',
                icon: 'text-xl'
            }
        default:
            return {
                container: 'w-10 h-10',
                icon: 'text-lg'
            }
    }
})

const roundedClass = computed(() => {
    switch (props.rounded) {
        case 'md':
            return 'rounded-md'
        case 'lg':
            return 'rounded-lg'
        case 'xl':
            return 'rounded-xl'
        case '2xl':
            return 'rounded-2xl'
        default:
            return 'rounded-xl'
    }
})

const colorClasses = computed(() => {
    switch (props.type.toUpperCase()) {
        case 'NUMBER':
            return {
                bg: 'bg-blue-50',
                text: 'text-blue-600'
            }
        case 'BOOLEAN':
            return {
                bg: 'bg-green-50',
                text: 'text-green-600'
            }
        case 'DATE':
            return {
                bg: 'bg-purple-50',
                text: 'text-purple-600'
            }
        case 'STRING':
        default:
            return {
                bg: 'bg-primary-50',
                text: 'text-primary-600'
            }
    }
})
</script>

<template>
    <div
        :class="[
            sizeClasses.container,
            roundedClass,
            colorClasses.bg,
            colorClasses.text,
            'flex items-center justify-center shrink-0'
        ]"
    >
        <i :class="[iconClass, sizeClasses.icon]"></i>
    </div>
</template>
