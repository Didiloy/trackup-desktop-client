<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import InputNumber from 'primevue/inputnumber'

const props = withDefaults(
    defineProps<{
        modelValue: number // Duration in minutes
        showSeconds?: boolean
        disabled?: boolean
    }>(),
    {
        showSeconds: false,
        disabled: false
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
}>()

const { t } = useI18n()

const hours = ref<number>(0)
const minutes = ref<number>(0)
const seconds = ref<number>(0)

// Sync from modelValue (minutes) to local state
watch(
    () => props.modelValue,
    (newVal) => {
        // Avoid infinite loops if the update came from us
        const totalMinutes = newVal || 0
        const totalSeconds = totalMinutes * 60

        // Calculate hours, minutes, seconds
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = Math.floor(totalSeconds % 60)

        // Only update if different to avoid cursor jumping or unnecessary updates
        if (hours.value !== h) hours.value = h
        if (minutes.value !== m) minutes.value = m
        if (seconds.value !== s) seconds.value = s
    },
    { immediate: true }
)

// Sync from local state to modelValue (minutes)
function updateModel(): void {
    const totalSeconds =
        (hours.value || 0) * 3600 + (minutes.value || 0) * 60 + (seconds.value || 0)
    const totalMinutes = totalSeconds / 60
    emit('update:modelValue', totalMinutes)
}

watch([hours, minutes, seconds], () => {
    updateModel()
})
</script>

<template>
    <div class="flex items-center gap-2">
        <!-- Hours -->
        <div class="flex flex-col gap-1 flex-1">
            <InputNumber
                v-model="hours"
                :min="0"
                show-buttons
                button-layout="stacked"
                :disabled="disabled"
                input-class="w-full text-center !p-1"
                class="w-full"
                @input="updateModel"
            />
            <span class="text-xs text-center text-surface-500">{{
                t('common.time.hours_short')
            }}</span>
        </div>

        <span class="font-bold text-surface-400 mb-5">:</span>

        <!-- Minutes -->
        <div class="flex flex-col gap-1 flex-1">
            <InputNumber
                v-model="minutes"
                :min="0"
                :max="59"
                show-buttons
                button-layout="stacked"
                :disabled="disabled"
                input-class="w-full text-center !p-1"
                class="w-full"
                @input="updateModel"
            />
            <span class="text-xs text-center text-surface-500">{{
                t('common.time.minutes_short')
            }}</span>
        </div>

        <!-- Seconds (Optional) -->
        <template v-if="showSeconds">
            <span class="font-bold text-surface-400 mb-5">:</span>
            <div class="flex flex-col gap-1 flex-1">
                <InputNumber
                    v-model="seconds"
                    :min="0"
                    :max="59"
                    show-buttons
                    button-layout="stacked"
                    :disabled="disabled"
                    input-class="w-full text-center !p-1"
                    class="w-full"
                    @input="updateModel"
                />
                <span class="text-xs text-center text-surface-500">{{
                    t('common.time.seconds_short')
                }}</span>
            </div>
        </template>
    </div>
</template>

<style scoped>
:deep(.p-inputnumber-input) {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
}
</style>
