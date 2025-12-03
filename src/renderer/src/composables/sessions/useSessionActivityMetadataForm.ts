import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import type { IAddSessionMetadataEntry } from '@shared/contracts/interfaces/entities/session.interfaces'

interface useSessionActivityMetadataFormReturn {
    definitions: Ref<IActivityMetadataDefinition[]>
    values: Ref<Record<string, unknown>>
    isLoadingDefinitions: Ref<boolean>
    loadDefinitions: () => Promise<boolean>
    canSubmit: ComputedRef<boolean>,
    getSubmissionData: () => IAddSessionMetadataEntry[]
}

export function useSessionActivityMetadataForm(
    activityId: string,
    initialDefinitions?: IActivityMetadataDefinition[]
) : useSessionActivityMetadataFormReturn {
    const server_store = useServerStore()
    const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()

    const definitions = ref<IActivityMetadataDefinition[]>([])
    const values = ref<Record<string, unknown>>({})
    const isLoadingDefinitions = ref(true)

    const loadDefinitions = async (): Promise<boolean> => {
        if (initialDefinitions && initialDefinitions.length > 0) {
            definitions.value = initialDefinitions
            isLoadingDefinitions.value = false
            return true
        }

        const serverId = server_store.getPublicId
        if (!serverId || !activityId) {
            isLoadingDefinitions.value = false
            return false
        }

        isLoadingDefinitions.value = true
        try {
            const res = await listMetadataDefinitions(serverId, activityId)
            if (!res.error && res.data) {
                definitions.value = res.data
                return definitions.value.length > 0
            }
            return false
        } catch (e) {
            console.error('Failed to load metadata definitions', e)
            return false
        } finally {
            isLoadingDefinitions.value = false
        }
    }

    const canSubmit = computed(() => {
        for (const def of definitions.value) {
            if (def.required) {
                const val = values.value[def.public_id]
                if (val === undefined || val === null || val === '') return false
            }
        }
        return true
    })

    const getSubmissionData = (): IAddSessionMetadataEntry[] => {
        const metadataDtos: IAddSessionMetadataEntry[] = []

        for (const def of definitions.value) {
            let val = values.value[def.public_id]
            if (val !== undefined && val !== null && val !== '') {
                // Ensure number type for NUMBER definitions
                if (def.type === 'NUMBER' && typeof val === 'string') {
                    const num = parseFloat(val)
                    if (!isNaN(num)) {
                        val = num
                    }
                }

                metadataDtos.push({
                    metadata_definition_public_id: def.public_id,
                    value: val
                })
            }
        }
        return metadataDtos
    }

    return {
        definitions,
        values,
        isLoadingDefinitions,
        loadDefinitions,
        canSubmit,
        getSubmissionData
    }
}
