import { ref, computed, watch } from 'vue'
import type {
    ICreateActivityMetadataDefinitionRequest,
    IActivityMetadataDefinition,
    ActivityMetadataType
} from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

export function useActivityMetadataDefinitionDraft() {
    const draft = ref<ICreateActivityMetadataDefinitionRequest>({
        key: '',
        label: '',
        type: 'STRING' as ActivityMetadataType,
        description: '',
        required: false,
        allow_not_predefined_value: true,
        choices: []
    })

    const new_choice = ref<string>('')
    const editingMetadataId = ref<string | null>(null)

    const canAdd = computed(() => {
        return !!draft.value.key.trim() && !!draft.value.type
    })

    const canUseChoices = computed(() => {
        const type = draft.value.type
        return type !== 'BOOLEAN' && type !== 'DATE'
    })

    // Watch for type changes and clear choices if needed
    watch(
        () => [draft.value.type, draft.value.allow_not_predefined_value],
        () => {
            if (!canUseChoices.value) {
                draft.value.choices = []
                new_choice.value = ''
            }
        }
    )

    function normalizeKeyFromLabel(label: string): string {
        if (!label) return ''
        // Remove accents
        const noAccents = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        // Replace spaces with underscores, to lowercase
        return noAccents.trim().replace(/\s+/g, '_').toLowerCase()
    }

    // Watch label changes to update key (only when not editing)
    watch(
        () => draft.value.label,
        (val) => {
            // Only update key if not editing an existing metadata (where key is fixed)
            if (!editingMetadataId.value) {
                draft.value.key = normalizeKeyFromLabel(val || '')
            }
        }
    )

    function addChoice(): void {
        const raw = new_choice.value.trim()
        if (!raw) return

        const value = draft.value.type === 'NUMBER' ? Number(raw) : raw
        if (draft.value.type === 'NUMBER' && Number.isNaN(value)) return

        // Create a new array instead of mutating directly
        if (!draft.value.choices) {
            draft.value.choices = []
        }
        draft.value.choices = [...draft.value.choices, value]
        new_choice.value = ''
    }

    function removeChoice(index: number): void {
        if (!draft.value.choices) return
        draft.value.choices.splice(index, 1)
    }

    function resetDraft(): void {
        editingMetadataId.value = null
        draft.value = {
            key: '',
            label: '',
            type: 'STRING' as ActivityMetadataType,
            description: '',
            required: false,
            allow_not_predefined_value: true,
            choices: []
        }
        new_choice.value = ''
    }

    function loadDraftFromDefinition(meta: IActivityMetadataDefinition): void {
        editingMetadataId.value = meta.public_id
        draft.value = {
            key: meta.key,
            label: meta.label || '',
            type: meta.type,
            description: meta.description || '',
            required: meta.required,
            allow_not_predefined_value: meta.allow_not_predefined_value,
            choices: meta.choices?.map(String) || []
        }
    }

    function ensureValidType(validTypes: string[]): void {
        if (!validTypes.find((t) => t === draft.value.type)) {
            draft.value.type = (validTypes[0] as ActivityMetadataType) || 'STRING'
        }
    }

    return {
        draft,
        new_choice,
        editingMetadataId,
        canAdd,
        canUseChoices,
        addChoice,
        removeChoice,
        resetDraft,
        loadDraftFromDefinition,
        normalizeKeyFromLabel,
        ensureValidType
    }
}
