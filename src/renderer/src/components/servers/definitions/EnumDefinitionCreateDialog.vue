<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type { ICreateEnumDefinitionRequest } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'

defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'created'): void
}>()

const { t } = useI18n()
const toast = useToast()
const server_store = useServerStore()
const { createEnumDefinition } = useEnumDefinitionCRUD()

const name = ref('')
const description = ref('')
const choices = ref<string[]>([''])
const loading = ref(false)

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

        const payload: ICreateEnumDefinitionRequest = {
            name: name.value.trim(),
            description: description.value.trim(),
            values: valuesArray
        }

        const res = await createEnumDefinition(server_store.getPublicId, payload)

        if (res.error) {
            throw new Error(res.error)
        }

        toast.add({
            severity: 'success',
            summary: t('messages.success.create'),
            life: 3000
        })
        emit('created')
        handleClose()
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.create'),
            detail: e instanceof Error ? e.message : 'Unknown error',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

function handleClose() {
    name.value = ''
    description.value = ''
    choices.value = ['']
    emit('update:modelValue', false)
}
</script>

<template>
    <AppDialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
        <template #header>
            <div class="flex flex-col gap-2 p-3">
                <div class="flex items-center gap-2">
                    <i class="pi pi-plus-circle text-primary-500"></i>
                    <span class="font-semibold text-surface-900">
                        {{ t('views.server_definitions.create_modal.title') }}
                    </span>
                </div>
                <span class="text-xs text-surface-600">
                    {{ t('views.server_definitions.create_modal.subtitle') }}
                </span>
            </div>
        </template>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-surface-700 dark:text-surface-300">
                    {{ t('common.fields.name') }} <span class="text-red-500">*</span>
                </label>
                <InputText
                    v-model="name"
                    :placeholder="t('views.server_definitions.create_modal.name_placeholder')"
                    class="w-full"
                />
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-surface-700 dark:text-surface-300">
                    {{ t('common.fields.description') }}
                </label>
                <Textarea
                    v-model="description"
                    rows="2"
                    auto-resize
                    :placeholder="
                        t('views.server_definitions.create_modal.description_placeholder')
                    "
                    class="w-full"
                />
            </div>

            <div class="flex flex-col gap-2">
                <label
                    class="text-sm font-semibold text-surface-700 dark:text-surface-300 flex justify-between items-center"
                >
                    <span>{{ t('common.fields.choices') }} ({{ choices.length }}/5)</span>
                    <div
                        v-tooltip.top="
                            choices.length >= 5
                                ? t('views.server_definitions.create_modal.max_choices_reached')
                                : ''
                        "
                    >
                        <Button
                            icon="pi pi-plus"
                            size="small"
                            text
                            rounded
                            :disabled="choices.length >= 5"
                            @click="addChoice"
                        />
                    </div>
                </label>

                <div class="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
                    <div v-for="(_, index) in choices" :key="index" class="flex items-center gap-2">
                        <span class="text-xs text-surface-400 w-6 text-right"
                            >{{ index + 1 }}.</span
                        >
                        <InputText
                            v-model="choices[index]"
                            :placeholder="
                                t('views.server_definitions.create_modal.choices_placeholder')
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
                    :label="t('common.actions.create')"
                    :loading="loading"
                    :disabled="!canSubmit"
                    @click="handleSubmit"
                />
            </div>
        </template>
    </AppDialog>
</template>
