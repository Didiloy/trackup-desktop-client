<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import type {
    IAddSessionMetadataRequest,
    ISessionMetadataEntryDto
} from '@shared/contracts/interfaces/entities/session.interfaces'

const props = defineProps<{
    loading?: boolean
    activityId: string
}>()

const emit = defineEmits<{
    (e: 'submit', payload: IAddSessionMetadataRequest): void
    (e: 'skip'): void
    (e: 'cancel'): void
    (e: 'loaded', hasMetadata: boolean): void
}>()

const { t } = useI18n()
const server_store = useServerStore()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()

const definitions = ref<IActivityMetadataDefinition[]>([])
const values = ref<Record<string, any>>({}) // def_id -> value
const isLoadingDefinitions = ref(true)

onMounted(async () => {
    const serverId = server_store.getPublicId
    if (!serverId || !props.activityId) return

    isLoadingDefinitions.value = true
    try {
        const res = await listMetadataDefinitions(serverId, props.activityId)
        if (!res.error && res.data) {
            definitions.value = res.data
            emit('loaded', definitions.value.length > 0)

            // Initialize default values if any (though API doesn't show defaults in response explicitly in user prompt,
            // but good to have empty state)
        } else {
            emit('loaded', false)
        }
    } catch (e) {
        console.error('Failed to load metadata definitions', e)
        emit('loaded', false)
    } finally {
        isLoadingDefinitions.value = false
    }
})

const can_submit = computed(() => {
    // Check required fields
    for (const def of definitions.value) {
        if (def.required) {
            const val = values.value[def.public_id]
            if (val === undefined || val === null || val === '') return false
        }
    }
    return !props.loading
})

function onSubmit(): void {
    const metadataDtos: ISessionMetadataEntryDto[] = []

    for (const def of definitions.value) {
        const val = values.value[def.public_id]
        if (val !== undefined && val !== null && val !== '') {
            metadataDtos.push({
                metadata_definition_public_id: def.public_id,
                value: val
            })
        }
    }

    if (metadataDtos.length === 0) {
        emit('skip')
        return
    }

    emit('submit', { metadata: metadataDtos })
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
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
                {{
                    t('userInterface.serverSessionsView.addSessionModal.noMetadata') ||
                    'No metadata available'
                }}
            </p>
        </div>

        <div v-else class="flex flex-col gap-4 overflow-y-auto max-h-[60vh] px-1">
            <div v-for="def in definitions" :key="def.public_id" class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-database text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">
                        {{ def.label || def.key }}
                        <span v-if="def.required" class="text-red-500">*</span>
                    </span>
                </div>
                <p v-if="def.description" class="text-xs text-surface-500 -mt-1">
                    {{ def.description }}
                </p>

                <!-- NUMBER -->
                <InputNumber
                    v-if="def.type === 'NUMBER'"
                    v-model="values[def.public_id]"
                    :placeholder="def.label"
                    class="w-full"
                    :pt="{ input: { style: background_style } }"
                />

                <!-- STRING with choices -->
                <Dropdown
                    v-else-if="def.type === 'STRING' && def.choices && def.choices.length > 0"
                    v-model="values[def.public_id]"
                    :options="def.choices"
                    :placeholder="def.label"
                    class="w-full"
                    :pt="{ root: { style: background_style }, input: { style: background_style } }"
                />

                <!-- STRING free text -->
                <InputText
                    v-else-if="def.type === 'STRING'"
                    v-model="values[def.public_id]"
                    :placeholder="def.label"
                    class="w-full"
                    :pt="{ root: { style: background_style } }"
                />

                <!-- BOOLEAN -->
                <div v-else-if="def.type === 'BOOLEAN'" class="flex items-center gap-2">
                    <InputSwitch v-model="values[def.public_id]" />
                    <span class="text-sm text-surface-600">{{
                        values[def.public_id] ? t('common.yes') : t('common.no')
                    }}</span>
                </div>

                <!-- DATE -->
                <Calendar
                    v-else-if="def.type === 'DATE'"
                    v-model="values[def.public_id]"
                    show-time
                    hour-format="24"
                    :placeholder="def.label"
                    class="w-full"
                    :pt="{ input: { style: background_style } }"
                />
            </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-auto pt-4">
            <Button :label="t('common.skip')" severity="secondary" text @click="emit('skip')" />
            <Button
                :label="t('common.finish')"
                :disabled="!can_submit"
                :loading="props.loading"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onSubmit"
            />
        </div>
    </div>
</template>
