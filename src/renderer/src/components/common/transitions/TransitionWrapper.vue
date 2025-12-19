<script setup lang="ts">
type TransitionName =
    | 'fade'
    | 'slide-fade'
    | 'slide-up'
    | 'slide-down'
    | 'slide-left'
    | 'slide-right'
    | 'zoom'
    | 'zoom-fade'
    | 'rotate-fade'
    | 'bounce'
    | 'flip'
    | 'scale-up'
    | 'scale-down'
    | 'rotate-3d'
    | 'swing'
    | 'shake'
    | 'roll'
    | 'panel-right'
    | 'panel-left'

interface Props {
    name?: TransitionName
    mode?: 'out-in' | 'in-out' | 'default'
    duration?: number // in seconds
}

const props = withDefaults(defineProps<Props>(), {
    name: 'fade',
    mode: 'out-in'
})
</script>

<template>
    <transition
        :name="props.name"
        :mode="props.mode === 'default' ? undefined : props.mode"
        :style="props.duration ? { '--transition-duration': `${props.duration}s` } : undefined"
    >
        <slot />
    </transition>
</template>

<style>
/* Fade */
.fade-enter-active,
.fade-leave-active {
    transition: opacity var(--transition-duration, 0.3s) ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Slide Fade */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition:
        opacity var(--transition-duration, 0.2s) ease,
        transform var(--transition-duration, 0.2s) ease;
}
.slide-fade-enter-from {
    opacity: 0;
    transform: translateX(20px);
}
.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(40px);
}

/* Slide Up */
.slide-up-enter-active,
.slide-up-leave-active {
    transition:
        opacity var(--transition-duration, 0.2s) ease,
        transform var(--transition-duration, 0.2s) ease;
}
.slide-up-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Slide Down */
.slide-down-enter-active,
.slide-down-leave-active {
    transition:
        opacity var(--transition-duration, 0.2s) ease,
        transform var(--transition-duration, 0.2s) ease;
}
.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* Slide Left */
.slide-left-enter-active,
.slide-left-leave-active {
    transition:
        opacity var(--transition-duration, 0.2s) ease,
        transform var(--transition-duration, 0.2s) ease;
}
.slide-left-enter-from {
    opacity: 0;
    transform: translateX(20px);
}
.slide-left-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

/* Slide Right */
.slide-right-enter-active,
.slide-right-leave-active {
    transition:
        opacity var(--transition-duration, 0.2s) ease,
        transform var(--transition-duration, 0.2s) ease;
}
.slide-right-enter-from {
    opacity: 0;
    transform: translateX(-20px);
}
.slide-right-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

/* Zoom */
.zoom-enter-active,
.zoom-leave-active {
    transition:
        opacity var(--transition-duration, 0.3s) ease,
        transform var(--transition-duration, 0.3s) ease;
}
.zoom-enter-from,
.zoom-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

/* Zoom Fade */
.zoom-fade-enter-active,
.zoom-fade-leave-active {
    transition:
        opacity var(--transition-duration, 0.3s) ease,
        transform var(--transition-duration, 0.3s) cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zoom-fade-enter-from {
    opacity: 0;
    transform: scale(0.8);
}
.zoom-fade-leave-to {
    opacity: 0;
    transform: scale(1.2);
}

/* Rotate Fade */
.rotate-fade-enter-active,
.rotate-fade-leave-active {
    transition:
        opacity var(--transition-duration, 0.3s) ease,
        transform var(--transition-duration, 0.3s) ease;
}
.rotate-fade-enter-from {
    opacity: 0;
    transform: rotate(-10deg);
}
.rotate-fade-leave-to {
    opacity: 0;
    transform: rotate(10deg);
}

/* Bounce */
.bounce-enter-active {
    animation: bounce-in var(--transition-duration, 0.5s);
}
.bounce-leave-active {
    animation: bounce-out var(--transition-duration, 0.5s);
}

@keyframes bounce-in {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
    70% {
        transform: scale(0.9);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes bounce-out {
    0% {
        transform: scale(1);
    }
    30% {
        transform: scale(1.05);
    }
    100% {
        opacity: 0;
        transform: scale(0.3);
    }
}

/* Flip */
.flip-enter-active,
.flip-leave-active {
    transition:
        opacity var(--transition-duration, 0.4s) ease,
        transform var(--transition-duration, 0.4s) ease;
    transform-style: preserve-3d;
}
.flip-enter-from {
    opacity: 0;
    transform: rotateY(90deg);
}
.flip-leave-to {
    opacity: 0;
    transform: rotateY(-90deg);
}

/* Scale Up */
.scale-up-enter-active,
.scale-up-leave-active {
    transition:
        opacity var(--transition-duration, 0.3s) ease,
        transform var(--transition-duration, 0.3s) cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.scale-up-enter-from {
    opacity: 0;
    transform: scale(0.5);
}
.scale-up-leave-to {
    opacity: 0;
    transform: scale(1.5);
}

/* Scale Down */
.scale-down-enter-active,
.scale-down-leave-active {
    transition:
        opacity var(--transition-duration, 0.3s) ease,
        transform var(--transition-duration, 0.3s) cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.scale-down-enter-from {
    opacity: 0;
    transform: scale(1.5);
}
.scale-down-leave-to {
    opacity: 0;
    transform: scale(0.5);
}

/* Rotate 3D */
.rotate-3d-enter-active,
.rotate-3d-leave-active {
    transition:
        opacity var(--transition-duration, 0.5s) ease,
        transform var(--transition-duration, 0.5s) ease;
    transform-style: preserve-3d;
}
.rotate-3d-enter-from {
    opacity: 0;
    transform: perspective(600px) rotateX(-90deg);
}
.rotate-3d-leave-to {
    opacity: 0;
    transform: perspective(600px) rotateX(90deg);
}

/* Swing */
.swing-enter-active {
    animation: swing-in var(--transition-duration, 0.6s) ease-out;
}
.swing-leave-active {
    animation: swing-out var(--transition-duration, 0.6s) ease-in;
}

@keyframes swing-in {
    0% {
        opacity: 0;
        transform: rotateZ(-15deg) translateY(-20px);
    }
    50% {
        transform: rotateZ(10deg) translateY(0);
    }
    70% {
        transform: rotateZ(-5deg);
    }
    100% {
        opacity: 1;
        transform: rotateZ(0deg);
    }
}

@keyframes swing-out {
    0% {
        opacity: 1;
        transform: rotateZ(0deg);
    }
    30% {
        transform: rotateZ(5deg);
    }
    100% {
        opacity: 0;
        transform: rotateZ(15deg) translateY(-20px);
    }
}

/* Shake */
.shake-enter-active {
    animation: shake-in var(--transition-duration, 0.5s);
}
.shake-leave-active {
    animation: shake-out var(--transition-duration, 0.5s);
}

@keyframes shake-in {
    0% {
        opacity: 0;
        transform: translateX(0);
    }
    25% {
        opacity: 0.5;
        transform: translateX(-10px);
    }
    50% {
        opacity: 0.8;
        transform: translateX(10px);
    }
    75% {
        opacity: 0.9;
        transform: translateX(-5px);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes shake-out {
    0% {
        opacity: 1;
        transform: translateX(0);
    }
    25% {
        transform: translateX(5px);
    }
    50% {
        transform: translateX(-5px);
    }
    75% {
        transform: translateX(5px);
    }
    100% {
        opacity: 0;
        transform: translateX(0);
    }
}

/* Roll */
.roll-enter-active,
.roll-leave-active {
    transition:
        opacity var(--transition-duration, 0.5s) ease,
        transform var(--transition-duration, 0.5s) ease;
}
.roll-enter-from {
    opacity: 0;
    transform: translateX(-100%) rotate(-120deg);
}
.roll-leave-to {
    opacity: 0;
    transform: translateX(100%) rotate(120deg);
}

/* Panel Right: width + slide blend for right-side panels */
.panel-right-enter-active,
.panel-right-leave-active {
    transition:
        width var(--transition-duration, 0.4s) cubic-bezier(0.22, 1, 0.36, 1),
        min-width var(--transition-duration, 0.4s) cubic-bezier(0.22, 1, 0.36, 1),
        opacity var(--transition-duration, 0.4s) ease,
        transform var(--transition-duration, 0.4s) ease;
    overflow: hidden;
    will-change: width;
}
.panel-right-enter-from {
    width: 0;
    min-width: 0;
    opacity: 0;
    transform: translateX(12px);
}
.panel-right-leave-to {
    width: 0;
    min-width: 0;
    opacity: 0;
    transform: translateX(12px);
}

/* Panel Left: width + slide blend for left-side panels */
.panel-left-enter-active,
.panel-left-leave-active {
    transition:
        width var(--transition-duration, 0.4s) cubic-bezier(0.22, 1, 0.36, 1),
        min-width var(--transition-duration, 0.4s) cubic-bezier(0.22, 1, 0.36, 1),
        opacity var(--transition-duration, 0.4s) ease,
        transform var(--transition-duration, 0.4s) ease;
    overflow: hidden;
    will-change: width;
}
.panel-left-enter-from {
    width: 0;
    min-width: 0;
    opacity: 0;
    transform: translateX(-12px);
}
.panel-left-leave-to {
    width: 0;
    min-width: 0;
    opacity: 0;
    transform: translateX(-12px);
}
</style>
