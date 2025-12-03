<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import ActivityEditForm from './ActivityEditForm.vue'
import ActivitySkillLevelsForm from '../create/ActivitySkillLevelsForm.vue'
import ActivityMetadataForm from '../create/ActivityMetadataForm.vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import type {
    IActivity,
    IUpdateActivityRequest
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'

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
const server_store = useServerStore()
const { updateActivity } = useActivityCRUD()

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

async function handleActivityUpdate(payload: IUpdateActivityRequest): Promise<void> {
    submitting.value = true
    try {
        const serverId = server_store.getPublicId
        if (!serverId) {
            throw new Error(t('messages.error.noServerSelected'))
        }

        const res = await updateActivity(serverId, props.activity.public_id, payload)
        if (res.error || !res.data) {
            throw new Error(res.error || t('messages.error.update'))
        }

        toast.add({ severity: 'success', summary: t('messages.success.update'), life: 2500 })
        current_step.value = 'metadata'
    } catch (e) {
        const message = e instanceof Error ? e.message : t('messages.error.update')
        toast.add({ severity: 'error', summary: message, life: 3000 })
    } finally {
        submitting.value = false
    }
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
        <ActivityEditForm
            v-if="current_step === 'info'"
            :activity="activity"
            :loading="submitting"
            @update="handleActivityUpdate"
            @next="current_step = 'metadata'"
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
