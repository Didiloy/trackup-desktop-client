<script setup lang="ts">
import { ref, shallowRef, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import { useSessionCRUD } from '@/composables/sessions/useSessionCRUD'
import { useServerStore } from '@/stores/server'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import {
    IAddSessionEnumsSelection,
    TSessionEnumSelectionKey
} from '@shared/contracts/interfaces/entities/session.interfaces'

const props = defineProps<{
    sessionId: string
}>()

const emit = defineEmits<{
    (e: 'success'): void
    (e: 'skip'): void
}>()

const { t } = useI18n()
const toast = useToast()
const server_store = useServerStore()
const { listEnumDefinitions } = useEnumDefinitionCRUD()
const { addSessionEnums } = useSessionCRUD()

const definitions = shallowRef<IEnumDefinition[]>([])
const selections = ref<Record<string, string>>({}) // enum_def_id -> "enumValueId_key"
const isLoadingDefinitions = ref(true)
const submitting = ref(false)
const SELECTION_VALUE_SEPARATOR = '##'

onMounted(async () => {
    // Assigner les definitions depuis le store si disponibles
    if (server_store.getEnumsDefinition && server_store.getEnumsDefinition.length > 0) {
        definitions.value = server_store.getEnumsDefinition
        isLoadingDefinitions.value = false
        return
    }

    const serverId = server_store.getPublicId
    if (!serverId) return

    isLoadingDefinitions.value = true
    try {
        const res = await listEnumDefinitions(serverId)
        if (!res.error && res.data) {
            definitions.value = res.data
        }
    } catch (e) {
        console.error(t('messages.error.fetch'), e)
    } finally {
        isLoadingDefinitions.value = false
    }
})

const can_submit = computed(() => {
    return !submitting.value
})

async function onSubmit(): Promise<void> {
    // Parser les sélections en DTOs
    const selectionDtos: IAddSessionEnumsSelection[] = Object.entries(selections.value)
        .filter(([_, value]) => value)
        .map(([_, value]) => {
            const [enum_value_id , selected_key] = value.split(SELECTION_VALUE_SEPARATOR)
            return {
                enum_value_id,
                selected_key: selected_key as TSessionEnumSelectionKey
            }
        })

    if (selectionDtos.length === 0) {
        emit('skip')
        return
    }

    submitting.value = true

    console.log('selectionDtos', selectionDtos)

    try {
        const serverId = server_store.getPublicId
        if (!serverId) {
            throw new Error(t('messages.error.noServerSelected'))
        }

        const res = await addSessionEnums(serverId, props.sessionId, { selections: selectionDtos })
        if (res.error) {
            throw new Error(res.error)
        }

        toast.add({ severity: 'success', summary: t('messages.success.update'), life: 2500 })
        emit('success')
    } catch (e) {
        const message = e instanceof Error ? e.message : t('messages.error.addEnumsFailed')
        toast.add({ severity: 'error', summary: message, life: 3000 })
    } finally {
        submitting.value = false
    }
}

function getOptions(def: IEnumDefinition): { label: string; value: string; key: string }[] {
    if (!def.values || def.values.length === 0) return []

    const options: { label: string; value: string; key: string }[] = []

    // Parcourir chaque enumValue dans le tableau
    for (const enumValue of def.values) {
        // Extraire toutes les valeurs possibles (value1, value2, value3, value4, value5)
        const valueKeys = ['value1', 'value2', 'value3', 'value4', 'value5'] as const

        for (const key of valueKeys) {
            const value = enumValue[key]
            if (value && value.trim() !== '') {
                options.push({
                    label: String(value),
                    value: enumValue.public_id, // Le public_id de l'enumValue
                    key: key // La clé (value1, value2, etc.)
                })
            }
        }
    }

    return options
}

function handleSelection(defId: string, enumValueId: string, key: string): void {
    console.log('handleSelection', defId, enumValueId, key)
    selections.value[defId] = `${enumValueId}${SELECTION_VALUE_SEPARATOR}${key}`
    console.log('selections', selections.value)
}

function getSelectedValue(defId: string): string | undefined {
    return selections.value[defId]
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
                {{ t('views.server_sessions.add_modal.no_enums') }}
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
                    <div
                        v-for="opt in getOptions(def)"
                        :key="`${opt.value}_${opt.key}`"
                        class="flex items-center"
                    >
                        <RadioButton
                            :model-value="getSelectedValue(def.public_id)"
                            :input-id="`${def.public_id}_${opt.value}_${opt.key}`"
                            :value="`${opt.value}${SELECTION_VALUE_SEPARATOR}${opt.key}`"
                            @update:model-value="handleSelection(def.public_id, opt.value, opt.key)"
                        />
                        <label
                            :for="`${def.public_id}_${opt.value}_${opt.key}`"
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
            <Button
                :label="t('common.actions.skip')"
                severity="secondary"
                text
                @click="emit('skip')"
            />
            <Button
                :label="t('common.actions.next')"
                :disabled="!can_submit"
                :loading="submitting"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onSubmit"
            />
        </div>
    </div>
</template>
