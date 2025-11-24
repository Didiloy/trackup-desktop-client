<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import SessionCreateForm from './SessionCreateForm.vue'
import SessionEnumsForm from './SessionEnumsForm.vue'
import SessionMetadataForm from './SessionMetadataForm.vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useSessionCRUD } from '@/composables/sessions/useSessionCRUD'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type {
    ISession,
    IAddSessionEnumsRequest,
    IAddSessionMetadataRequest
} from '@shared/contracts/interfaces/entities/session.interfaces'
import type { ICreateActivitySessionRequest } from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

interface Props {
    modelValue: boolean
    preSelectedActivityId?: string | null
}
interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'created', session: ISession): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const toast = useToast()
const { createActivitySession } = useActivityCRUD()
const { addSessionEnums, addSessionMetadata } = useSessionCRUD()
const server_store = useServerStore()

const { listEnumDefinitions } = useEnumDefinitionCRUD()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()

const submitting = ref(false)
const error = ref<string | null>(null)
const createdSession = ref<ISession | null>(null)

type Step = 'info' | 'enums' | 'metadata'
const current_step = ref<Step>('info')
const has_enums = ref(false)
const has_metadata = ref(false)
const enum_definitions = ref<IEnumDefinition[]>([])
const metadata_definitions = ref<IActivityMetadataDefinition[]>([])

const steps = computed(() => {
    const list = [
        {
            key: 'info',
            label: t('userInterface.serverSessionsView.addSessionModal.infoStep') || 'Session Info',
            icon: 'pi pi-info-circle'
        }
    ]
    if (has_enums.value) {
        list.push({
            key: 'enums',
            label: t('userInterface.serverSessionsView.addSessionModal.enumsStep') || 'Selections',
            icon: 'pi pi-list'
        })
    }
    if (has_metadata.value) {
        list.push({
            key: 'metadata',
            label: t('userInterface.serverSessionsView.addSessionModal.metadataStep') || 'Metadata',
            icon: 'pi pi-database'
        })
    }
    return list
})

const currentIndex = computed(() => steps.value.findIndex((s) => s.key === current_step.value))

const subtitle = computed(() => {
    switch (current_step.value) {
        case 'info':
            return (
                t('userInterface.serverSessionsView.addSessionModal.infoDescription') ||
                'Enter session details'
            )
        case 'enums':
            return (
                t('userInterface.serverSessionsView.addSessionModal.enumsDescription') ||
                'Select options'
            )
        case 'metadata':
            return (
                t('userInterface.serverSessionsView.addSessionModal.metadataDescription') ||
                'Add extra data'
            )
        default:
            return ''
    }
})

function resetState(): void {
    current_step.value = 'info'
    createdSession.value = null
    error.value = null
    submitting.value = false
    has_enums.value = false
    has_metadata.value = false
    enum_definitions.value = []
    metadata_definitions.value = []
}

function close(): void {
    resetState()
    emit('update:modelValue', false)
}

async function checkServerEnums(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId) return
    try {
        const res = await listEnumDefinitions(serverId)
        if (res.data && res.data.length > 0) {
            enum_definitions.value = res.data
            has_enums.value = true
        } else {
            enum_definitions.value = []
            has_enums.value = false
        }
    } catch (e) {
        console.error('Failed to check enums', e)
        has_enums.value = false
        enum_definitions.value = []
    }
}

async function checkActivityMetadata(activityId: string): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId) return
    try {
        const res = await listMetadataDefinitions(serverId, activityId)
        if (res.data && res.data.length > 0) {
            metadata_definitions.value = res.data
            has_metadata.value = true
        } else {
            metadata_definitions.value = []
            has_metadata.value = false
        }
    } catch (e) {
        console.error('Failed to check metadata', e)
        has_metadata.value = false
        metadata_definitions.value = []
    }
}

watch(
    () => props.modelValue,
    async (val) => {
        if (val) {
            resetState()
            await checkServerEnums()
        } else {
            resetState()
        }
    }
)

// Step 1: Create Session
async function handleCreateSession(payload: {
    activityId: string
    request: ICreateActivitySessionRequest
}): Promise<void> {
    if (submitting.value) return
    submitting.value = true
    error.value = null

    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error(t('messages.error.noServerSelected'))

        const res = await createActivitySession(serverId, payload.activityId, payload.request)
        if (res.error || !res.data) {
            throw new Error(res.error || t('messages.error.createSessionFailed'))
        }

        createdSession.value = res.data
        toast.add({ severity: 'success', summary: t('messages.success.create'), life: 2500 })

        // Check metadata availability for this activity
        await checkActivityMetadata(res.data.activity.public_id)

        // Advance to next step
        if (has_enums.value) {
            current_step.value = 'enums'
        } else if (has_metadata.value) {
            current_step.value = 'metadata'
        } else {
            finishWizard()
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.createSessionFailed')
        toast.add({ severity: 'error', summary: t('messages.error.create'), life: 2500 })
    } finally {
        submitting.value = false
    }
}

// Step 2: Add Enums
async function handleAddEnums(payload: IAddSessionEnumsRequest): Promise<void> {
    if (!createdSession.value) return
    submitting.value = true
    error.value = null

    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error(t('messages.error.noServerSelected'))

        const res = await addSessionEnums(serverId, createdSession.value.public_id, payload)
        if (res.error) throw new Error(res.error)

        toast.add({ severity: 'success', summary: t('messages.success.update'), life: 2500 })

        if (has_metadata.value) {
            current_step.value = 'metadata'
        } else {
            finishWizard()
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.addEnumsFailed')
    } finally {
        submitting.value = false
    }
}

function handleSkipEnums(): void {
    if (has_metadata.value) {
        current_step.value = 'metadata'
    } else {
        finishWizard()
    }
}

// Step 3: Add Metadata
async function handleAddMetadata(payload: IAddSessionMetadataRequest): Promise<void> {
    if (!createdSession.value) return
    submitting.value = true
    error.value = null

    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error(t('messages.error.noServerSelected'))

        const res = await addSessionMetadata(serverId, createdSession.value.public_id, payload)
        if (res.error) throw new Error(res.error)

        toast.add({ severity: 'success', summary: t('messages.success.update'), life: 2500 })
        finishWizard()
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.addMetadataFailed')
    } finally {
        submitting.value = false
    }
}

function handleSkipMetadata(): void {
    finishWizard()
}

function finishWizard(): void {
    if (createdSession.value) {
        emit('created', createdSession.value)
    }
    close()
}
</script>

<template>
    <MultiStepsDialog
        :model-value="modelValue"
        :style-class="'w-[600px] max-w-[92vw] rounded-xl select-none shadow-2 h-[83vh]'"
        :content-class="'p-0 bg-surface-50 h-full'"
        :title="t('userInterface.serverSessionsView.addSessionModal.title') || 'Create Session'"
        :subtitle="subtitle"
        icon-class="pi pi-plus-circle"
        :steps="steps"
        :current="currentIndex"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <SessionCreateForm
            v-if="current_step === 'info'"
            :loading="submitting"
            :pre-selected-activity-id="props.preSelectedActivityId"
            @create="handleCreateSession"
            @cancel="close"
        />

        <SessionEnumsForm
            v-else-if="current_step === 'enums'"
            :loading="submitting"
            :definitions="enum_definitions"
            @submit="handleAddEnums"
            @skip="handleSkipEnums"
        />

        <SessionMetadataForm
            v-else-if="current_step === 'metadata'"
            :loading="submitting"
            :activity-id="createdSession?.activity.public_id || ''"
            :definitions="metadata_definitions"
            @submit="handleAddMetadata"
            @skip="handleSkipMetadata"
        />

        <template #footer>
            <div v-if="error" class="w-full text-sm text-red-500 px-4 border-none">
                {{ error }}
            </div>
        </template>
    </MultiStepsDialog>
</template>
