<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNow } from '@vueuse/core'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import GenericPopover from '@/components/common/contexts/GenericPopover.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import { useChronos, type IChrono } from '@/composables/useChronos'

const { t } = useI18n()
const { chronos, startChrono, addManualChrono, pauseChrono, resumeChrono, removeChrono } =
    useChronos()
const now = useNow()

const mode = ref<'stopwatch' | 'manual'>('stopwatch')
const newChronoTitle = ref('')
const newChronoDuration = ref<number>(60)

// Helper to format duration (ms) to mm:ss or hh:mm:ss
function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (n: number) => n.toString().padStart(2, '0')

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
}

function getChronoDuration(chrono: IChrono): string {
    if (chrono.isRunning && chrono.startTime) {
        const currentElapsed = chrono.elapsed + (now.value.getTime() - chrono.startTime)
        return formatDuration(currentElapsed)
    }
    return formatDuration(chrono.elapsed)
}

function handleStartChrono() {
    startChrono(newChronoTitle.value)
    newChronoTitle.value = ''
}

function handleAddManualChrono() {
    addManualChrono(newChronoTitle.value, newChronoDuration.value)
    newChronoTitle.value = ''
    newChronoDuration.value = 60
    // Switch back to stopwatch for convenience? Or stay? Let's stay.
}

function handlePauseChrono(id: string) {
    pauseChrono(id)
}

function handleResumeChrono(id: string) {
    resumeChrono(id)
}

function handleRemoveChrono(id: string) {
    removeChrono(id)
}
</script>

<template>
    <GenericPopover
        button-icon="pi pi-stopwatch"
        button-variant="text"
        :button-rounded="true"
        :button-aria-label="t('common.fields.chronos') || 'Chronos'"
        popover-class="w-[24rem]"
    >
        <template #content>
            <div class="flex flex-col gap-4">
                <!-- Header / Mode Switch -->
                <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-surface-900">{{
                        t('common.fields.new_chrono') || 'New Chrono'
                    }}</span>
                    <div class="flex bg-surface-100 rounded-lg p-1">
                        <Button
                            :label="t('common.actions.start') || 'Start'"
                            size="small"
                            text
                            :class="{ '!bg-surface-0  shadow-sm': mode === 'stopwatch' }"
                            class="!px-3 !py-1 h-12 text-xs"
                            @click="mode = 'stopwatch'"
                        />
                        <Button
                            :label="t('common.actions.add_manual') || 'Manual'"
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
                        @keydown.enter="mode === 'stopwatch' ? handleStartChrono() : handleAddManualChrono()"
                    />

                    <!-- Stopwatch Mode -->
                    <TransitionWrapper name="fade" mode="out-in" duration="0.2">
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
                            <InputNumber
                                v-model="newChronoDuration"
                                :min="1"
                                suffix=" min"
                                class="flex-1"
                                size="small"
                                :placeholder="t('common.fields.duration') || 'Duration'"
                                @keydown.enter="handleAddManualChrono"
                            />
                            <Button
                                icon="pi pi-plus"
                                :label="t('common.actions.add') || 'Add'"
                                size="small"
                                @click="handleAddManualChrono"
                            />
                        </div>
                    </TransitionWrapper>
                </div>

                <!-- List -->
                <div v-if="chronos.length > 0" class="mt-2">
                    <span class="font-medium block mb-2 text-sm text-surface-500">{{
                        t('common.fields.saved_chronos') || 'Saved Chronos'
                    }}</span>
                    <ul
                        class="list-none p-0 m-0 flex flex-col gap-3 max-h-[300px] overflow-y-auto"
                    >
                        <li
                            v-for="chrono in chronos"
                            :key="chrono.id"
                            class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 shadow-sm transition-all hover:shadow-md"
                        >
                            <!-- Status Indicator -->
                            <div
                                class="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                                :class="{ 'animate-pulse': chrono.isRunning }"
                                :style="{ backgroundColor: chrono.color }"
                            ></div>

                            <!-- Info -->
                            <div class="flex-1 overflow-hidden flex flex-col">
                                <div v-if="chrono.title" class="truncate font-semibold text-sm text-surface-900">
                                    {{ chrono.title }}
                                </div>
                                <div class="text-xs font-mono font-medium text-surface-600 mt-0.5">
                                    {{ getChronoDuration(chrono) }}
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-1">
                                <Button
                                    v-if="chrono.isRunning"
                                    icon="pi pi-pause"
                                    text
                                    rounded
                                    severity="warn"
                                    size="small"
                                    v-tooltip.bottom="t('common.actions.pause')"
                                    @click="handlePauseChrono(chrono.id)"
                                />
                                <Button
                                    v-else
                                    icon="pi pi-play"
                                    text
                                    rounded
                                    severity="success"
                                    size="small"
                                    v-tooltip.bottom="t('common.actions.resume')"
                                    @click="handleResumeChrono(chrono.id)"
                                />

                                <Button
                                    icon="pi pi-trash"
                                    text
                                    rounded
                                    severity="danger"
                                    size="small"
                                    :disabled="chrono.isRunning"
                                    v-tooltip.bottom="
                                        chrono.isRunning
                                            ? t('messages.warn.pause_to_delete')
                                            : t('common.actions.delete')
                                    "
                                    @click="handleRemoveChrono(chrono.id)"
                                />
                            </div>
                        </li>
                    </ul>
                </div>
                <div v-else class="text-center text-surface-500 text-sm py-4 bg-surface-50 rounded-lg border border-dashed border-surface-200 mt-2">
                    {{ t('common.misc.no_chronos') }}
                </div>
            </div>
        </template>
    </GenericPopover>
</template>
