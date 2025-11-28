import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useActivitySkillLevelCRUD } from '@/composables/activities/skillLevels/useActivitySkillLevelCRUD'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type {
    IActivity,
    ICreateActivityRequest,
    IUpdateActivityRequest
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { ICreateActivitySkillLevelRequest } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import type { ICreateActivityMetadataDefinitionRequest } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

export type Step = 'activity' | 'metadata' | 'skill-levels'

interface UseActivityCreateOrEditProps {
    activityId?: string | null
    mode: 'create' | 'edit'
    onSuccess?: (activity: IActivity) => void
    onUpdate?: () => void
}

export function useActivityCreateOrEdit(props: UseActivityCreateOrEditProps) {
    const { t } = useI18n()
    const toast = useToast()
    const { createActivity, updateActivity } = useActivityCRUD()
    const { createSkillLevel } = useActivitySkillLevelCRUD()
    const { createMetadataDefinition } = useActivityMetadataDefinitionCRUD()
    const server_store = useServerStore()

    const submitting = ref(false)
    const error = ref<string | null>(null)
    const currentStep = ref<Step>('activity')
    const createdActivity = ref<IActivity | null>(null)

    const currentIndex = computed(() =>
        currentStep.value === 'activity' ? 0 : currentStep.value === 'metadata' ? 1 : 2
    )

    function advanceTo(step: Step): void {
        currentStep.value = step
        error.value = null
    }

    function resetState(): void {
        currentStep.value = 'activity'
        error.value = null
        submitting.value = false
        createdActivity.value = null
    }

    async function handleActivitySubmit(
        payload: ICreateActivityRequest | IUpdateActivityRequest
    ): Promise<void> {
        if (submitting.value) return
        submitting.value = true
        error.value = null
        try {
            const serverId = server_store.getPublicId
            if (!serverId) throw new Error(t('messages.error.noServerSelected'))

            let res
            if (props.mode === 'create') {
                const createPayload = payload as ICreateActivityRequest
                const sanitizedPayload: ICreateActivityRequest = {
                    name: createPayload.name.trim(),
                    description: (createPayload.description || '').trim(),
                    logo: createPayload.logo || '',
                    banner: createPayload.banner || ''
                }
                res = await createActivity(serverId, sanitizedPayload)
            } else {
                // Edit mode
                if (!props.activityId) throw new Error('Activity ID required for edit mode')
                res = await updateActivity(
                    serverId,
                    props.activityId,
                    payload as IUpdateActivityRequest
                )
            }

            if (res.error || !res.data) {
                throw new Error(res.error || t('messages.error.create'))
            }

            if (props.mode === 'create') {
                createdActivity.value = res.data
                toast.add({
                    severity: 'success',
                    summary: t('messages.success.create'),
                    life: 2500
                })
                advanceTo('metadata')
            } else {
                toast.add({
                    severity: 'success',
                    summary: t('messages.success.update'),
                    life: 2500
                })
                if (props.onUpdate) props.onUpdate()
                advanceTo('metadata')
            }
        } catch (e) {
            error.value =
                e instanceof Error
                    ? e.message
                    : props.mode === 'create'
                      ? t('messages.error.create')
                      : t('messages.error.update')
        } finally {
            submitting.value = false
        }
    }

    async function handleMetadataSubmit(
        defs: ICreateActivityMetadataDefinitionRequest[]
    ): Promise<void> {
        const targetActivityId =
            props.mode === 'create' ? createdActivity.value?.public_id : props.activityId

        if (!targetActivityId) {
            if (props.mode === 'create') {
                // Should not happen if flow is correct
                return
            } else {
                throw new Error('Activity ID missing')
            }
        }

        if (!defs.length) {
            advanceTo('skill-levels')
            return
        }

        submitting.value = true
        error.value = null
        try {
            const serverId = server_store.getPublicId
            if (!serverId) throw new Error(t('messages.error.noServerSelected'))

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
                sanitizedDefs.map((def) =>
                    createMetadataDefinition(serverId, targetActivityId, { ...def })
                )
            )

            for (const res of results) {
                if (res.error) {
                    throw new Error(res.error)
                }
            }

            toast.add({
                severity: 'success',
                summary: t('messages.success.update'), // Generic success message for metadata addition
                life: 2500
            })

            if (props.mode === 'edit' && props.onUpdate) {
                props.onUpdate()
            }

            advanceTo('skill-levels')
        } catch (e) {
            error.value = e instanceof Error ? e.message : t('messages.error.addMetadataFailed')
        } finally {
            submitting.value = false
        }
    }

    async function handleSkillLevelsSubmit(
        levels: ICreateActivitySkillLevelRequest[],
        onComplete: () => void
    ): Promise<void> {
        const targetActivityId =
            props.mode === 'create' ? createdActivity.value?.public_id : props.activityId

        if (!targetActivityId) {
            if (props.mode === 'create') {
                onComplete()
                return
            } else {
                throw new Error('Activity ID missing')
            }
        }

        if (!levels.length) {
            if (props.mode === 'create' && createdActivity.value && props.onSuccess) {
                props.onSuccess(createdActivity.value)
            }
            onComplete()
            return
        }

        submitting.value = true
        error.value = null
        try {
            const serverId = server_store.getPublicId
            if (!serverId) throw new Error(t('messages.error.noServerSelected'))

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
                sanitizedLevels.map((lvl) =>
                    createSkillLevel(serverId, targetActivityId, { ...lvl })
                )
            )

            for (const res of results) {
                if (res.error) {
                    throw new Error(res.error)
                }
            }

            toast.add({
                severity: 'success',
                summary: t('messages.success.update'), // Generic success for skill levels
                life: 2500
            })

            if (props.mode === 'create' && createdActivity.value && props.onSuccess) {
                props.onSuccess(createdActivity.value)
            } else if (props.mode === 'edit' && props.onUpdate) {
                props.onUpdate()
            }

            onComplete()
        } catch (e) {
            error.value = e instanceof Error ? e.message : t('messages.error.addSkillLevelsFailed')
        } finally {
            submitting.value = false
        }
    }

    return {
        currentStep,
        currentIndex,
        submitting,
        error,
        createdActivity,
        advanceTo,
        resetState,
        handleActivitySubmit,
        handleMetadataSubmit,
        handleSkillLevelsSubmit
    }
}
