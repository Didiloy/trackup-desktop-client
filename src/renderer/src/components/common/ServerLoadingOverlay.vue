<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerLoading } from '@/composables/servers/useServerLoading'

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

const getStepClass = (status: string): string => {
    switch (status) {
        case 'completed':
            return 'step-completed'
        case 'loading':
            return 'step-loading'
        case 'error':
            return 'step-error'
        default:
            return 'step-pending'
    }
}
</script>

<template>
    <Transition name="fade-scale">
        <div v-if="state.visible" class="loading-overlay">
            <!-- Background with animated gradient -->
            <div class="loading-bg"></div>

            <!-- Content -->
            <div class="loading-content">
                <!-- Animated server icon -->
                <div class="server-icon-container">
                    <div class="server-icon-ring"></div>
                    <div class="server-icon-ring ring-2"></div>
                    <div class="server-icon-ring ring-3"></div>
                    <i class="pi pi-server server-main-icon"></i>
                </div>

                <!-- Server name if provided -->
                <h2 v-if="state.serverName" class="server-name">
                    {{ state.serverName }}
                </h2>

                <!-- Main loading message -->
                <p class="loading-message">{{ t('server_loading.title') }}{{ dots }}</p>

                <!-- Steps container -->
                <div class="steps-container">
                    <div
                        v-for="(step, index) in state.steps"
                        :key="step.key"
                        class="step-item"
                        :class="getStepClass(step.status)"
                    >
                        <!-- Step indicator -->
                        <div class="step-indicator">
                            <!-- Completed checkmark -->
                            <i v-if="step.status === 'completed'" class="pi pi-check"></i>
                            <!-- Error X -->
                            <i v-else-if="step.status === 'error'" class="pi pi-times"></i>
                            <!-- Loading spinner -->
                            <div v-else-if="step.status === 'loading'" class="step-spinner"></div>
                            <!-- Pending number -->
                            <span v-else class="step-number">{{ index + 1 }}</span>
                        </div>

                        <!-- Step icon and label -->
                        <div class="step-content">
                            <i :class="step.icon" class="step-icon"></i>
                            <span class="step-label">{{ getStepLabel(step.key) }}</span>
                        </div>

                        <!-- Connector line -->
                        <div v-if="index < state.steps.length - 1" class="step-connector"></div>
                    </div>
                </div>

                <!-- Subtle hint -->
                <p class="loading-hint">{{ t('server_loading.hint') }}</p>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.loading-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
}

.loading-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        135deg,
        rgba(99, 102, 241, 0.15) 0%,
        rgba(139, 92, 246, 0.1) 50%,
        rgba(59, 130, 246, 0.15) 100%
    );
    animation: bgPulse 4s ease-in-out infinite;
}

@keyframes bgPulse {
    0%,
    100% {
        opacity: 0.8;
    }
    50% {
        opacity: 1;
    }
}

.loading-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 3rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 1.5rem;
    box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(99, 102, 241, 0.1);
    max-width: 420px;
    width: 90%;
}

/* Server Icon Animation */
.server-icon-container {
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.server-icon-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid rgba(99, 102, 241, 0.3);
    border-radius: 50%;
    animation: ringPulse 2s ease-out infinite;
}

.server-icon-ring.ring-2 {
    animation-delay: 0.5s;
}

.server-icon-ring.ring-3 {
    animation-delay: 1s;
}

@keyframes ringPulse {
    0% {
        transform: scale(0.8);
        opacity: 1;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

.server-main-icon {
    font-size: 2.5rem;
    color: var(--primary-color, #6366f1);
    animation: iconBounce 1.5s ease-in-out infinite;
}

@keyframes iconBounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-8px);
    }
}

.server-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    text-align: center;
}

.loading-message {
    font-size: 1rem;
    color: #64748b;
    margin: 0;
    min-width: 200px;
    text-align: center;
}

/* Steps */
.steps-container {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    margin-top: 0.5rem;
}

.step-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
    position: relative;
}

.step-item.step-loading {
    background: rgba(99, 102, 241, 0.08);
}

.step-item.step-completed {
    opacity: 0.7;
}

.step-item.step-pending {
    opacity: 0.5;
}

.step-indicator {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.step-pending .step-indicator {
    background: #e2e8f0;
    color: #94a3b8;
}

.step-loading .step-indicator {
    background: var(--primary-color, #6366f1);
    color: white;
}

.step-completed .step-indicator {
    background: #10b981;
    color: white;
}

.step-error .step-indicator {
    background: #ef4444;
    color: white;
}

.step-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.step-number {
    font-size: 0.7rem;
}

.step-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.step-icon {
    font-size: 1.1rem;
    color: #64748b;
    transition: color 0.3s ease;
}

.step-loading .step-icon {
    color: var(--primary-color, #6366f1);
    animation: iconPulse 1s ease-in-out infinite;
}

.step-completed .step-icon {
    color: #10b981;
}

@keyframes iconPulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.step-label {
    font-size: 0.9rem;
    color: #475569;
    font-weight: 500;
}

.step-loading .step-label {
    color: #1e293b;
    font-weight: 600;
}

.step-connector {
    position: absolute;
    left: 1.875rem;
    top: 100%;
    width: 2px;
    height: 0.5rem;
    background: #e2e8f0;
    transform: translateX(-50%);
}

.loading-hint {
    font-size: 0.8rem;
    color: #94a3b8;
    margin: 0;
    text-align: center;
}

/* Transitions */
.fade-scale-enter-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
    opacity: 0;
}

.fade-scale-enter-from .loading-content {
    transform: scale(0.95);
}

.fade-scale-leave-to {
    opacity: 0;
}

.fade-scale-leave-to .loading-content {
    transform: scale(1.02);
}
</style>
