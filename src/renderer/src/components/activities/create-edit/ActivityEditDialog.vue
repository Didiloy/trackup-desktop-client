<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import ActivitySkillLevelsForm from './ActivitySkillLevelsForm.vue'
import ActivityMetadataForm from './ActivityMetadataForm.vue'
import { useI18n } from 'vue-i18n'
import type {
    IActivity
}  from '@shared/contracts/interfaces/entities/activity.interfaces'
import ActivityCreateEditForm from '@/components/activities/create-edit/ActivityCreateEditForm.vue'

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

type Step = 'info' | 'metadata' | 'skill-levels'
const current_step = ref<Step>('info')
const submitting = ref(false)

const steps = computed(() => [
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
])

const currentIndex = computed(() => steps.value.findIndex((s) => s.key === current_step.value))

const subtitle = computed(() =>
    current_step.value === 'info'
        ? t('views.activity.add_modal.description')
        : current_step.value === 'metadata'
          ? t('views.activity.add_modal.metadata_description')
          : t('views.activity.add_modal.skill_levels_description')
)

function resetState(): void {
    current_step.value = 'info'
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

async function handleActivityUpdate(): Promise<void> {
    current_step.value = 'metadata'
}

function handleMetadataCompleted(): void {
    current_step.value = 'skill-levels'
}

function handleSkipMetadata(): void {
    current_step.value = 'skill-levels'
}

function handleSkillLevelsCompleted(): void {
    emit('updated')
    close()
}

function handleSkipSkillLevels(): void {
    emit('updated')
    close()
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
        @step-click="(step) => (current_step = step.key as Step)"
    >
        <ActivityCreateEditForm
            v-if="current_step === 'info'"
            :activity="activity"
            mode="edit"
            @updated="handleActivityUpdate"
            @cancel="close"
        />
        <ActivityMetadataForm
            v-else-if="current_step === 'metadata'"
            :activity-id-for-types="activity.public_id"
            :modify="true"
            @skip="handleSkipMetadata"
            @success="handleMetadataCompleted"
        />
        <ActivitySkillLevelsForm
            v-else
            :activity-id="activity.public_id"
            @skip="handleSkipSkillLevels"
            @success="handleSkillLevelsCompleted"
        />
    </MultiStepsDialog>
</template>
