<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import ActivityAutocomplete from '@/components/activities/ActivityAutocomplete.vue'
import MetadataDefinitionAutocomplete from '@/components/activities/metadata/MetadataDefinitionAutocomplete.vue'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

const props = defineProps<{
    modelValue: Record<string, any>
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, any>): void
}>()

const { t } = useI18n()
const server_store = useServerStore()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()

const selectedActivity = ref<IActivity | null>(null)
const selectedMetadata = ref<IActivityMetadataDefinition | null>(null)

const currentActivityId = computed(() => selectedActivity.value?.public_id || props.modelValue.activityId)

// Restore selections on mount if config has IDs
onMounted(async () => {
    if (props.modelValue.activityId && props.modelValue.metadataDefinitionId && server_store.getPublicId) {
        try {
            const res = await listMetadataDefinitions(
                server_store.getPublicId,
                props.modelValue.activityId
            )
            if (res.data) {
                const def = res.data.find(
                    (d) => d.public_id === props.modelValue.metadataDefinitionId
                )
                if (def) {
                    selectedMetadata.value = def
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
})

function handleActivitySelect(activity: IActivity | null): void {
    selectedActivity.value = activity
    // Reset metadata when activity changes
    selectedMetadata.value = null
    emit('update:modelValue', {
        ...props.modelValue,
        activityId: activity?.public_id,
        metadataDefinitionId: undefined
    })
}

function handleMetadataSelect(definition: IActivityMetadataDefinition | null): void {
    selectedMetadata.value = definition
    emit('update:modelValue', {
        ...props.modelValue,
        activityId: currentActivityId.value,
        metadataDefinitionId: definition?.public_id
    })
}
</script>

<template>
    <div class="space-y-4">
        <!-- Activity Selection -->
        <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">
                {{
                    t('common.actions.select', {
                        entity: t('views.server_activities.title_single').toLowerCase()
                    })
                }}
            </label>
            <ActivityAutocomplete
                :model-value="selectedActivity?.name || ''"
                @select="handleActivitySelect"
            />
        </div>

        <!-- Metadata Selection (only show when activity is selected) -->
        <div v-if="currentActivityId">
            <label class="block text-sm font-medium text-surface-700 mb-2">
                {{
                    t('common.actions.select', {
                        entity: t('common.steps.metadata').toLowerCase()
                    })
                }}
            </label>
            <MetadataDefinitionAutocomplete
                :activity-id="currentActivityId"
                :initial-definition="selectedMetadata"
                :model-value="selectedMetadata?.label || selectedMetadata?.key || ''"
                @select="handleMetadataSelect"
            />
        </div>
    </div>
</template>
