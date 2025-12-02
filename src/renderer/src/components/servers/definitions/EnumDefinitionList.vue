<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import { useToast } from 'primevue/usetoast'
import EnumDefinitionCreateDialog from './EnumDefinitionCreateDialog.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'

const { t } = useI18n()
const toast = useToast()
const server_store = useServerStore()
const { listEnumDefinitions, deleteEnumDefinition } = useEnumDefinitionCRUD()

const definitions = ref<IEnumDefinition[]>([])
const loading = ref(true)
const showCreateDialog = ref(false)
const definitionToEdit = ref<IEnumDefinition | null>(null)
const showDeleteConfirm = ref(false)
const deleteTargetId = ref<string | null>(null)
const deleteTargetName = ref<string>('')

async function loadDefinitions() {
    if (!server_store.getPublicId) return
    loading.value = true
    try {
        const res = await listEnumDefinitions(server_store.getPublicId)
        if (res.data) {
            definitions.value = res.data
        }
    } catch (e) {
        console.error(e)
        toast.add({
            severity: 'error',
            summary: t('messages.error.fetch'),
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

function openCreateDialog() {
    definitionToEdit.value = null
    showCreateDialog.value = true
}

function openEditDialog(def: IEnumDefinition) {
    definitionToEdit.value = def
    showCreateDialog.value = true
}

function confirmDelete(def: IEnumDefinition) {
    deleteTargetId.value = def.public_id
    deleteTargetName.value = def.name
    showDeleteConfirm.value = true
}

async function handleDelete() {
    if (!server_store.getPublicId || !deleteTargetId.value) return
    try {
        const res = await deleteEnumDefinition(server_store.getPublicId, deleteTargetId.value)
        if (res.error) throw new Error(res.error)

        toast.add({
            severity: 'success',
            summary: t('messages.success.delete'),
            life: 3000
        })
        await loadDefinitions()
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.delete'),
            detail: e instanceof Error ? e.message : 'Unknown error',
            life: 3000
        })
    } finally {
        showDeleteConfirm.value = false
        deleteTargetId.value = null
    }
}

onMounted(() => {
    loadDefinitions()
})

function getChoicesPreview(def: IEnumDefinition): string[] {
    const valueObj = def.values?.[0]
    if (!valueObj) return []
    return Object.entries(valueObj)
        .filter(([key, val]) => key !== 'public_id' && val)
        .map(([_, val]) => val as string)
}

function countChoices(def: IEnumDefinition): number {
    const valueObj = def.values?.[0]
    if (!valueObj) return 0

    // Count non-empty values excluding public_id
    return Object.entries(valueObj).filter(([key, val]) => key !== 'public_id' && val).length
}

function getBadgeColor(index: number) {
    const colors = [
        'bg-blue-200 text-blue-600 ring-blue-500/20',
        'bg-green-200 text-green-600 ring-green-500/20',
        'bg-purple-200 text-purple-600 ring-purple-500/20',
        'bg-orange-200 text-orange-600 ring-orange-500/20',
        'bg-pink-200 text-pink-600 ring-pink-500/20'
    ]
    return colors[index % colors.length]
}
</script>

<template>
    <div class="flex flex-col gap-6 w-full">
        <div class="flex justify-between items-center w-full">
            <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg bg-primary-200 text-primary-600 w-9 h-9 flex items-center justify-center">
                    <i class="pi pi-list text-lg"></i>
                </div>
                <h2 class="text-lg font-bold text-surface-900">
                    {{ t('views.server_definitions.enums_list_title', 'Enum Definitions') }}
                </h2>
            </div>
            <Button
                :label="t('views.server_definitions.add_definition')"
                icon="pi pi-plus"
                size="small"
                @click="openCreateDialog"
            />
        </div>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
            <Skeleton v-for="i in 3" :key="i" height="180px" class="rounded-2xl" />
        </div>

        <div
            v-else-if="definitions.length === 0"
            class="flex flex-col items-center justify-center py-16 bg-surface-0 rounded-3xl border border-dashed border-surface-300"
        >
            <div class="w-16 h-16 rounded-full bg-surface-50 flex items-center justify-center mb-4">
                <i class="pi pi-list text-2xl text-surface-400"></i>
            </div>
            <h3 class="text-lg font-semibold text-surface-900 mb-1">
                {{ t('views.server_definitions.no_definitions_title', 'No definitions yet') }}
            </h3>
            <p class="text-surface-500 text-sm mb-6 max-w-xs text-center">
                {{
                    t(
                        'views.server_definitions.no_definitions',
                        'Create custom lists of choices to use in your sessions.'
                    )
                }}
            </p>
            <Button
                :label="t('common.actions.create')"
                icon="pi pi-plus"
                size="small"
                rounded
                outlined
                @click="openCreateDialog"
            />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5 w-full">
            <div
                v-for="def in definitions"
                :key="def.public_id"
                class="group relative bg-surface-0 rounded-3xl p-5 shadow-sm ring-1 ring-surface-200/60 hover:shadow-md hover:ring-primary-200 transition-all duration-300 flex flex-col h-full"
            >
                <!-- Actions (visible on hover) -->
                <div
                    class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2"
                >
                    <Button
                        icon="pi pi-pencil"
                        text
                        rounded
                        severity="secondary"
                        size="small"
                        class="w-8 h-8 bg-surface-0/80 backdrop-blur hover:bg-surface-100"
                        @click="openEditDialog(def)"
                    />
                    <Button
                        icon="pi pi-trash"
                        text
                        rounded
                        severity="danger"
                        size="small"
                        class="w-8 h-8 bg-surface-0/80 backdrop-blur hover:bg-red-50"
                        @click="confirmDelete(def)"
                    />
                </div>

                <div class="mb-4 pr-8">
                    <h3 class="font-bold text-lg text-surface-900 mb-1">{{ def.name }}</h3>
                    <p class="text-sm text-surface-500 line-clamp-2 h-10">
                        {{ def.description || t('common.fields.no_description') }}
                    </p>
                </div>

                <div class="mt-auto">
                    <div class="flex items-center justify-between mb-2">
                        <span
                            class="text-xs font-semibold text-surface-400 uppercase tracking-wider"
                        >
                            {{ t('common.fields.choices') }}
                        </span>
                        <span
                            class="text-xs font-medium bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full"
                        >
                            {{ countChoices(def) }}
                        </span>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <span
                            v-for="(choice, idx) in getChoicesPreview(def)"
                            :key="idx"
                            class="text-xs font-medium px-2.5 py-1 rounded-lg ring-1 ring-inset"
                            :class="getBadgeColor(idx)"
                        >
                            {{ choice }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <EnumDefinitionCreateDialog 
            v-model="showCreateDialog" 
            :definition-to-edit="definitionToEdit"
            @created="loadDefinitions" 
            @updated="loadDefinitions"
        />

        <ConfirmationDialog
            :model-value="showDeleteConfirm"
            :title="t('common.actions.delete')"
            :message="t('messages.warning.delete')"
            :confirmation-name="deleteTargetName"
            @update:model-value="showDeleteConfirm = $event"
            @confirm="handleDelete"
        />
    </div>
</template>
