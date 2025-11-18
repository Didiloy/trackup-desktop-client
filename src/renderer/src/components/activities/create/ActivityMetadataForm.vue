<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
    ICreateActivityMetadataDefinitionRequest
} from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

const emit = defineEmits<{
    (e: 'back'): void
    (e: 'skip'): void
    (e: 'next', defs: ICreateActivityMetadataDefinitionRequest[]): void
}>()

const { t } = useI18n()

// Static types (to avoid needing activityId before creation)
const typeOptions = [
    { label: 'STRING', value: 'STRING' },
    { label: 'NUMBER', value: 'NUMBER' },
    { label: 'BOOLEAN', value: 'BOOLEAN' },
    { label: 'DATE', value: 'DATE' }
]

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

const newChoice = ref<string>('')

const can_add = computed(() => {
    return !!draft.value.key.trim() && !!draft.value.type
})

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
    const value = newChoice.value.trim()
    if (!value) return
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
    defs.value.push({
        key: normalizeKeyFromLabel(draft.value.label || draft.value.key).trim(),
        label: draft.value.label?.trim() || draft.value.key.trim(),
        type: draft.value.type,
        description: draft.value.description?.trim() || undefined,
        required: !!draft.value.required,
        allow_not_predefined_value: !!draft.value.allow_not_predefined_value,
        choices: draft.value.choices && draft.value.choices.length ? [...draft.value.choices] : undefined
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

function onNext(): void {
    emit('next', defs.value)
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
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
                    {{ t('userInterface.serverActivitiesView.addActivityModal.metadataDescription') }}
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
                    <InputText v-model="draft.label" class="w-full" :pt="{ root: { style: background_style } }" />
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
                        :pt="{
                            root: { style: background_style },
                            list: { class: 'bg-surface-100' },
                            label: { style: background_style },
                            item: { class: 'text-surface-900 dark:text-surface-0' },
                            itemLabel: { class: 'text-surface-900 dark:text-surface-0' }
                        }"
                    />
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.description') }}</label>
                <Textarea
                    v-model="draft.description"
                    rows="2"
                    auto-resize
                    :pt="{ root: { style: background_style } }"
                />
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                    <Checkbox v-model="draft.required" binary />
                    <label class="text-sm text-surface-700">{{ t('userInterface.serverActivitiesView.addActivityModal.metadataRequired') }}</label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="draft.allow_not_predefined_value" binary />
                    <label class="text-sm text-surface-700">{{ t('userInterface.serverActivitiesView.addActivityModal.metadataAllowNotPredefined') }}</label>
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
                        :pt="{ root: { style: background_style } }"
                        :placeholder="t('placeholder.enter')"
                    />
                    <Button
                        icon="pi pi-plus"
                        :label="t('actions.add')"
                        outlined
                        @click="addChoice"
                    />
                </div>
                <div v-if="draft.choices && draft.choices.length" class="flex flex-wrap gap-2">
                    <div
                        v-for="(c, idx) in draft.choices"
                        :key="idx"
                        class="px-2 py-1 rounded-md text-xs"
                        :style="background_style"
                    >
                        <span class="mr-2">{{ c }}</span>
                        <Button icon="pi pi-times" text rounded size="small" @click="removeChoice(idx)" />
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <Button
                    :label="t('userInterface.serverActivitiesView.addActivityModal.metadataValidate')"
                    icon="pi pi-plus"
                    :disabled="!can_add"
                    outlined
                    @click="addDefinition"
                />
            </div>
        </div>

        <!-- Definitions list -->
        <div v-if="defs.length" class="flex flex-col gap-2">
            <div class="text-sm font-medium text-surface-700">
                {{ t('userInterface.serverActivitiesView.addActivityModal.metadataList') }}
            </div>
            <div class="flex flex-col gap-2">
                <div
                    v-for="(d, idx) in defs"
                    :key="idx"
                    class="flex items-center justify-between p-2 rounded-md"
                    :style="background_style"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-surface-900">{{ d.key }}</span>
                        <span class="text-xs text-surface-600">({{ d.type }})</span>
                        <span v-if="d.required" class="text-xs text-primary-600">• {{ t('common.required') }}</span>
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

        <div class="flex justify-between gap-2 pt-2 mt-auto">
            <div class="flex gap-2">
                <Button :label="t('common.back')" text @click="emit('back')" />
            </div>
            <div class="flex gap-2">
                <Button :label="t('common.skip')" severity="secondary" text @click="emit('skip')" />
                <Button
                    :label="t('common.next')"
                    :style="{ background: 'var(--gradient-primary)' }"
                    @click="onNext"
                />
            </div>
        </div>
    </div>
</template>


