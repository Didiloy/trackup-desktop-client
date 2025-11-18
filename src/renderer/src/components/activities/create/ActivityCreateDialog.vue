<script setup lang="ts">
import { ref, computed, unref } from 'vue'
import MultiStepsDialog from '@/components/common/dialogs/MultiStepsDialog.vue'
import ActivityCreateForm from './ActivityCreateForm.vue'
import ActivitySkillLevelsForm from './ActivitySkillLevelsForm.vue'
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
const server_store = useServerStore()
const submitting = ref(false)
const error = ref<string | null>(null)

type Step = 'activity' | 'skill-levels'
const currentStep = ref<Step>('activity')
const activityPayload = ref<ICreateActivityRequest | null>(null)

const steps = computed(() => [
    {
        key: 'activity',
        label: t('userInterface.serverActivitiesView.addActivityModal.activityStep') || 'Activité',
        icon: 'pi pi-pencil'
    },
    {
        key: 'skill-levels',
        label: t('userInterface.serverActivitiesView.addActivityModal.skillLevelsTitle'),
        icon: 'pi pi-sliders-h'
    }
])

const currentIndex = computed(() => (currentStep.value === 'activity' ? 0 : 1))

const subtitle = computed(() =>
    currentStep.value === 'activity'
        ? t('userInterface.serverActivitiesView.addActivityModal.description')
        : t('userInterface.serverActivitiesView.addActivityModal.skillLevelsDescription') +
          ' (' +
          t('common.optional') +
          ')'
)

function goToStep(step: Step): void {
    currentStep.value = step
    error.value = null
}

function close(): void {
    // reset state on close
    currentStep.value = 'activity'
    activityPayload.value = null
    error.value = null
    emit('update:modelValue', false)
}

async function finalizeCreation(skillLevels: ICreateActivitySkillLevelRequest[]): Promise<void> {
    const payload: ICreateActivityRequest | null = activityPayload.value
    if (!payload) return
    submitting.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId!
        console.log('creating activity', payload)
        const res = await createActivity(serverId, payload)
        if (res.error || !res.data) {
            toast.add({ severity: 'error', summary: t('messages.error.create'), life: 2500 })
            throw new Error(res.error || 'Failed to create activity')
        }
        // activity created successfully
        console.log('activity created successfully', res.data)
        // If no skill levels to create, finish here
        if (!skillLevels.length) {
            toast.add({ severity: 'success', summary: t('messages.success.create'), life: 2500 })
            emit('created', res.data)
            close()
            return
        }

        // Create skill levels in parallel
        const activityId = res.data.public_id
        const promises = skillLevels.map((lvl) => createSkillLevel(serverId, activityId, lvl))
        const results = await Promise.all(promises)
        for (const levelRes of results) {
            if (levelRes.error) {
                throw new Error(levelRes.error)
            }
        }

        toast.add({ severity: 'success', summary: t('messages.success.create'), life: 2500 })
        emit('created', res.data)
        close()
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to create activity'
    } finally {
        submitting.value = false
    }
}

function handleActivityNext(payload: ICreateActivityRequest): void {
    activityPayload.value = {
        name: payload.name.trim(),
        description: (payload.description || '').trim(),
        logo: payload.logo || '',
        banner: payload.banner || ''
    } as ICreateActivityRequest
    goToStep('skill-levels')
}

function handleSkillLevelsSubmit(levels: ICreateActivitySkillLevelRequest[]): void {
    void finalizeCreation(levels)
}

function handleSkipSkillLevels(): void {
    void finalizeCreation([])
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
            @next="handleActivityNext"
            @cancel="close"
        />
        <ActivitySkillLevelsForm
            v-else
            :submitting="submitting"
            @back="goToStep('activity')"
            @skip="handleSkipSkillLevels"
            @submit="handleSkillLevelsSubmit"
        />
        <template #footer>
            <div class="w-full text-sm text-red-500 px-4 border-none">{{ error }}</div>
        </template>
    </MultiStepsDialog>
</template>
