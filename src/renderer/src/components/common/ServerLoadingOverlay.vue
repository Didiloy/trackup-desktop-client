<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerLoading } from '@/composables/servers/useServerLoading'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

const { t } = useI18n()
const { state } = useServerLoading()

// Animation for dots
const dots = ref('')
let dotsInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
    dotsInterval = setInterval(() => {
        dots.value = dots.value.length >= 3 ? '' : dots.value + '.'
    }, 400)
})

onUnmounted(() => {
    if (dotsInterval) clearInterval(dotsInterval)
})

const getStepLabel = (key: string): string => {
    return t(`server_loading.steps.${key}`)
}
</script>

<template>
    <TransitionWrapper name="fade-scale">
        <div
            v-if="state.visible"
            class="fixed inset-0 z-9999 flex items-center justify-center"
        >
            <!-- Animated background -->
            <div
                class="absolute inset-0 backdrop-blur-sm bg-linear-to-br from-primary-500/15 via-secondary-500/10 to-primary-500/15 animate-bg-pulse"
            ></div>
            <!-- Content -->
            <div
                class="relative flex flex-col items-center gap-6 p-12 bg-surface-0/95 rounded-3xl shadow-2xl border border-primary-500/10 max-w-[420px] w-[90%]"
            >
                <!-- Animated community icon -->
                <div class="relative w-24 h-24 flex items-center justify-center">
                    <!-- Pulsing rings -->
                    <div
                        class="absolute inset-0 border-2 border-primary-500/30 rounded-full animate-ring-pulse"
                    ></div>
                    <div
                        class="absolute inset-0 border-2 border-primary-500/30 rounded-full animate-ring-pulse [animation-delay:0.5s]"
                    ></div>
                    <div
                        class="absolute inset-0 border-2 border-primary-500/30 rounded-full animate-ring-pulse [animation-delay:1s]"
                    ></div>
                    <!-- Main icon -->
                    <i class="pi pi-compass text-primary-500 animate-icon-bounce"></i>
                </div>

                <!-- Server name if provided -->
                <h2
                    v-if="state.serverName"
                    class="text-xl font-semibold text-surface-900 m-0 text-center"
                >
                    {{ state.serverName }}
                </h2>

                <!-- Main loading message -->
                <p class="text-base text-surface-600 m-0 min-w-[200px] text-center">
                    {{ t('server_loading.title') }}{{ dots }}
                </p>

                <!-- Steps container -->
                <div class="flex flex-col w-full mt-2">
                    <div
                        v-for="(step, index) in state.steps"
                        :key="step.key"
                        class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative"
                        :class="{
                            'bg-primary-500/8': step.status === 'loading'
                        }"
                    >
                        <!-- Step indicator -->
                        <div
                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shrink-0"
                            :class="{
                                'bg-surface-200 text-surface-500': step.status === 'pending',
                                'bg-primary-500 text-white': step.status === 'loading',
                                'bg-green-500 text-white': step.status === 'completed',
                                'bg-red-500 text-white': step.status === 'error'
                            }"
                        >
                            <!-- Completed checkmark -->
                            <i v-if="step.status === 'completed'" class="pi pi-check"></i>
                            <!-- Error X -->
                            <i v-else-if="step.status === 'error'" class="pi pi-times"></i>
                            <!-- Loading spinner -->
                            <div
                                v-else-if="step.status === 'loading'"
                                class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                            ></div>
                            <!-- Pending number -->
                            <span v-else class="text-[0.7rem]">{{ index + 1 }}</span>
                        </div>

                        <!-- Step icon and label -->
                        <div class="flex items-center gap-3">
                            <i
                                :class="[
                                    step.icon,
                                    'text-lg transition-colors duration-300',
                                    {
                                        'text-surface-600': step.status === 'pending',
                                        'text-primary-500 animate-icon-pulse':
                                            step.status === 'loading',
                                        'text-green-500': step.status === 'completed'
                                    }
                                ]"
                            ></i>
                            <span
                                class="text-sm transition-all duration-300"
                                :class="{
                                    'text-surface-700 font-medium': step.status === 'pending' || step.status === 'completed',
                                    'text-surface-900 font-semibold': step.status === 'loading'
                                }"
                            >
                                {{ getStepLabel(step.key) }}
                            </span>
                        </div>

                        <!-- Connector line -->
                        <div
                            v-if="index < state.steps.length - 1"
                            class="absolute left-7.5 top-full w-0.5 h-2 bg-surface-200 -translate-x-1/2"
                        ></div>
                    </div>
                </div>

                <!-- Subtle hint -->
                <p class="text-xs text-surface-500 m-0 text-center">
                    {{ t('server_loading.hint') }}
                </p>
            </div>
        </div>
    </TransitionWrapper>
</template>

<style scoped>
@keyframes bg-pulse {
    0%,
    100% {
        opacity: 0.8;
        background-color: rgba(var(--p-primary-500), 0.15);
    }
    50% {
        opacity: 1;
        background-color: rgba(var(--p-primary-500), 0.2);
    }
}

@keyframes ring-pulse {
    0% {
        transform: scale(0.8);
        opacity: 1;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

@keyframes icon-bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-8px);
    }
}

@keyframes icon-pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-bg-pulse {
    animation: bg-pulse 4s ease-in-out infinite;
}

.animate-ring-pulse {
    animation: ring-pulse 2s ease-out infinite;
}

.animate-icon-bounce {
    animation: icon-bounce 1.5s ease-in-out infinite;
}

.animate-icon-pulse {
    animation: icon-pulse 1s ease-in-out infinite;
}
</style>
