import { ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { getMetadataTypeTranslationKey } from '@/utils/metadata.utils'
import type { ActivityMetadataType } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

interface TypeOption {
    label: string
    value: string
}

interface UseActivityMetadataDefinitionTypesReturn {
    type_options: Ref<TypeOption[]>
    loading_types: Ref<boolean>
    types_error: Ref<string | null>
    loadTypes: (serverId: string, activityId: string) => Promise<void>
}

export function useActivityMetadataDefinitionTypes(): UseActivityMetadataDefinitionTypesReturn {
    const { t, te } = useI18n()
    const { getMetadataTypes } = useActivityMetadataDefinitionCRUD()

    const type_options = ref<TypeOption[]>([])
    const loading_types = ref(false)
    const types_error = ref<string | null>(null)

    const getFallbackTypes = (): TypeOption[] => {
        const types: ActivityMetadataType[] = ['STRING', 'NUMBER', 'BOOLEAN', 'DATE']
        return types.map((type) => ({
            label: t(getMetadataTypeTranslationKey(type)),
            value: type
        }))
    }

    const loadTypes = async (serverId: string, activityId: string): Promise<void> => {
        loading_types.value = true
        types_error.value = null

        try {
            const res = await getMetadataTypes(serverId, activityId)
            if (res.error) {
                types_error.value = res.error
            } else if (res.data && Array.isArray(res.data)) {
                // Map API-provided types to options with translated labels when available
                type_options.value = res.data.map((val) => {
                    const upper = String(val).toUpperCase() as ActivityMetadataType
                    const key = getMetadataTypeTranslationKey(upper)
                    return {
                        label: te(key) ? t(key) : String(val),
                        value: upper
                    }
                })
            }
        } catch (e) {
            types_error.value = e instanceof Error ? e.message : t('messages.error.fetch')
        } finally {
            // Use fallback types if nothing was loaded
            if (!type_options.value.length) {
                type_options.value = getFallbackTypes()
            }
            loading_types.value = false
        }
    }

    return {
        type_options,
        loading_types,
        types_error,
        loadTypes
    }
}
