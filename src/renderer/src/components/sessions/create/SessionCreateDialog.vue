<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import SessionCreateForm from './SessionCreateForm.vue'
import SessionEnumsForm from './SessionEnumsForm.vue'
import SessionActivityMetadataForm from './SessionActivityMetadataForm.vue'
import { useI18n } from 'vue-i18n'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type { ISession } from '@shared/contracts/interfaces/entities/session.interfaces'
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
const server_store = useServerStore()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()

const created_session = ref<ISession | null>(null)

type Step = 'info' | 'enums' | 'metadata'
const current_step = ref<Step>('info')
const has_enums = ref((server_store.getEnumsDefinition?.length ?? 0) > 0)
const has_metadata = ref(false)
const enum_definitions = ref<IEnumDefinition[]>([])
const metadata_definitions = ref<IActivityMetadataDefinition[]>([])

// Track metadata form validity
const metadata_valid = ref(true)
function setMetadataValid(v: boolean): void {
    metadata_valid.value = v
}

const steps = computed(() => {
    const list = [
        {
            key: 'info',
            label: t('common.steps.info'),
            icon: 'pi pi-info-circle'
        }
    ]
    if (has_enums.value) {
        list.push({
            key: 'enums',
            label: t('common.steps.enums'),
            icon: 'pi pi-list'
        })
    }
    if (has_metadata.value) {
        list.push({
            key: 'metadata',
            label: t('common.steps.metadata'),
            icon: 'pi pi-database'
        })
    }
    return list
})

const currentIndex = computed(() => steps.value.findIndex((s) => s.key === current_step.value))

const subtitle = computed(() => {
    switch (current_step.value) {
        case 'info':
            return t('views.server_sessions.add_modal.info_description')
        case 'enums':
            return t('views.server_sessions.add_modal.enums_description')
        case 'metadata':
            return t('views.server_sessions.add_modal.metadata_description')
        default:
            return ''
    }
})

function resetState(): void {
    current_step.value = 'info'
    created_session.value = null
    has_enums.value = (server_store.getEnumsDefinition?.length ?? 0) > 0
    has_metadata.value = false
    enum_definitions.value = []
    metadata_definitions.value = []
}

function close(): void {
    resetState()
    emit('update:modelValue', false)
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
        console.error(t('messages.error.fetch'), e)
        has_metadata.value = false
        metadata_definitions.value = []
    }
}

// Watch for dialog open/close
watch(
    () => props.modelValue,
    () => {
        resetState()
    }
)

// When activity changes, check for metadata definitions
async function handleActivityChange(activityId: string | null): Promise<void> {
    if (activityId) {
        await checkActivityMetadata(activityId)
    } else {
        has_metadata.value = false
        metadata_definitions.value = []
    }
}

// Step 1: Session created successfully
function handleSessionCreated(session: ISession): void {
    created_session.value = session

    // Check for enums
    has_enums.value = (server_store.getEnumsDefinition?.length ?? 0) > 0

    // Advance to next step
    if (has_enums.value) {
        current_step.value = 'enums'
    } else if (has_metadata.value) {
        current_step.value = 'metadata'
    } else {
        finishWizard()
    }
}

// Step 2: Enums added successfully
function handleEnumsAdded(): void {
    if (has_metadata.value) {
        current_step.value = 'metadata'
    } else {
        finishWizard()
    }
}

function handleSkipEnums(): void {
    if (has_metadata.value) {
        current_step.value = 'metadata'
    } else {
        finishWizard()
    }
}

// Step 3: Metadata added successfully
function handleMetadataAdded(): void {
    finishWizard()
}

function handleSkipMetadata(): void {
    finishWizard()
}

// Finish Wizard
function finishWizard(): void {
    if (created_session.value) {
        emit('created', created_session.value)
    }
    close()
}

// Compute whether the dialog should be closable
const isClosable = computed(() => {
    return current_step.value === 'info';
})
</script>

<template>
    <MultiStepsDialog
        :model-value="modelValue"
        :style-class="'w-[650px] max-w-[92vw] rounded-xl select-none shadow-2 h-content'"
        :content-class="'p-0 bg-surface-50 h-full'"
        :title="t('views.server_sessions.add_modal.title')"
        :subtitle="subtitle"
        icon-class="pi pi-plus-circle"
        :steps="steps"
        :current="currentIndex"
        :closable="isClosable"
        :dismissable-mask="isClosable"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <SessionCreateForm
            v-if="current_step === 'info'"
            :pre-selected-activity-id="props.preSelectedActivityId"
            @success="handleSessionCreated"
            @cancel="close"
            @update:activity-id="handleActivityChange"
        />

        <SessionEnumsForm
            v-else-if="current_step === 'enums'"
            :session-id="created_session?.public_id || ''"
            @success="handleEnumsAdded"
            @skip="handleSkipEnums"
        />

        <SessionActivityMetadataForm
            v-else-if="current_step === 'metadata'"
            :session-id="created_session?.public_id || ''"
            :activity-id="created_session?.activity.public_id || ''"
            :definitions="metadata_definitions"
            @success="handleMetadataAdded"
            @skip="handleSkipMetadata"
            @valid="setMetadataValid"
        />
    </MultiStepsDialog>
</template>
