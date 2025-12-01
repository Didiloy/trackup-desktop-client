<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

import GenericPopover from '@/components/common/contexts/GenericPopover.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import { useChronos } from '@/composables/useChronos'
import ChronosList from '@/components/chronos/ChronosList.vue'
import DurationInput from '@/components/common/inputs/DurationInput.vue'

const { t } = useI18n()
const { chronos, startChrono, addManualChrono } = useChronos()

const mode = ref<'stopwatch' | 'manual'>('stopwatch')
const newChronoTitle = ref('')
const newChronoDuration = ref<number>(60)

const hasRunningChronos = computed(() => chronos.value.some((chrono) => chrono.isRunning))

function handleStartChrono(): void {
    startChrono(newChronoTitle.value)
    newChronoTitle.value = ''
}

function handleAddManualChrono(): void {
    addManualChrono(newChronoTitle.value, newChronoDuration.value)
    newChronoTitle.value = ''
    newChronoDuration.value = 60
}
</script>

<template>
    <GenericPopover popover-class="w-[30rem] select-none">
        <template #trigger="{ toggle }">
            <div
                class="group h-8 w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-400 hover:cursor-pointer"
                :aria-label="t('common.fields.chronos')"
                @click="toggle"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 25 25"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-6 h-6"
                    :class="
                        hasRunningChronos
                            ? 'text-primary-600 group-hover:text-black dark:text-primary-400 dark:group-hover:text-gray-50'
                            : 'text-gray-600 group-hover:text-black dark:text-gray-400 dark:group-hover:text-gray-50'
                    "
                    style="shape-rendering: geometricPrecision"
                >
                    <!-- Stopwatch body -->
                    <circle
                        cx="12"
                        cy="13"
                        r="7"
                        :class="hasRunningChronos ? 'heartbeat-circle' : ''"
                    />
                    <!-- Stopwatch button -->
                    <path d="M12 6v-2" :class="hasRunningChronos ? 'heartbeat-circle' : ''" />
                    <path d="M10 4h4" :class="hasRunningChronos ? 'heartbeat-circle' : ''" />
                    <!-- Hour hand (animated) -->
                    <line
                        x1="12"
                        y1="13"
                        x2="12"
                        y2="10"
                        :class="hasRunningChronos ? 'hour-hand' : ''"
                        stroke-width="2.5"
                    />
                    <!-- Minute hand (animated) -->
                    <line
                        x1="12"
                        y1="13"
                        x2="14.5"
                        y2="13"
                        :class="hasRunningChronos ? 'minute-hand' : ''"
                        stroke-width="2"
                    />
                </svg>
            </div>
        </template>
        <template #content>
            <div class="flex flex-col gap-4">
                <!-- Header / Mode Switch -->
                <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-surface-900">{{
                        t('common.fields.new_chrono')
                    }}</span>
                    <div class="flex bg-surface-100 rounded-lg p-1">
                        <Button
                            :label="t('common.actions.start')"
                            size="small"
                            text
                            :class="{ '!bg-surface-0  shadow-sm': mode === 'stopwatch' }"
                            class="!px-3 !py-1 h-12 text-xs"
                            @click="mode = 'stopwatch'"
                        />
                        <Button
                            :label="t('common.actions.add_manual')"
                            size="small"
                            text
                            :class="{ '!bg-surface-0 shadow-sm': mode === 'manual' }"
                            class="!px-3 !py-1 h-12 text-xs"
                            @click="mode = 'manual'"
                        />
                    </div>
                </div>

                <!-- Input Form -->
                <div class="flex flex-col gap-3">
                    <InputText
                        v-model="newChronoTitle"
                        :placeholder="t('common.fields.title') || 'Title (Optional)'"
                        class="w-full"
                        size="small"
                        @keydown.enter="
                            mode === 'stopwatch' ? handleStartChrono() : handleAddManualChrono()
                        "
                    />

                    <!-- Stopwatch Mode -->
                    <TransitionWrapper name="fade" mode="out-in" :duration="0.2">
                        <div v-if="mode === 'stopwatch'" key="stopwatch">
                            <Button
                                icon="pi pi-play"
                                :label="t('common.actions.start') || 'Start'"
                                class="w-full"
                                size="small"
                                @click="handleStartChrono"
                            />
                        </div>

                        <!-- Manual Mode -->
                        <div v-else key="manual" class="flex gap-2">
                            <DurationInput
                                v-model="newChronoDuration"
                                :show-seconds="true"
                                class="flex-1"
                                @keydown.enter="handleAddManualChrono"
                            />
                            <Button
                                icon="pi pi-plus"
                                :label="t('common.actions.add') || 'Add'"
                                size="small"
                                class="h-9"
                                @click="handleAddManualChrono"
                            />
                        </div>
                    </TransitionWrapper>
                </div>

                <!-- List -->
                <ChronosList />
            </div>
        </template>
    </GenericPopover>
</template>

<style scoped>
.heartbeat-circle {
    transform-origin: 12px 13px;
    animation: heartbeat 1.2s ease-in-out infinite;
}

.hour-hand {
    transform-origin: 12px 13px;
    animation: rotate-hour 4s linear infinite;
}

.minute-hand {
    transform-origin: 12px 13px;
    animation: rotate-minute 2s linear infinite;
}

@keyframes heartbeat {
    0%,
    100% {
        transform: scale(1);
    }
    14% {
        transform: scale(1.15);
    }
    28% {
        transform: scale(1);
    }
    42% {
        transform: scale(1.15);
    }
    56% {
        transform: scale(1);
    }
}

@keyframes rotate-hour {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes rotate-minute {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
