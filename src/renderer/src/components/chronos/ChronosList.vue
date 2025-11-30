<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNow } from '@vueuse/core'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { useChronos, type IChrono } from '@/composables/useChronos'

const { t } = useI18n()
const { chronos, pauseChrono, resumeChrono, removeChrono } = useChronos()
const now = useNow()

const selected_ids = ref<string[]>([])

// Helper to format duration (ms) to mm:ss or hh:mm:ss
function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (n: number): string => n.toString().padStart(2, '0')

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

function handlePauseChrono(id: string): void {
    pauseChrono(id)
}

function handleResumeChrono(id: string): void {
    resumeChrono(id)
}

function handleRemoveChrono(id: string): void {
    removeChrono(id)
    // Also remove from selection if it was selected
    selected_ids.value = selected_ids.value.filter((selectedId) => selectedId !== id)
}

// Bulk Actions
const allSelected = computed({
    get: () => chronos.value.length > 0 && selected_ids.value.length === chronos.value.length,
    set: (val: boolean) => {
        if (val) {
            selected_ids.value = chronos.value.map((c) => c.id)
        } else {
            selected_ids.value = []
        }
    }
})

function toggleSelectAll(): void {
    allSelected.value = !allSelected.value
}

function deleteSelected(): void {
    selected_ids.value.forEach((id) => {
        // For now, we cannot delete running chronos.
        const chrono = chronos.value.find((c) => c.id === id)
        if (chrono && !chrono.isRunning) {
            removeChrono(id)
        }
    })
    selected_ids.value = []
}

const hasSelection = computed(() => selected_ids.value.length > 0)

const selectionCount = computed(() => selected_ids.value.length)
</script>

<template>
    <div v-if="chronos.length > 0" class="mt-2">
        <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-sm text-surface-500">{{
                t('common.fields.saved_chronos') || 'Saved Chronos'
            }}</span>

            <!-- Bulk Actions Controls -->
            <div class="flex items-center gap-2">
                <div v-if="chronos.length > 0" class="flex items-center gap-2">
                    <Checkbox v-model="allSelected" binary size="small" />
                    <span
                        v-if="hasSelection"
                        class="text-xs text-surface-500 cursor-pointer select-none"
                        @click="toggleSelectAll"
                    >
                        {{ selectionCount }}
                        {{ t('common.fields.items') + ' ' + t('common.actions.select_short') }}
                    </span>
                </div>
                <Button
                    v-if="hasSelection"
                    v-tooltip.bottom="t('common.actions.delete')"
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    size="small"
                    class="!w-6 !h-6"
                    @click="deleteSelected"
                />
            </div>
        </div>

        <ul class="list-none p-0 m-0 flex flex-col gap-3 max-h-[200px] overflow-y-auto">
            <li
                v-for="chrono in chronos"
                :key="chrono.id"
                class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 shadow-sm transition-all hover:shadow-md group"
                :class="{ 'bg-surface-50': selected_ids.includes(chrono.id) }"
            >
                <!-- Selection Checkbox -->
                <Checkbox v-model="selected_ids" :value="chrono.id" class="flex-shrink-0" />

                <!-- Status Indicator -->
                <div
                    class="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                    :class="{ 'animate-pulse': chrono.isRunning }"
                    :style="{ backgroundColor: chrono.color }"
                ></div>

                <!-- Info -->
                <div class="flex-1 overflow-hidden flex flex-col">
                    <div
                        v-if="chrono.title"
                        class="truncate font-semibold text-sm text-surface-900"
                    >
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
                        v-tooltip.bottom="t('common.actions.pause')"
                        icon="pi pi-pause"
                        text
                        rounded
                        severity="warn"
                        size="small"
                        @click="handlePauseChrono(chrono.id)"
                    />
                    <Button
                        v-else
                        v-tooltip.bottom="t('common.actions.resume')"
                        icon="pi pi-play"
                        text
                        rounded
                        severity="success"
                        size="small"
                        @click="handleResumeChrono(chrono.id)"
                    />

                    <Button
                        v-tooltip.bottom="
                            chrono.isRunning
                                ? t('messages.warn.pause_to_delete')
                                : t('common.actions.delete')
                        "
                        icon="pi pi-trash"
                        text
                        rounded
                        severity="danger"
                        size="small"
                        :disabled="chrono.isRunning"
                        @click="handleRemoveChrono(chrono.id)"
                    />
                </div>
            </li>
        </ul>
    </div>
    <div
        v-else
        class="text-center text-surface-500 text-sm py-4 bg-surface-50 rounded-lg border border-dashed border-surface-200 mt-2"
    >
        {{ t('common.misc.no_chronos') }}
    </div>
</template>

<style scoped>
/* Custom scrollbar for the list if needed, though Tailwind usually handles it well enough or browser defaults */
</style>
