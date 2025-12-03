import { ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import type {
    IActivityMetadataDefinition,
    ICreateActivityMetadataDefinitionRequest,
    IUpdateActivityMetadataDefinitionRequest
} from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

interface UseActivityMetadataDefinitionListReturn {
    existingMetadataList: Ref<IActivityMetadataDefinition[]>
    defs: Ref<ICreateActivityMetadataDefinitionRequest[]>
    syncExistingMetadata: (serverId: string, activityId: string) => Promise<void>
    removeExistingMetadata: (
        serverId: string,
        activityId: string,
        id: string,
        onRemove?: () => void
    ) => Promise<void>
    updateExistingMetadata: (
        serverId: string,
        activityId: string,
        metadataId: string,
        payload: IUpdateActivityMetadataDefinitionRequest,
        onUpdate?: () => void
    ) => Promise<void>
    addDefinition: (def: ICreateActivityMetadataDefinitionRequest) => void
    removeDefinition: (index: number) => void
    clearPendingDefinitions: () => void
}

export function useActivityMetadataDefinitionList(): UseActivityMetadataDefinitionListReturn {
    const { t } = useI18n()
    const { listMetadataDefinitions, deleteMetadataDefinition, updateMetadataDefinition } =
        useActivityMetadataDefinitionCRUD()

    const existingMetadataList = ref<IActivityMetadataDefinition[]>([])
    const defs = ref<ICreateActivityMetadataDefinitionRequest[]>([])

    async function syncExistingMetadata(serverId: string, activityId: string): Promise<void> {
        if (!serverId || !activityId) return

        try {
            const res = await listMetadataDefinitions(serverId, activityId)
            if (!res.error && res.data) {
                existingMetadataList.value = res.data
            }
        } catch (e) {
            console.error(t('messages.error.fetch'), e)
        }
    }

    async function removeExistingMetadata(
        serverId: string,
        activityId: string,
        id: string,
        onRemove?: () => void
    ): Promise<void> {
        if (!serverId || !activityId) return

        try {
            await deleteMetadataDefinition(serverId, activityId, id)
            await syncExistingMetadata(serverId, activityId)
            if (onRemove) {
                onRemove()
            }
        } catch (e) {
            console.error(t('messages.error.delete'), e)
        }
    }

    async function updateExistingMetadata(
        serverId: string,
        activityId: string,
        metadataId: string,
        payload: IUpdateActivityMetadataDefinitionRequest,
        onUpdate?: () => void
    ): Promise<void> {
        if (!serverId || !activityId || !metadataId) return

        try {
            await updateMetadataDefinition(serverId, activityId, metadataId, payload)
            await syncExistingMetadata(serverId, activityId)
            if (onUpdate) {
                onUpdate()
            }
        } catch (e) {
            console.error(t('messages.error.update'), e)
        }
    }

    function addDefinition(def: ICreateActivityMetadataDefinitionRequest): void {
        defs.value.push({
            key: def.key.trim(),
            label: def.label?.trim() || def.key.trim(),
            type: def.type,
            description: def.description?.trim() || undefined,
            required: !!def.required,
            allow_not_predefined_value: !!def.allow_not_predefined_value,
            choices: def.choices && def.choices.length ? [...def.choices] : undefined
        })
    }

    function removeDefinition(index: number): void {
        defs.value.splice(index, 1)
    }

    function clearPendingDefinitions(): void {
        defs.value = []
    }

    return {
        existingMetadataList,
        defs,
        syncExistingMetadata,
        removeExistingMetadata,
        updateExistingMetadata,
        addDefinition,
        removeDefinition,
        clearPendingDefinitions
    }
}
