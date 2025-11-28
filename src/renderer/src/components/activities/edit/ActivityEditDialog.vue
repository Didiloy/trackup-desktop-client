<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import ActivityEditForm from './ActivityEditForm.vue'
import ActivitySkillLevelsForm from '../create/ActivitySkillLevelsForm.vue'
import ActivityMetadataForm from '../create/ActivityMetadataForm.vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'
import type {
    IActivity,
    IUpdateActivityRequest
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { ICreateActivitySkillLevelRequest } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { useActivitySkillLevelCRUD } from '@/composables/activities/skillLevels/useActivitySkillLevelCRUD'
import type { ICreateActivityMetadataDefinitionRequest } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'

interface Props {
    modelValue: boolean
    activity: IActivity
}
interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'updated'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const toast = useToast()
const { updateActivity } = useActivityCRUD()
const { createSkillLevel } = useActivitySkillLevelCRUD()
const { createMetadataDefinition } = useActivityMetadataDefinitionCRUD()
const server_store = useServerStore()
const submitting = ref(false)
const error = ref<string | null>(null)

type Step = 'activity' | 'metadata' | 'skill-levels'
const currentStep = ref<Step>('activity')

const steps = computed(() => [
    {
        key: 'activity',
        label: t('common.steps.activity'),
        icon: 'pi pi-pencil'
    },
    {
        key: 'metadata',
        label: t('common.steps.metadata'),
        icon: 'pi pi-database'
    },
    {
        key: 'skill-levels',
        label: t('common.steps.skill_levels'),
        icon: 'pi pi-sliders-h'
    }
])

const currentIndex = computed(() =>
    currentStep.value === 'activity' ? 0 : currentStep.value === 'metadata' ? 1 : 2
)

const subtitle = computed(() =>
    currentStep.value === 'activity'
        ? t('views.activity.add_modal.description')
        : currentStep.value === 'metadata'
        ? t('views.activity.add_modal.metadata_description')
        : t('views.activity.add_modal.skill_levels_description')
)

function advanceTo(step: Step): void {
    currentStep.value = step
    error.value = null
}

function resetState(): void {
    currentStep.value = 'activity'
    error.value = null
    submitting.value = false
}

function close(): void {
    resetState()
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (value) => {
        if (!value) {
            resetState()
        }
    }
)

async function handleActivityUpdate(payload: IUpdateActivityRequest): Promise<void> {
    if (submitting.value) return
    submitting.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error(t('messages.error.noServerSelected'))

        const res = await updateActivity(serverId, props.activity.public_id, payload)
        if (res.error) {
            throw new Error(res.error)
        }

        toast.add({
            severity: 'success',
            summary: t('messages.success.update'),
            life: 2500
        })
        emit('updated')
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.update')
    } finally {
        submitting.value = false
    }
}

async function handleMetadataCreate(
    defs: ICreateActivityMetadataDefinitionRequest[]
): Promise<void> {
    if (!defs.length) {
        advanceTo('skill-levels')
        return
    }
    submitting.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error(t('messages.error.noServerSelected'))
        const activityId = props.activity.public_id

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
            summary: t('messages.success.update'),
            life: 2500
        })
        emit('updated')
    advanceTo('skill-levels')
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.addMetadataFailed')
    } finally {
        submitting.value = false
    }
}

async function handleSkillLevelsCreate(levels: ICreateActivitySkillLevelRequest[]): Promise<void> {
    if (!levels.length) {
        return
    }
    submitting.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        if (!serverId) throw new Error(t('messages.error.noServerSelected'))
        const activityId = props.activity.public_id

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
            summary: t('messages.success.update'),
            life: 2500
        })
        emit('updated')
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.addSkillLevelsFailed')
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <MultiStepsDialog
        :model-value="modelValue"
        :style-class="'w-[600px] max-w-[92vw] rounded-xl select-none shadow-2 h-content'"
        :content-class="'p-0 bg-surface-50 h-full'"
        :title="`${t('common.actions.edit')} ${activity.name}`"
        :subtitle="subtitle"
        icon-class="pi pi-pencil"
        :steps="steps"
        :current="currentIndex"
        @update:model-value="emit('update:modelValue', $event)"
        @step-click="(step) => advanceTo(step.key as Step)"
    >
        <ActivityEditForm
            v-if="currentStep === 'activity'"
            :activity="activity"
            :loading="submitting"
            @update="handleActivityUpdate"
            @next="advanceTo('metadata')"
        />
        <ActivityMetadataForm
            v-else-if="currentStep === 'metadata'"
            :activity-id-for-types="activity.public_id"
            :loading="submitting"
            :modify="true"
            @skip="advanceTo('skill-levels')"
            @create="handleMetadataCreate"
        />
        <ActivitySkillLevelsForm
            v-else
            :submitting="submitting"
            :activity-id="activity.public_id"
            @skip="close"
            @create="handleSkillLevelsCreate"
        />
        <template #footer>
            <div v-if="error" class="w-full text-sm text-red-500 px-4 border-none">
                {{ error }}
            </div>
        </template>
    </MultiStepsDialog>
</template>
