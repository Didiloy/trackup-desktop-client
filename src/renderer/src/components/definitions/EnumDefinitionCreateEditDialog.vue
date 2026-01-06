<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useEnumDefinitionCRUD } from '@/composables/enum-definitions/useEnumDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type {
    ICreateEnumDefinitionRequest,
    IEnumDefinition,
    IUpdateEnumDefinitionRequest,
    IEnumValueUpdate
} from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import EnumDefinitionsIcon from '@/components/common/icons/EnumDefinitionsIcon.vue'

const MAX_VALUES_PER_CHUNK = 5

const props = defineProps<{
    modelValue: boolean
    definitionToEdit?: IEnumDefinition | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'created'): void
    (e: 'updated'): void
}>()

const { t } = useI18n()
const toast = useToast()
const server_store = useServerStore()
const { createEnumDefinition, updateEnumDefinition } = useEnumDefinitionCRUD()

const name = ref('')
const description = ref('')
const choices = ref<string[]>([''])
const loading = ref(false)

const isEditing = computed(() => !!props.definitionToEdit)

function resetForm() {
    name.value = ''
    description.value = ''
    choices.value = ['']
}

function flattenDefinitionValues(definition?: IEnumDefinition | null): string[] {
    if (!definition?.values?.length) return []
    const flattened: string[] = []
    definition.values.forEach((valueObj) => {
        for (let i = 1; i <= MAX_VALUES_PER_CHUNK; i++) {
            const key = `value${i}` as keyof typeof valueObj
            const val = valueObj[key]
            if (typeof val === 'string' && val.trim()) {
                flattened.push(val)
            }
        }
    })
    return flattened
}

watch(
    () => props.definitionToEdit,
    (def) => {
        if (def) {
            name.value = def.name
            description.value = def.description ?? ''
            const flattened = flattenDefinitionValues(def)
            choices.value = flattened.length ? flattened : ['']
        } else {
            resetForm()
        }
    },
    { immediate: true }
)

function addChoice() {
    choices.value.push('')
}

function removeChoice(index: number) {
    if (choices.value.length > 1) {
        choices.value.splice(index, 1)
    }
}

const canSubmit = computed(() => {
    return name.value.trim() !== '' && choices.value.filter((c) => c.trim() !== '').length >= 1
})

async function handleSubmit() {
    if (!canSubmit.value || !server_store.getPublicId) return

    loading.value = true
    try {
        const valuesArray = choices.value.map((c) => c.trim()).filter((label) => label !== '')

        if (isEditing.value && props.definitionToEdit) {
            const existingChunks = props.definitionToEdit.values ?? []
            const totalSlots = existingChunks.length * MAX_VALUES_PER_CHUNK

            if (valuesArray.length > totalSlots) {
                toast.add({
                    severity: 'warn',
                    summary: t('messages.error.update'),
                    detail: t('views.server_enum_definitions.create_modal.max_chunk_warning'),
                    life: 3000
                })
                return
            }

            const valueUpdates: IEnumValueUpdate[] = []
            let valueIndex = 0

            for (const chunk of existingChunks) {
                for (let i = 1; i <= MAX_VALUES_PER_CHUNK; i++) {
                    const key = `value${i}` as 'value1' | 'value2' | 'value3' | 'value4' | 'value5'
                    const newValue = valuesArray[valueIndex]
                    if (typeof newValue !== 'undefined') {
                        valueUpdates.push({
                            enum_value_id: chunk.public_id,
                            key,
                            value: newValue
                        })
                        valueIndex++
                    } else if (chunk[key]) {
                        valueUpdates.push({
                            enum_value_id: chunk.public_id,
                            key,
                            value: ''
                        })
                    }
                }
            }

            const payload: IUpdateEnumDefinitionRequest = {
                name: name.value.trim(),
                description: description.value.trim(),
                value_updates: valueUpdates
            }

            const res = await updateEnumDefinition(
                server_store.getPublicId,
                props.definitionToEdit.public_id,
                payload
            )
            if (res.error) throw new Error(res.error)

            toast.add({ severity: 'success', summary: t('messages.success.update'), life: 3000 })
            emit('updated')
        } else {
            const payload: ICreateEnumDefinitionRequest = {
                name: name.value.trim(),
                description: description.value.trim(),
                values: valuesArray
            }

            const res = await createEnumDefinition(server_store.getPublicId, payload)
            if (res.error) throw new Error(res.error)

            toast.add({ severity: 'success', summary: t('messages.success.create'), life: 3000 })
            emit('created')
        }

        handleClose()
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: isEditing.value ? t('messages.error.update') : t('messages.error.create'),
            detail: e instanceof Error ? e.message : 'Unknown error',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

function handleClose() {
    resetForm()
    emit('update:modelValue', false)
}
</script>

<template>
    <AppDialog
        :model-value="modelValue"
        class="w-500 max-w-lg"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <template #header>
            <div class="flex flex-col gap-2 p-3">
                <div class="flex items-center gap-2">
                    <EnumDefinitionsIcon />
                    <span class="font-semibold text-surface-900">
                        {{
                            isEditing
                                ? t('common.actions.update', {
                                      entity: t(
                                          'views.server_enum_definitions.entity_name',
                                          'Definition'
                                      )
                                  })
                                : t('views.server_enum_definitions.create_modal.title')
                        }}
                    </span>
                </div>
                <span class="text-xs text-surface-600">
                    {{ t('views.server_enum_definitions.create_modal.subtitle') }}
                </span>
            </div>
        </template>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-surface-700">
                    <i class="pi pi-file-edit text-surface-500 mr-1"></i>
                    {{ t('common.fields.name') }}
                    <span class="text-red-500">*</span>
                </span>
                <InputText
                    v-model="name"
                    :placeholder="t('views.server_enum_definitions.create_modal.name_placeholder')"
                    class="w-full"
                />
            </div>

            <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-surface-700">
                    <i class="pi pi-pen-to-square text-surface-500 mr-1"></i>
                    {{ t('common.fields.description') }}
                </span>
                <Textarea
                    v-model="description"
                    rows="2"
                    auto-resize
                    :placeholder="
                        t('views.server_enum_definitions.create_modal.description_placeholder')
                    "
                    class="w-full"
                />
            </div>

            <div class="flex flex-col gap-2">
                <label class="flex justify-between items-center">
                    <span class="text-sm font-medium text-surface-700">
                        <i class="pi pi-check text-surface-500 mr-1"></i>
                        {{ t('common.fields.choices') }}
                    </span>
                    <Button icon="pi pi-plus" size="small" text rounded @click="addChoice" />
                </label>

                <div class="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
                    <div v-for="(_, index) in choices" :key="index" class="flex items-center gap-2">
                        <span class="text-xs text-surface-800 w-6 text-right"
                            >{{ index + 1 }}.</span
                        >
                        <InputText
                            v-model="choices[index]"
                            :placeholder="
                                t('views.server_enum_definitions.create_modal.choices_placeholder')
                            "
                            class="flex-1 p-inputtext-sm"
                            @keydown.enter.prevent="addChoice"
                        />
                        <Button
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            rounded
                            size="small"
                            :disabled="choices.length <= 1"
                            @click="removeChoice(index)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    :label="t('common.actions.cancel')"
                    severity="secondary"
                    text
                    @click="handleClose"
                />
                <Button
                    :label="isEditing ? t('common.actions.save') : t('common.actions.create')"
                    :loading="loading"
                    :disabled="!canSubmit"
                    @click="handleSubmit"
                />
            </div>
        </template>
    </AppDialog>
</template>
