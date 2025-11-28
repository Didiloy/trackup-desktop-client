<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ICreateActivityMetadataDefinitionRequest } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'

const emit = defineEmits<{
    (e: 'skip'): void
    (e: 'create', defs: ICreateActivityMetadataDefinitionRequest[]): void
}>()

const { t } = useI18n()
const { getMetadataTypes } = useActivityMetadataDefinitionCRUD()
const server_store = useServerStore()

const props = withDefaults(
    defineProps<{
        activityIdForTypes?: string | null
        loading?: boolean
    }>(),
    {
        activityIdForTypes: null,
        loading: false
    }
)

const type_options = ref<{ label: string; value: string }[]>([])
const loading_types = ref(false)
const types_error = ref<string | null>(null)

async function loadTypes(): Promise<void> {
    loading_types.value = true
    types_error.value = null
    try {
        const serverId = server_store.getPublicId
        if (serverId && props.activityIdForTypes) {
            const res = await getMetadataTypes(serverId, props.activityIdForTypes)
            if (res.error) {
                types_error.value = res.error
            } else if (res.data && Array.isArray(res.data)) {
                type_options.value = res.data.map((t) => ({ label: t, value: t }))
            }
        }
    } catch (e) {
        types_error.value = e instanceof Error ? e.message : 'Failed to load metadata types'
    } finally {
        // Fallback if nothing loaded
        if (!type_options.value.length) {
            type_options.value = [
                { label: 'STRING', value: 'STRING' },
                { label: 'NUMBER', value: 'NUMBER' },
                { label: 'BOOLEAN', value: 'BOOLEAN' },
                { label: 'DATE', value: 'DATE' }
            ]
        }
        // Ensure draft has a valid type
        if (!type_options.value.find((o) => o.value === draft.value.type)) {
            draft.value.type = type_options.value[0].value as any
        }
        loading_types.value = false
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
})

const new_choice = ref<string>('')

const canAdd = computed(() => {
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
            new_choice.value = ''
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
        draft.value.key = normalizeKeyFromLabel(val || '')
    }
)

function addChoice(): void {
    const raw = new_choice.value.trim()
    if (!raw) return
    const value = draft.value.type === 'NUMBER' ? Number(raw) : raw
    if (draft.value.type === 'NUMBER' && Number.isNaN(value)) return
    draft.value.choices = draft.value.choices || []
    draft.value.choices.push(value)
    new_choice.value = ''
}

function removeChoice(index: number): void {
    if (!draft.value.choices) return
    draft.value.choices.splice(index, 1)
}

function addDefinition(): void {
    if (!canAdd.value) return
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
    // reset draft
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

function removeDefinition(index: number): void {
    defs.value.splice(index, 1)
}

function submitMetadata(): void {
    emit('create', defs.value)
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
                    <label class="text-sm text-surface-500">{{
                        t('common.fields.type')
                    }}</label>
                    <Select
                        v-model="draft.type"
                        :options="type_options"
                        option-label="label"
                        option-value="value"
                        append-to="self"
                        class="w-full"
                    />
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{
                    t('common.fields.description')
                }}</label>
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
                        @keydown.enter="addChoice"
                        :type="draft.type === 'NUMBER' ? 'number' : 'text'"
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

            <div class="flex justify-center w-full">
                <Button
                    :label="t('views.activity.add_modal.metadata_validate')"
                    icon="pi pi-check"
                    class="w-full"
                    :disabled="!canAdd"
                    :style="{ background: 'var(--gradient-secondary)' }"
                    @click="addDefinition"
                />
            </div>
        </div>

        <!-- Definitions list -->
        <div v-if="defs.length" class="flex flex-col gap-2">
            <div class="text-sm font-medium text-surface-700">
                {{ t('views.activity.add_modal.metadata_list') }}
            </div>
            <div class="flex flex-col gap-2">
                <div
                    v-for="(d, idx) in defs"
                    :key="idx"
                    class="flex items-center justify-between p-2 rounded-md"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-surface-900">{{ d.key }}</span>
                        <span class="text-xs text-surface-600">({{ d.type }})</span>
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
                :loading="props.loading"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="submitMetadata"
            />
        </div>
    </div>
</template>
