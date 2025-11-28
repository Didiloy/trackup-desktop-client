<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ICreateActivityMetadataDefinitionRequest, IUpdateActivityMetadataDefinitionRequest, IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'

const emit = defineEmits<{
    (e: 'skip'): void
    (e: 'create', defs: ICreateActivityMetadataDefinitionRequest[]): void
}>()

const { t } = useI18n()
const { getMetadataTypes, listMetadataDefinitions, deleteMetadataDefinition, updateMetadataDefinition } = useActivityMetadataDefinitionCRUD()
const server_store = useServerStore()

const props = withDefaults(
    defineProps<{
        activityIdForTypes?: string | null
        loading?: boolean
        modify?: boolean
    }>(),
    {
        activityIdForTypes: null,
        loading: false,
        modify: false
    }
)

const existingMetadataList = ref<IActivityMetadataDefinition[]>([])
const editingMetadataId = ref<string | null>(null)

async function syncExistingMetadata(): Promise<void> {
    if (!props.activityIdForTypes) return
    const serverId = server_store.getPublicId
    if (!serverId) return
    try {
        const res = await listMetadataDefinitions(serverId, props.activityIdForTypes)
        if (!res.error && res.data) {
            existingMetadataList.value = res.data
        }
    } catch (e) {
        console.error('Failed to sync metadata', e)
    }
}

async function removeExistingMetadata(id: string): Promise<void> {
    if (!props.activityIdForTypes) return
    const serverId = server_store.getPublicId
    if (!serverId) return
    try {
        await deleteMetadataDefinition(serverId, props.activityIdForTypes, id)
        await syncExistingMetadata()
        if (editingMetadataId.value === id) {
            resetDraft()
        }
    } catch (e) {
        console.error('Failed to delete metadata', e)
    }
}

function editExistingMetadata(meta: IActivityMetadataDefinition): void {
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

function resetDraft(): void {
    editingMetadataId.value = null
    draft.value = {
        key: '',
        label: '',
        type: 'STRING' as any,
        description: '',
        required: false,
        allow_not_predefined_value: true,
        choices: []
    }
}

async function updateExistingMetadata(): Promise<void> {
    if (!editingMetadataId.value || !props.activityIdForTypes) return
    const serverId = server_store.getPublicId
    if (!serverId) return

    const payload: IUpdateActivityMetadataDefinitionRequest = {
        label: draft.value.label?.trim(),
        description: draft.value.description?.trim(),
        required: draft.value.required,
        allow_not_predefined_value: draft.value.allow_not_predefined_value,
        choices: draft.value.choices?.map((c) => c.toString())
    }

    try {
        await updateMetadataDefinition(serverId, props.activityIdForTypes, editingMetadataId.value, payload)
        await syncExistingMetadata()
        resetDraft()
    } catch (e) {
        console.error('Failed to update metadata', e)
    }
}

const typeOptions = ref<{ label: string; value: string }[]>([])
const loadingTypes = ref(false)
const typesError = ref<string | null>(null)

async function loadTypes(): Promise<void> {
    loadingTypes.value = true
    typesError.value = null
    try {
        const serverId = server_store.getPublicId
        if (serverId && props.activityIdForTypes) {
            const res = await getMetadataTypes(serverId, props.activityIdForTypes)
            if (res.error) {
                typesError.value = res.error
            } else if (res.data && Array.isArray(res.data)) {
                typeOptions.value = res.data.map((t) => ({ label: t, value: t }))
            }
        }
    } catch (e) {
        typesError.value = e instanceof Error ? e.message : 'Failed to load metadata types'
    } finally {
        // Fallback if nothing loaded
        if (!typeOptions.value.length) {
            typeOptions.value = [
                { label: 'STRING', value: 'STRING' },
                { label: 'NUMBER', value: 'NUMBER' },
                { label: 'BOOLEAN', value: 'BOOLEAN' },
                { label: 'DATE', value: 'DATE' }
            ]
        }
        // Ensure draft has a valid type
        if (!typeOptions.value.find((o) => o.value === draft.value.type)) {
            draft.value.type = typeOptions.value[0].value as any
        }
        loadingTypes.value = false
    }
}

const defs = ref<ICreateActivityMetadataDefinitionRequest[]>([])

const draft = ref<ICreateActivityMetadataDefinitionRequest>({
    key: '',
    label: '',
    type: 'STRING' as any,
    description: '',
    required: false,
    allow_not_predefined_value: true,
    choices: []
})

onMounted(async () => {
    await loadTypes()
    if (props.modify) {
        await syncExistingMetadata()
    }
})

const newChoice = ref<string>('')

const can_add = computed(() => {
    return !!draft.value.key.trim() && !!draft.value.type
})

const canUseChoices = computed(() => {
    const type = draft.value.type
    return type !== 'BOOLEAN' && type !== 'DATE'
})

watch(
    () => [draft.value.type, draft.value.allow_not_predefined_value],
    () => {
        if (!canUseChoices.value) {
            draft.value.choices = []
            newChoice.value = ''
        }
    }
)

function normalizeKeyFromLabel(label: string): string {
    if (!label) return ''
    // remove accents
    const noAccents = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // replace spaces with underscores, to lowercase
    return noAccents.trim().replace(/\s+/g, '_').toLowerCase()
}

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
    const raw = newChoice.value.trim()
    if (!raw) return
    const value = draft.value.type === 'NUMBER' ? Number(raw) : raw
    if (draft.value.type === 'NUMBER' && Number.isNaN(value)) return
    draft.value.choices = draft.value.choices || []
    draft.value.choices.push(value)
    newChoice.value = ''
}

function removeChoice(index: number): void {
    if (!draft.value.choices) return
    draft.value.choices.splice(index, 1)
}

function addDefinition(): void {
    if (!can_add.value) return
    
    // If editing, we handle update logic instead of adding to draft list
    if (editingMetadataId.value) {
        updateExistingMetadata()
        return
    }

    defs.value.push({
        key: normalizeKeyFromLabel(draft.value.label || draft.value.key).trim(),
        label: draft.value.label?.trim() || draft.value.key.trim(),
        type: draft.value.type,
        description: draft.value.description?.trim() || undefined,
        required: !!draft.value.required,
        allow_not_predefined_value: !!draft.value.allow_not_predefined_value,
        choices:
            draft.value.choices && draft.value.choices.length ? [...draft.value.choices] : undefined
    })
    resetDraft()
}

function removeDefinition(index: number): void {
    defs.value.splice(index, 1)
}

function submitMetadata(): void {
    emit('create', defs.value)
}

function handleCancelEdit(): void {
    resetDraft()
}
</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <div class="flex items-center gap-2">
            <i class="pi pi-database text-surface-500"></i>
            <div class="flex flex-col">
                <span class="text-sm font-medium text-surface-700">
                    {{ t('userInterface.serverActivitiesView.addActivityModal.metadataTitle') }}
                </span>
                <span class="text-xs text-surface-500">
                    {{
                        t('userInterface.serverActivitiesView.addActivityModal.metadataDescription')
                    }}
                </span>
                <span class="text-xs text-surface-500">
                    {{
                        t(
                            'userInterface.serverActivitiesView.addActivityModal.metadataDescriptionDetail'
                        )
                    }}
                </span>
            </div>
        </div>

        <!-- Draft form -->
        <div class="grid grid-cols-1 gap-3">
            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.metadataLabel')
                    }}</label>
                    <InputText v-model="draft.label" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.metadataType')
                    }}</label>
                    <Select
                        v-model="draft.type"
                        :options="typeOptions"
                        option-label="label"
                        option-value="value"
                        append-to="self"
                        class="w-full"
                        :disabled="!!editingMetadataId" 
                    />
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.description') }}</label>
                <Textarea v-model="draft.description" rows="2" auto-resize />
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                    <Checkbox v-model="draft.required" binary />
                    <label class="text-sm text-surface-700">{{
                        t('userInterface.serverActivitiesView.addActivityModal.metadataRequired')
                    }}</label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="draft.allow_not_predefined_value"
                        binary
                        :disabled="!canUseChoices"
                    />
                    <label class="text-sm text-surface-700">{{
                        t(
                            'userInterface.serverActivitiesView.addActivityModal.metadataAllowNotPredefined'
                        )
                    }}</label>
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{
                    t('userInterface.serverActivitiesView.addActivityModal.metadataChoices')
                }}</label>
                <div class="flex gap-2">
                    <InputText
                        v-model="newChoice"
                        class="flex-1"
                        :placeholder="t('placeholder.enter')"
                        :disabled="!canUseChoices"
                        @keydown.enter="addChoice"
                        :type="draft.type === 'NUMBER' ? 'number' : 'text'"
                    />
                    <Button
                        v-tooltip.top="
                            draft.type === 'BOOLEAN' || draft.type === 'DATE'
                                ? t(
                                      'userInterface.serverActivitiesView.addActivityModal.notPossibleWithType'
                                  )
                                : t(
                                      'userInterface.serverActivitiesView.addActivityModal.metadataAddChoice'
                                  )
                        "
                        icon="pi pi-plus"
                        outlined
                        :disabled="!canUseChoices"
                        @click="addChoice"
                    />
                </div>
                <div
                    v-if="canUseChoices && draft.choices && draft.choices.length"
                    class="flex flex-wrap gap-2"
                >
                    <!-- using a timestamp to avoid key issues -->
                    <Chip
                        v-for="(c, idx) in draft.choices"
                        :key="idx + Date.now().toString()"
                        :label="c.toString()"
                        removable
                        :style="{
                            background: 'var(--p-surface-200)',
                            color: 'var(--p-surface-900)'
                        }"
                        @remove="removeChoice(idx)"
                    />
                </div>
            </div>

            <div class="flex justify-center w-full gap-2">
                <Button
                   v-if="editingMetadataId"
                   :label="t('actions.cancel')"
                   icon="pi pi-times"
                   severity="secondary"
                   outlined
                   class="w-1/2"
                   @click="handleCancelEdit"
                />
                <Button
                    :label="editingMetadataId ? t('actions.update', { entity: 'Metadata' }) : t('userInterface.serverActivitiesView.addActivityModal.metadataValidate')"
                    :icon="editingMetadataId ? 'pi pi-save' : 'pi pi-check'"
                    class="w-full"
                    :class="editingMetadataId ? 'w-1/2' : ''"
                    :disabled="!can_add"
                    :style="{ background: 'var(--gradient-secondary)' }"
                    @click="addDefinition"
                />
            </div>
        </div>

        <!-- Definitions list -->
        <div v-if="defs.length || existingMetadataList.length" class="flex flex-col gap-2">
            <div class="text-sm font-medium text-surface-700">
                {{ t('userInterface.serverActivitiesView.addActivityModal.metadataList') }}
            </div>
            <div class="flex flex-col gap-2">
                <!-- Existing Metadata -->
                 <div
                    v-for="meta in existingMetadataList"
                    :key="meta.public_id"
                    class="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-surface-200 transition-colors"
                    :class="editingMetadataId === meta.public_id ? 'bg-primary-50 border border-primary-200' : 'bg-surface-100 opacity-75'"
                    @click="editExistingMetadata(meta)"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-surface-900 font-medium">{{ meta.key }}</span>
                        <span class="text-xs text-surface-600">({{ meta.type }})</span>
                        <span v-if="meta.required" class="text-xs text-primary-600"
                            >• {{ t('common.required') }}</span
                        >
                    </div>
                    <div class="flex items-center gap-2">
                        <i v-if="editingMetadataId === meta.public_id" class="pi pi-pencil text-primary-500 text-sm"></i>
                        <Button
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            rounded
                            size="small"
                            @click.stop="removeExistingMetadata(meta.public_id)"
                        />
                    </div>
                </div>

                <!-- New Metadata (Drafts) -->
                <div
                    v-for="(d, idx) in defs"
                    :key="idx"
                    class="flex items-center justify-between p-2 rounded-md bg-surface-50 border border-surface-200"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-surface-900">{{ d.key }}</span>
                        <span class="text-xs text-surface-600">({{ d.type }})</span>
                        <span v-if="d.required" class="text-xs text-primary-600"
                            >• {{ t('common.required') }}</span
                        >
                    </div>
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        size="small"
                        @click="removeDefinition(idx)"
                    />
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 mt-auto">
            <Button :label="t('common.skip')" severity="secondary" text @click="emit('skip')" />
            <Button
                :label="t('common.create')"
                :loading="props.loading"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="submitMetadata"
            />
        </div>
    </div>
</template>
