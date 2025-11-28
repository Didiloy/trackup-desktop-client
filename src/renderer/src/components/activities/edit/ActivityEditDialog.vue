<script setup lang="ts">
import { computed, watch } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import ActivityEditForm from './ActivityEditForm.vue'
import ActivitySkillLevelsForm from '../create/ActivitySkillLevelsForm.vue'
import ActivityMetadataForm from '../create/ActivityMetadataForm.vue'
import { useI18n } from 'vue-i18n'
import { useActivityCreateOrEdit, type Step } from '@/composables/activities/useActivityCreateOrEdit'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

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

const {
    currentStep,
    currentIndex,
    submitting,
    error,
    advanceTo,
    resetState,
    handleActivitySubmit,
    handleMetadataSubmit,
    handleSkillLevelsSubmit
} = useActivityCreateOrEdit({
    activityId: props.activity.public_id,
    mode: 'edit',
    onUpdate: () => emit('updated')
})

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

const subtitle = computed(() =>
    currentStep.value === 'activity'
        ? t('views.activity.add_modal.description')
        : currentStep.value === 'metadata'
          ? t('views.activity.add_modal.metadata_description')
          : t('views.activity.add_modal.skill_levels_description')
)

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
            @update="handleActivitySubmit"
            @next="advanceTo('metadata')"
        />
        <ActivityMetadataForm
            v-else-if="currentStep === 'metadata'"
            :activity-id-for-types="activity.public_id"
            :loading="submitting"
            :modify="true"
            @skip="advanceTo('skill-levels')"
            @create="handleMetadataSubmit"
        />
        <ActivitySkillLevelsForm
            v-else
            :submitting="submitting"
            :activity-id="activity.public_id"
            @skip="close"
            @create="(levels) => handleSkillLevelsSubmit(levels, close)"
        />
        <template #footer>
            <div v-if="error" class="w-full text-sm text-red-500 px-4 border-none">
                {{ error }}
            </div>
        </template>
    </MultiStepsDialog>
</template>
