<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMetadataForm } from '@/composables/activities/metadata/useMetadataForm'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import type { IAddSessionMetadataRequest } from '@shared/contracts/interfaces/entities/session.interfaces'

import MetadataInputString from '@/components/activities/metadata/MetadataInputString.vue'
import MetadataInputNumber from '@/components/activities/metadata/MetadataInputNumber.vue'
import MetadataInputBoolean from '@/components/activities/metadata/MetadataInputBoolean.vue'
import MetadataInputDate from '@/components/activities/metadata/MetadataInputDate.vue'

const props = defineProps<{
    loading?: boolean
    activityId: string
    definitions?: IActivityMetadataDefinition[]
}>()

const emit = defineEmits<{
    (e: 'submit', payload: IAddSessionMetadataRequest): void
    (e: 'skip'): void
    (e: 'cancel'): void
    (e: 'loaded', hasMetadata: boolean): void
}>()

const { t } = useI18n()

const { definitions, values, isLoadingDefinitions, loadDefinitions, canSubmit, getSubmissionData } =
    useMetadataForm(props.activityId, props.definitions)

const componentMap: Record<string, unknown> = {
    STRING: MetadataInputString,
    NUMBER: MetadataInputNumber,
    BOOLEAN: MetadataInputBoolean,
    DATE: MetadataInputDate
}

function getComponent(type: string): unknown {
    return (componentMap as Record<string, unknown>)[type] || MetadataInputString
}

onMounted(async () => {
    const hasMetadata = await loadDefinitions()
    emit('loaded', hasMetadata)
})

function onSubmit(): void {
    const metadata = getSubmissionData()

    if (metadata.length === 0) {
        emit('skip')
        return
    }

    emit('submit', { metadata })
}
</script>

<template>
    <div class="flex flex-col gap-6 h-full">
        <div v-if="isLoadingDefinitions" class="flex justify-center items-center h-40">
            <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
        </div>

        <div
            v-else-if="definitions.length === 0"
            class="flex flex-col items-center justify-center h-40 text-surface-500"
        >
            <i class="pi pi-info-circle text-2xl mb-2"></i>
            <p>
                {{ t('views.server_sessions.add_modal.no_metadata') }}
            </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] px-1">
            <div v-for="def in definitions" :key="def.public_id">
                <component
                    :is="getComponent(def.type)"
                    v-model="values[def.public_id]"
                    :def="def"
                />
            </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-auto pt-4">
            <Button
                :label="t('common.actions.skip')"
                severity="secondary"
                text
                @click="emit('skip')"
            />
            <Button
                :label="t('common.actions.finish')"
                :disabled="!canSubmit || props.loading"
                :loading="props.loading"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onSubmit"
            />
        </div>
    </div>
</template>
