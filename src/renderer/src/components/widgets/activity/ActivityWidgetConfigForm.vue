<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ActivityAutocomplete from '@/components/activities/ActivityAutocomplete.vue'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

const props = defineProps<{
    modelValue: Record<string, any>
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, any>): void
}>()

const { t } = useI18n()
const selectedActivity = ref<IActivity | null>(null) // We can't easily restore the object from just ID without fetching, so we might start null or need a lookup

// If we need to pre-fill, we'd need to fetch the activity by ID here.
// For now, assuming new config starts empty or just ID is passed.
// If we wanted to show the name for existing config, we'd need to fetch it.

function handleSelect(activity: IActivity | null): void {
    selectedActivity.value = activity
    emit('update:modelValue', {
        ...props.modelValue,
        activityId: activity?.public_id
    })
}
</script>

<template>
    <div class="space-y-4">
        <label class="block text-sm font-medium text-surface-700">
            {{
                t('common.actions.select', {
                    entity: t('views.activity.title_single').toLowerCase()
                })
            }}
        </label>
        <ActivityAutocomplete :model-value="selectedActivity?.name || ''" @select="handleSelect" />
    </div>
</template>
