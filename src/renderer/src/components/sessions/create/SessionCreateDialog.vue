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
import { useServerStore } from '@/stores/server'
import type {
    ISession,
    IAddSessionEnumsRequest,
    IAddSessionMetadataRequest
} from '@shared/contracts/interfaces/entities/session.interfaces'
import type { ICreateActivitySessionRequest } from '@shared/contracts/interfaces/entities/activity.interfaces'

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

const submitting = ref(false)
const error = ref<string | null>(null)
const createdSession = ref<ISession | null>(null)

type Step = 'info' | 'enums' | 'metadata'
const currentStep = ref<Step>('info')
const hasEnums = ref(true) // Assume true initially, updated by form load
const hasMetadata = ref(true) // Assume true initially, updated by form load

const steps = computed(() => {
    const list = [
        {
            key: 'info',
            label: t('userInterface.serverSessionsView.addSessionModal.infoStep') || 'Session Info',
            icon: 'pi pi-info-circle'
        }
    ]
    if (hasEnums.value) {
        list.push({
            key: 'enums',
            label: t('userInterface.serverSessionsView.addSessionModal.enumsStep') || 'Selections',
            icon: 'pi pi-list'
        })
    }
    if (hasMetadata.value) {
        list.push({
            key: 'metadata',
            label: t('userInterface.serverSessionsView.addSessionModal.metadataStep') || 'Metadata',
            icon: 'pi pi-database'
        })
    }
    return list
})

const currentIndex = computed(() => steps.value.findIndex((s) => s.key === currentStep.value))

const subtitle = computed(() => {
    switch (currentStep.value) {
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
    currentStep.value = 'info'
    createdSession.value = null
    error.value = null
    submitting.value = false
    hasEnums.value = true
    hasMetadata.value = true
}

function close(): void {
    resetState()
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (val) => {
        if (!val) resetState()
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

        // Advance to next step
        currentStep.value = 'enums'
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
        currentStep.value = 'metadata'
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.addEnumsFailed')
    } finally {
        submitting.value = false
    }
}

function handleSkipEnums(): void {
    currentStep.value = 'metadata'
}

function handleEnumsLoaded(has: boolean): void {
    hasEnums.value = has
    if (!has) {
        // If no enums, auto-skip to metadata
        currentStep.value = 'metadata'
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

function handleMetadataLoaded(has: boolean): void {
    hasMetadata.value = has
    if (!has) {
        // If no metadata, and we are here, we are done
        finishWizard()
    }
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
            v-if="currentStep === 'info'"
            :loading="submitting"
            :pre-selected-activity-id="props.preSelectedActivityId"
            @create="handleCreateSession"
            @cancel="close"
        />

        <SessionEnumsForm
            v-else-if="currentStep === 'enums'"
            :loading="submitting"
            @submit="handleAddEnums"
            @skip="handleSkipEnums"
            @loaded="handleEnumsLoaded"
        />

        <SessionMetadataForm
            v-else-if="currentStep === 'metadata'"
            :loading="submitting"
            :activity-id="createdSession?.activity.public_id || ''"
            @submit="handleAddMetadata"
            @skip="handleSkipMetadata"
            @loaded="handleMetadataLoaded"
        />

        <template #footer>
            <div v-if="error" class="w-full text-sm text-red-500 px-4 border-none">
                {{ error }}
            </div>
        </template>
    </MultiStepsDialog>
</template>
