<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import GenericPopover from '@/components/common/contexts/GenericPopover.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import { useChronos } from '@/composables/useChronos'
import ChronosList from '@/components/chronos/ChronosList.vue'

const { t } = useI18n()
const { startChrono, addManualChrono } = useChronos()

const mode = ref<'stopwatch' | 'manual'>('stopwatch')
const newChronoTitle = ref('')
const newChronoDuration = ref<number>(60)



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
    <GenericPopover
        :button-icon="'pi pi-stopwatch'"
        :button-variant="'text'"
        :button-aria-label="t('common.fields.chronos')"
        popover-class="w-[30rem]"
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
                <ChronosList />
            </div>
        </template>
    </GenericPopover>
</template>

<style scoped></style>
