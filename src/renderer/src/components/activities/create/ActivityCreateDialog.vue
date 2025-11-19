<script setup lang="ts">
import { ref, computed } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import ActivityCreateForm from './ActivityCreateForm.vue'
import ActivitySkillLevelsForm from './ActivitySkillLevelsForm.vue'
import ActivityMetadataForm from './ActivityMetadataForm.vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'
import type {
    IActivity,
    ICreateActivityRequest
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { ICreateActivitySkillLevelRequest } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { useActivitySkillLevelCRUD } from '@/composables/activities/useActivitySkillLevelCRUD'
import type { ICreateActivityMetadataDefinitionRequest } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/useActivityMetadataDefinitionCRUD'

interface Props {
    modelValue: boolean
}
interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'created', activity: IActivity): void
}
defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const toast = useToast()
const { createActivity } = useActivityCRUD()
const { createSkillLevel } = useActivitySkillLevelCRUD()
const { createMetadataDefinition } = useActivityMetadataDefinitionCRUD()
const server_store = useServerStore()
const submitting = ref(false)
const error = ref<string | null>(null)

type Step = 'activity' | 'metadata' | 'skill-levels'
const currentStep = ref<Step>('activity')
const createdActivity = ref<IActivity | null>(null)

const steps = computed(() => [
    {
        key: 'activity',
        label: t('userInterface.serverActivitiesView.addActivityModal.activityStep') || 'Activité',
        icon: 'pi pi-pencil'
    },
    {
        key: 'metadata',
        label:
            t('userInterface.serverActivitiesView.addActivityModal.metadataStep') || 'Métadonnées',
        icon: 'pi pi-database'
    },
    {
        key: 'skill-levels',
        label: t('userInterface.serverActivitiesView.addActivityModal.skillLevelsTitle'),
        icon: 'pi pi-sliders-h'
    }
])

const currentIndex = computed(() =>
    currentStep.value === 'activity' ? 0 : currentStep.value === 'metadata' ? 1 : 2
)

const subtitle = computed(() =>
    currentStep.value === 'activity'
        ? t('userInterface.serverActivitiesView.addActivityModal.description')
        : currentStep.value === 'metadata'
          ? t('userInterface.serverActivitiesView.addActivityModal.metadataDescription') +
            ' (' +
            t('common.optional') +
            ')'
          : t('userInterface.serverActivitiesView.addActivityModal.skillLevelsDescription') +
            ' (' +
            t('common.optional') +
            ')'
)

function advanceTo(step: Step): void {
    currentStep.value = step
    error.value = null
}

function resetState(): void {
    currentStep.value = 'activity'
    createdActivity.value = null
    error.value = null
    submitting.value = false
}

function close(): void {
    resetState()
    emit('update:modelValue', false)
}

async function handleActivityCreate(payload: ICreateActivityRequest): Promise<void> {
    if (submitting.value) return
    submitting.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error('No server selected')

        const sanitizedPayload: ICreateActivityRequest = {
            name: payload.name.trim(),
            description: (payload.description || '').trim(),
            logo: payload.logo || '',
            banner: payload.banner || ''
        }

        const res = await createActivity(serverId, sanitizedPayload)
        if (res.error || !res.data) {
            toast.add({ severity: 'error', summary: t('messages.error.create'), life: 2500 })
            throw new Error(res.error || 'Failed to create activity')
        }

        createdActivity.value = res.data
        toast.add({
            severity: 'success',
            summary: t('messages.success.create'),
            life: 2500
        })
        advanceTo('metadata')
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to create activity'
    } finally {
        submitting.value = false
    }
}

async function handleMetadataCreate(
    defs: ICreateActivityMetadataDefinitionRequest[]
): Promise<void> {
    if (!createdActivity.value) return
    if (!defs.length) {
        advanceTo('skill-levels')
        return
    }
    submitting.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error('No server selected')
        const activityId = createdActivity.value.public_id

        const sanitizedDefs = defs.map((def) => ({
            ...def,
            key: def.key.trim(),
            label: def.label?.trim(),
            description: def.description?.trim(),
            choices: def.choices?.map((choice) => choice.toString()) || [],
            required: def.required,
            allow_not_predefined_value: def.allow_not_predefined_value
        }))
        const results = await Promise.all(
            sanitizedDefs.map((def) => createMetadataDefinition(serverId, activityId, { ...def }))
        )
        for (const res of results) {
            if (res.error) {
                throw new Error(res.error)
            }
        }
        toast.add({
            severity: 'success',
            summary: t('messages.success.create'),
            life: 2500
        })
        advanceTo('skill-levels')
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to create metadata'
    } finally {
        submitting.value = false
    }
}

function handleMetadataSkip(): void {
    advanceTo('skill-levels')
}

async function handleSkillLevelsCreate(levels: ICreateActivitySkillLevelRequest[]): Promise<void> {
    if (!createdActivity.value) {
        close()
        return
    }
    if (!levels.length) {
        finishWizard()
        return
    }
    submitting.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error('No server selected')
        const activityId = createdActivity.value.public_id

        const sanitizedLevels = levels.map((lvl) => ({
            ...lvl,
            name: lvl.name.trim(),
            display_order: lvl.display_order,
            description: lvl.description?.trim() || undefined,
            color: lvl.color?.trim(),
            min_sessions: Number(lvl.min_sessions),
            max_sessions: lvl.max_sessions ?? null,
            min_duration: Number(lvl.min_duration),
            max_duration: lvl.max_duration ?? null
        }))
        const results = await Promise.all(
            sanitizedLevels.map((lvl) => createSkillLevel(serverId, activityId, { ...lvl }))
        )
        for (const res of results) {
            if (res.error) {
                throw new Error(res.error)
            }
        }
        toast.add({
            severity: 'success',
            summary: t('messages.success.create'),
            life: 2500
        })
        finishWizard()
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to create skill levels'
    } finally {
        submitting.value = false
    }
}

function handleSkillLevelsSkip(): void {
    finishWizard()
}

function finishWizard(): void {
    if (createdActivity.value) {
        emit('created', createdActivity.value)
    }
    close()
}
</script>

<template>
    <MultiStepsDialog
        :model-value="modelValue"
        :style-class="'w-[600px] max-w-[92vw] rounded-xl select-none shadow-2 h-full'"
        :content-class="'p-0 bg-surface-50 h-full'"
        :title="t('userInterface.serverActivitiesView.addActivityModal.title')"
        :subtitle="subtitle"
        icon-class="pi pi-plus-circle"
        :steps="steps"
        :current="currentIndex"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <ActivityCreateForm
            v-if="currentStep === 'activity'"
            :loading="submitting"
            @create="handleActivityCreate"
            @cancel="close"
        />
        <ActivityMetadataForm
            v-else-if="currentStep === 'metadata'"
            :activity-id-for-types="createdActivity?.public_id ?? null"
            :loading="submitting"
            @skip="handleMetadataSkip"
            @create="handleMetadataCreate"
        />
        <ActivitySkillLevelsForm
            v-else
            :submitting="submitting"
            @skip="handleSkillLevelsSkip"
            @create="handleSkillLevelsCreate"
        />
        <template #footer>
            <div v-if="error" class="w-full text-sm text-red-500 px-4 border-none">
                {{ error }}
            </div>
        </template>
    </MultiStepsDialog>
</template>
