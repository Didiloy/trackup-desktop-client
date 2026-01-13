<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import ActivityCreateEditForm from './ActivityCreateEditForm.vue'
import ActivitySkillLevelsCreateEditForm from './ActivitySkillLevelsCreateEditForm.vue'
import ActivityMetadataCreateEditForm from './ActivityMetadataCreateEditForm.vue'
import { useI18n } from 'vue-i18n'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import ActivityIcon from '@/components/common/icons/ActivityIcon.vue'
import MetadataIcon from '@/components/common/icons/MetadataIcon.vue'
import SkillLevelIcon from '@/components/common/icons/SkillLevelIcon.vue'

interface Props {
    modelValue: boolean
    mode: 'create' | 'edit'
    activity?: IActivity | null
}
interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success', activity: IActivity): void
}
const props = withDefaults(defineProps<Props>(), {
    activity: null
})
const emit = defineEmits<Emits>()

const { t } = useI18n()

const current_activity = ref<IActivity | null>(null)

type Step = 'info' | 'metadata' | 'skill-levels'
const current_step = ref<Step>('info')

const steps = computed(() => {
    return [
        {
            key: 'info',
            label: t('common.steps.activity'),
            icon: ActivityIcon
        },
        {
            key: 'metadata',
            label: t('common.steps.metadata'),
            icon: MetadataIcon
        },
        {
            key: 'skill-levels',
            label: t('common.steps.skill_levels'),
            icon: SkillLevelIcon
        }
    ]
})

const currentIndex = computed(() => steps.value.findIndex((s) => s.key === current_step.value))

const title = computed(() => {
    if (props.mode === 'edit' && props.activity) {
        return `${t('common.actions.edit')} ${props.activity.name}`
    }
    return t('views.server_activities.add_modal.title')
})

const iconClass = computed(() => {
    return props.mode === 'edit' ? 'pi pi-pencil' : ActivityIcon
})

const subtitle = computed(() => {
    const baseKey = current_step.value === 'info'
        ? 'views.server_activities.add_modal.description'
        : current_step.value === 'metadata'
        ? 'views.server_activities.add_modal.metadata_description'
        : 'views.server_activities.add_modal.skill_levels_description'

    const translated = t(baseKey)

    // Add optional suffix for metadata and skill-levels in create mode
    if (props.mode === 'create' && current_step.value !== 'info') {
        return `${translated} (${t('common.fields.optional')})`
    }
    return translated
})

function resetState(): void {
    current_step.value = 'info'
    current_activity.value = props.mode === 'edit' ? props.activity : null
}

function close(): void {
    resetState()
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (value) => {
        if (value) {
            resetState()
        }
    }
)

// Step 1: Activity created/updated successfully
function handleActivitySuccess(activity: IActivity): void {
    current_activity.value = activity
    current_step.value = 'metadata'
}

// Step 2: Metadata handled (created or skipped)
function handleMetadataCompleted(): void {
    current_step.value = 'skill-levels'
}

function handleSkipMetadata(): void {
    current_step.value = 'skill-levels'
}

// Step 3: Skill levels handled (created or skipped)
function handleSkillLevelsCompleted(): void {
    finishWizard()
}

function handleSkipSkillLevels(): void {
    finishWizard()
}

// Finish Wizard
function finishWizard(): void {
    if (current_activity.value) {
        emit('success', current_activity.value)
    }
    close()
}

function handleStepClick(step: { key: string }): void {
    // Only allow step navigation in edit mode
    if (props.mode === 'edit') {
        current_step.value = step.key as Step
    }
}
</script>

<template>
    <MultiStepsDialog
        :model-value="modelValue"
        :style-class="'w-[600px] max-w-[92vw] rounded-xl select-none shadow-2 h-content'"
        :content-class="'p-0 bg-surface-50 h-full'"
        :title="title"
        :subtitle="subtitle"
        :icon-class="iconClass"
        :steps="steps"
        :current="currentIndex"
        @update:model-value="emit('update:modelValue', $event)"
        @step-click="handleStepClick"
    >
        <ActivityCreateEditForm
            v-if="current_step === 'info'"
            :mode="mode"
            :activity="activity"
            @success="handleActivitySuccess"
            @updated="handleActivitySuccess"
            @next="handleActivitySuccess"
            @cancel="close"
        />

        <ActivityMetadataCreateEditForm
            v-else-if="current_step === 'metadata'"
            :activity-id-for-types="current_activity?.public_id ?? activity?.public_id ?? null"
            :modify="mode === 'edit'"
            @skip="handleSkipMetadata"
            @success="handleMetadataCompleted"
        />

        <ActivitySkillLevelsCreateEditForm
            v-else-if="current_step === 'skill-levels'"
            :activity-id="current_activity?.public_id ?? activity?.public_id ?? null"
            @skip="handleSkipSkillLevels"
            @success="handleSkillLevelsCompleted"
        />
    </MultiStepsDialog>
</template>
