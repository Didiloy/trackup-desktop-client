<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
    IActivityMetadataDefinition,
    ICreateActivityMetadataDefinitionRequest,
    IUpdateActivityMetadataDefinitionRequest
} from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useActivityMetadataDefinitionTypes } from '@/composables/activities/metadata/useActivityMetadataDefinitionTypes'
import { useActivityMetadataDefinitionDraft } from '@/composables/activities/metadata/useActivityMetadataDefinitionDraft'
import { useActivityMetadataDefinitionList } from '@/composables/activities/metadata/useActivityMetadataDefinitionList'
import { useServerStore } from '@/stores/server'
import { useToast } from 'primevue/usetoast'

const emit = defineEmits<{
    (e: 'skip'): void
    (e: 'success'): void
}>()

const { t, te } = useI18n()
const toast = useToast()
const { createMetadataDefinition } = useActivityMetadataDefinitionCRUD()
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

// Use the composables
const { type_options, loadTypes } = useActivityMetadataDefinitionTypes()

const {
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
} = useActivityMetadataDefinitionDraft()

const {
    existingMetadataList,
    defs,
    syncExistingMetadata,
    removeExistingMetadata,
    updateExistingMetadata,
    addDefinition,
    removeDefinition
} = useActivityMetadataDefinitionList()

const submitting = ref(false)

onMounted(async () => {
    if (props.activityIdForTypes) {
        const serverId = server_store.getPublicId
        if (serverId) {
            await loadTypes(serverId, props.activityIdForTypes)
            // Ensure draft has a valid type after loading
            ensureValidType(type_options.value.map((o) => o.value))

            if (props.modify) {
                await syncExistingMetadata(serverId, props.activityIdForTypes)
            }
        }
    }
})

function editExistingMetadata(meta: IActivityMetadataDefinition): void {
    loadDraftFromDefinition(meta)
}

async function handleRemoveExisting(id: string): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId || !props.activityIdForTypes) return

    await removeExistingMetadata(serverId, props.activityIdForTypes, id, () => {
        if (editingMetadataId.value === id) {
            resetDraft()
        }
    })
}

async function handleUpdateExisting(): Promise<void> {
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

    await updateExistingMetadata(
        serverId,
        props.activityIdForTypes,
        editingMetadataId.value,
        payload,
        resetDraft
    )
}

function handleAddDefinition(): void {
    if (!canAdd.value) return

    // If editing existing metadata, update instead of adding
    if (editingMetadataId.value) {
        handleUpdateExisting()
        return
    }

    const choicesToSave =
        draft.value.choices && draft.value.choices.length
            ? draft.value.choices.map((c) => (typeof c === 'number' ? c : String(c)))
            : undefined

    addDefinition({
        key: normalizeKeyFromLabel(draft.value.label || draft.value.key),
        label: draft.value.label,
        type: draft.value.type,
        description: draft.value.description,
        required: draft.value.required,
        allow_not_predefined_value: draft.value.allow_not_predefined_value,
        choices: choicesToSave
    })

    resetDraft()
}

function handleCancelEdit(): void {
    resetDraft()
}

async function onSubmit(): Promise<void> {
    if (defs.value.length === 0) {
        emit('success')
        return
    }

    submitting.value = true
    try {
        const serverId = server_store.getPublicId
        if (!serverId || !props.activityIdForTypes) {
            throw new Error(t('messages.error.noServerSelected'))
        }

        for (const def of defs.value) {
            const payload: ICreateActivityMetadataDefinitionRequest = {
                key: def.key,
                label: def.label,
                type: def.type,
                description: def.description,
                required: def.required,
                allow_not_predefined_value: def.allow_not_predefined_value,
                choices: def.choices ? [...def.choices] : undefined
            }
            const res = await createMetadataDefinition(serverId, props.activityIdForTypes, payload)
            if (res.error) {
                throw new Error(res.error)
            }
        }

        toast.add({ severity: 'success', summary: t('messages.success.create'), life: 2500 })
        emit('success')
    } catch (e) {
        const message = e instanceof Error ? e.message : t('messages.error.create')
        toast.add({ severity: 'error', summary: message, life: 3000 })
    } finally {
        submitting.value = false
    }
}

function formatTypeLabel(type?: string): string {
    if (!type) return ''
    const key = `views.activity.add_modal.metadata_type_${String(type).toLowerCase()}`
    return te(key) ? t(key) : String(type)
}
</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <div class="flex items-center gap-2">
            <i class="pi pi-database text-surface-500"></i>
            <div class="flex flex-col">
                <span class="text-sm font-medium text-surface-700">
                    {{ t('views.activity.add_modal.metadata_title') }}
                </span>
                <span class="text-xs text-surface-500">
                    {{ t('views.activity.add_modal.metadata_description') }}
                </span>
                <span class="text-xs text-surface-500">
                    {{ t('views.activity.add_modal.metadata_description_detail') }}
                </span>
            </div>
        </div>

        <!-- Draft form -->
        <div class="grid grid-cols-1 gap-3">
            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('views.activity.add_modal.metadata_label')
                    }}</label>
                    <InputText v-model="draft.label" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{ t('common.fields.type') }}</label>
                    <Select
                        v-model="draft.type"
                        :options="type_options"
                        option-label="label"
                        option-value="value"
                        append-to="self"
                        class="w-full"
                        :disabled="!!editingMetadataId"
                    />
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.fields.description') }}</label>
                <Textarea v-model="draft.description" rows="2" auto-resize />
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                    <Checkbox v-model="draft.required" binary />
                    <label class="text-sm text-surface-700">{{
                        t('views.activity.add_modal.metadata_required')
                    }}</label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox
                        v-model="draft.allow_not_predefined_value"
                        binary
                        :disabled="!canUseChoices"
                    />
                    <label class="text-sm text-surface-700">{{
                        t('views.activity.add_modal.metadata_allow_not_predefined')
                    }}</label>
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{
                    t('views.activity.add_modal.metadata_choices')
                }}</label>
                <div class="flex gap-2">
                    <InputText
                        v-model="new_choice"
                        class="flex-1"
                        :placeholder="t('placeholder.enter')"
                        :disabled="!canUseChoices"
                        :type="draft.type === 'NUMBER' ? 'number' : 'text'"
                        @keydown.enter="addChoice"
                    />
                    <Button
                        v-tooltip.top="
                            draft.type === 'BOOLEAN' || draft.type === 'DATE'
                                ? t('views.activity.add_modal.not_possible_with_type')
                                : t('views.activity.add_modal.metadata_add_choice')
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
                    <Chip
                        v-for="(c, idx) in draft.choices"
                        :key="`choice-${idx}`"
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
                    :label="t('common.actions.cancel')"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    class="w-1/2"
                    @click="handleCancelEdit"
                />
                <Button
                    :label="
                        editingMetadataId
                            ? t('common.actions.update')
                            : t('views.activity.add_modal.metadata_validate')
                    "
                    :icon="editingMetadataId ? 'pi pi-save' : 'pi pi-check'"
                    class="w-full"
                    :class="editingMetadataId ? 'w-1/2' : ''"
                    :disabled="!canAdd"
                    :style="{ background: 'var(--gradient-secondary)' }"
                    @click="handleAddDefinition"
                />
            </div>
        </div>

        <!-- Definitions list -->
        <div v-if="defs.length || existingMetadataList.length" class="flex flex-col gap-2">
            <div class="text-sm font-medium text-surface-700">
                {{ t('views.activity.add_modal.metadata_list') }}
            </div>
            <div class="flex flex-col gap-2">
                <!-- Existing Metadata -->
                <div
                    v-for="meta in existingMetadataList"
                    :key="meta.public_id"
                    class="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-surface-200 transition-colors"
                    :class="
                        editingMetadataId === meta.public_id
                            ? 'bg-primary-50 border border-primary-200'
                            : 'bg-surface-100 opacity-75'
                    "
                    @click="editExistingMetadata(meta)"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-surface-900 font-medium">{{ meta.key }}</span>
                        <span class="text-xs text-surface-600"
                            >({{ formatTypeLabel(meta.type) }})</span
                        >
                        <span v-if="meta.required" class="text-xs text-primary-600"
                            >• {{ t('common.fields.required') }}</span
                        >
                    </div>
                    <div class="flex items-center gap-2">
                        <i
                            v-if="editingMetadataId === meta.public_id"
                            class="pi pi-pencil text-primary-500 text-sm"
                        ></i>
                        <Button
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            rounded
                            size="small"
                            @click.stop="handleRemoveExisting(meta.public_id)"
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
                        <span class="text-xs text-surface-600"
                            >({{ formatTypeLabel(d.type) }})</span
                        >
                        <span v-if="d.required" class="text-xs text-primary-600"
                            >• {{ t('common.fields.required') }}</span
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
            <Button
                :label="t('common.actions.skip')"
                severity="secondary"
                text
                @click="emit('skip')"
            />
            <Button
                :label="t('common.actions.create')"
                :loading="submitting"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onSubmit"
            />
        </div>
    </div>
</template>
