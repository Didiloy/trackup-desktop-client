<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import ActivityCreateForm from './ActivityCreateForm.vue'
import ActivitySkillLevelsForm from './ActivitySkillLevelsForm.vue'
import ActivityMetadataForm from './ActivityMetadataForm.vue'
import { useI18n } from 'vue-i18n'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

interface Props {
    modelValue: boolean
}
interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'created', activity: IActivity): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const created_activity = ref<IActivity | null>(null)

type Step = 'info' | 'metadata' | 'skill-levels'
const current_step = ref<Step>('info')

const steps = computed(() => {
    return [
        {
            key: 'info',
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
    ]
})

const currentIndex = computed(() => steps.value.findIndex((s) => s.key === current_step.value))

const subtitle = computed(() => {
    switch (current_step.value) {
        case 'info':
            return t('views.activity.add_modal.description')
        case 'metadata':
            return (
                t('views.activity.add_modal.metadata_description') +
                ' (' +
                t('common.fields.optional') +
                ')'
            )
        case 'skill-levels':
            return (
                t('views.activity.add_modal.skill_levels_description') +
                ' (' +
                t('common.fields.optional') +
                ')'
            )
        default:
            return ''
    }
})

function resetState(): void {
    current_step.value = 'info'
    created_activity.value = null
}

function close(): void {
    resetState()
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    () => {
        resetState()
    }
)

// Step 1: Activity created successfully
function handleActivityCreated(activity: IActivity): void {
    created_activity.value = activity
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
    if (created_activity.value) {
        emit('created', created_activity.value)
    }
    close()
}
</script>

<template>
    <MultiStepsDialog
        :model-value="modelValue"
        :style-class="'w-[600px] max-w-[92vw] rounded-xl select-none shadow-2 h-content'"
        :content-class="'p-0 bg-surface-50 h-full'"
        :title="t('views.activity.add_modal.title')"
        :subtitle="subtitle"
        icon-class="pi pi-plus-circle"
        :steps="steps"
        :current="currentIndex"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <ActivityCreateForm
            v-if="current_step === 'info'"
            mode="create"
            @success="handleActivityCreated"
            @cancel="close"
        />

        <ActivityMetadataForm
            v-else-if="current_step === 'metadata'"
            :activity-id-for-types="created_activity?.public_id ?? null"
            @skip="handleSkipMetadata"
            @success="handleMetadataCompleted"
        />

        <ActivitySkillLevelsForm
            v-else-if="current_step === 'skill-levels'"
            :activity-id="created_activity?.public_id ?? null"
            @skip="handleSkipSkillLevels"
            @success="handleSkillLevelsCompleted"
        />
    </MultiStepsDialog>
</template>
