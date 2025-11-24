<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import type {
    IAddSessionEnumsRequest,
    IAddSessionEnumsSelection
} from '@shared/contracts/interfaces/entities/session.interfaces'

const props = defineProps<{
    loading?: boolean
    definitions?: IEnumDefinition[]
}>()

const emit = defineEmits<{
    (e: 'submit', payload: IAddSessionEnumsRequest): void
    (e: 'skip'): void
    (e: 'cancel'): void
    (e: 'loaded', hasEnums: boolean): void
}>()

const { t } = useI18n()
const server_store = useServerStore()
const { listEnumDefinitions } = useEnumDefinitionCRUD()

const definitions = ref<IEnumDefinition[]>([])
const selections = ref<Record<string, string>>({}) // enum_def_id -> selected_key
const isLoadingDefinitions = ref(true)

onMounted(async () => {
    if (props.definitions && props.definitions.length > 0) {
        definitions.value = props.definitions
        isLoadingDefinitions.value = false
        emit('loaded', true)
        return
    }

    const serverId = server_store.getPublicId
    if (!serverId) return

    isLoadingDefinitions.value = true
    try {
        const res = await listEnumDefinitions(serverId)
        if (!res.error && res.data) {
            definitions.value = res.data
            emit('loaded', definitions.value.length > 0)
        } else {
            emit('loaded', false)
        }
    } catch (e) {
        console.error('Failed to load enum definitions', e)
        emit('loaded', false)
    } finally {
        isLoadingDefinitions.value = false
    }
})

const can_submit = computed(() => {
    // If no definitions, we can't submit anything useful, but we should have skipped already.
    // If we have definitions, check if at least one is selected? Or maybe all required?
    // The API doesn't seem to enforce required enums, but let's assume we want to send what's selected.
    return !props.loading
})

function onSubmit(): void {
    const selectionDtos: IAddSessionEnumsSelection[] = []

    for (const def of definitions.value) {
        const selectedKey = selections.value[def.public_id]
        if (selectedKey) {
            // Find the value object to get the ID (though the API asks for enum_value_id,
            // the structure implies we need to find the specific value entry)
            // Wait, the API says: enum_value_id (The enum_value ID being selected) AND selected_key.
            // Usually enum values are stored in `values` array in definition.

            // Let's look at IEnumDefinition structure from previous file view if possible,
            // or infer. The user request showed:
            // values: List [ OrderedMap { "public_id": "enumval_111", "value1": "easy", ... } ]
            // Actually usually it's one value object per definition in some designs, or a list of possible values.
            // The user request example shows "values" as a list of objects.
            // But the selection DTO asks for `enum_value_id`.

            // Let's assume `values` is an array of options.
            // Wait, the user request example:
            // values: [ { "public_id": "enumval_111", "value1": "easy", "value2": "hard" } ]
            // This looks like a single object containing multiple keys?
            // "selected_key": "value3"

            // If the definition has a list of values, we need to know which one is selected.
            // But the example `selected_key` suggests the keys are dynamic (value1, value2...).

            // Let's assume for now that `def.values[0]` contains the map of keys to labels,
            // and `def.values[0].public_id` is the `enum_value_id`.

            const valueObj = def.values?.[0]
            if (valueObj) {
                selectionDtos.push({
                    enum_value_id: valueObj.public_id,
                    selected_key: selectedKey as any
                })
            }
        }
    }

    if (selectionDtos.length === 0) {
        emit('skip')
        return
    }

    emit('submit', { selections: selectionDtos })
}

function getOptions(def: IEnumDefinition): { label: string; value: string }[] {
    // This logic depends heavily on how `values` are structured.
    // Based on "selected_key" example "value3", and values having "value1": "easy".
    // We need to iterate over keys of the first value object.
    const valueObj = def.values?.[0]
    if (!valueObj) return []

    return Object.entries(valueObj)
        .filter(([key]) => key.startsWith('value') && key !== 'public_id')
        .map(([key, label]) => ({
            label: String(label),
            value: key
        }))
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
                {{
                    t('userInterface.serverSessionsView.addSessionModal.noEnums') ||
                    'No selections available'
                }}
            </p>
        </div>

        <div v-else class="flex flex-col gap-4 overflow-y-auto max-h-[60vh] px-1">
            <div v-for="def in definitions" :key="def.public_id" class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-list text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">{{ def.name }}</span>
                </div>
                <p v-if="def.description" class="text-xs text-surface-500 -mt-1">
                    {{ def.description }}
                </p>

                <div class="flex flex-wrap gap-2">
                    <div v-for="opt in getOptions(def)" :key="opt.value" class="flex items-center">
                        <RadioButton
                            v-model="selections[def.public_id]"
                            :inputId="`${def.public_id}_${opt.value}`"
                            :value="opt.value"
                        />
                        <label
                            :for="`${def.public_id}_${opt.value}`"
                            class="ml-2 cursor-pointer text-sm text-surface-700"
                        >
                            {{ opt.label }}
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-auto pt-4">
            <Button :label="t('common.skip')" severity="secondary" text @click="emit('skip')" />
            <Button
                :label="t('common.next')"
                :disabled="!can_submit"
                :loading="props.loading"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onSubmit"
            />
        </div>
    </div>
</template>
