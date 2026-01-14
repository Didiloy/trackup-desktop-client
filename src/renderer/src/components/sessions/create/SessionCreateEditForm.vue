<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useSessionCRUD } from '@/composables/sessions/useSessionCRUD'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'
import type {
    ICreateActivitySessionRequest,
    IActivity,
    IUpdateActivityRequest
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { ISession, IUpdateSessionRequest } from '@shared/contracts/interfaces/entities/session.interfaces'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import ActivityAutocomplete from '@/components/activities/ActivityAutocomplete.vue'
import Select from 'primevue/select'
import { useChronos, type IChrono } from '@/composables/useChronos'
import DurationInput from '@/components/common/inputs/DurationInput.vue'
import { formatDuration, convertMsToMinutes } from '@/utils/time.utils'
import Icon from '@/components/common/icons/Icon.vue'
import ActivityIcon from '@/components/common/icons/ActivityIcon.vue'
import MemberIcon from '@/components/common/icons/MemberIcon.vue'

const props = withDefaults(
    defineProps<{
        preSelectedActivityId?: string | null
        initialSession?: ISession | null
    }>(),
    {
        preSelectedActivityId: null,
        initialSession: null
    }
)

const emit = defineEmits<{
    (e: 'success', session: ISession): void
    (e: 'cancel'): void
    (e: 'update:activityId', id: string | null): void
}>()

const { t } = useI18n()
const toast = useToast()
const server_store = useServerStore()
const user_store = useUserStore()
const { getActivityById, createActivitySession } = useActivityCRUD()
const { updateSession } = useSessionCRUD()
const { chronos, removeChrono } = useChronos()

// Form fields
const title = ref('')
const TITLE_MAX_LENGTH = 100
const duration = ref<number>(60)
const date = ref<Date>(new Date())
const selected_participants = ref<IServerMember[]>([])
const comment = ref('')
const pre_selected_activity = ref<IActivity | null>(null)
const selected_activity = ref<IActivity | null>(null)
const activity_name = ref('')
const selected_chrono = ref<IChrono | null>(null)

// Loading state
const submitting = ref(false)

// Mode detection
const isEditMode = computed(() => !!props.initialSession)

// Activity selection state
const effectiveActivityId = computed(() => {
    if (props.initialSession) return props.initialSession.activity.public_id
    if (props.preSelectedActivityId) return props.preSelectedActivityId
    return selected_activity.value?.public_id
})

watch(effectiveActivityId, (newId) => {
    emit('update:activityId', newId || null)
})

// Chrono Options with Label
const availableChronos = computed(() => {
    const chronos_running: IChrono[] = chronos.value.filter((c) => !c.isRunning)
    return chronos_running.map((c) => ({
        ...c,
        label: c.title || c.color
    }))
})

// Watch selected_chrono to update duration and title (Only in create mode)
watch(selected_chrono, (chrono) => {
    if (chrono && !isEditMode.value) {
        duration.value = convertMsToMinutes(chrono.elapsed)
        title.value = chrono.title || ''
    }
})

// Initialize
onMounted(async () => {
    // If Edit Mode
    if (props.initialSession) {
        title.value = props.initialSession.title
        duration.value = Number(props.initialSession.duration)
        date.value = new Date(props.initialSession.date)
        comment.value = props.initialSession.comment || ''
        
        // Map participants
        if (props.initialSession.server_member && server_store.getMembers) {
             const sessionMemberIds = props.initialSession.server_member.map(m => m.public_id)
             selected_participants.value = server_store.getMembers.filter(m => sessionMemberIds.includes(m.public_id))
        }

        // Fetch activity details to populate the mock activity object for display
        // Though in edit mode we might just disable activity selection and show the name
        // We construct a partial IActivity since we can't easily fetch full detail if not needed, 
        // but let's try to fetch if we have ID.
        if (props.initialSession.activity.public_id && server_store.getPublicId) {
             const res = await getActivityById(server_store.getPublicId, props.initialSession.activity.public_id)
            if (!res.error && res.data) {
                pre_selected_activity.value = res.data
                selected_activity.value = res.data
                activity_name.value = res.data.name
            } else {
                // Fallback if fetch fails
                 activity_name.value = props.initialSession.activity.name
            }
        }
    } 
    // If Create Mode with pre-selected activity
    else if (props.preSelectedActivityId && server_store.getPublicId) {
        const res = await getActivityById(server_store.getPublicId, props.preSelectedActivityId)
        if (!res.error && res.data) {
            pre_selected_activity.value = res.data
            selected_activity.value = res.data
            activity_name.value = res.data.name
        }
    }

    // Emit initial value if present
    if (effectiveActivityId.value) {
        emit('update:activityId', effectiveActivityId.value)
    }
})

const canSubmit = computed(() => {
    return (
        !submitting.value &&
        !!effectiveActivityId.value &&
        duration.value > 0 &&
        !!date.value &&
        title.value.length <= TITLE_MAX_LENGTH
    )
})

const filteredMembers = computed(
    () => server_store.getMembers?.filter((m) => m.user_email !== user_store.getEmail) || []
)

// Submit handler
async function onSubmit(): Promise<void> {
    if (!canSubmit.value || !effectiveActivityId.value) return

    submitting.value = true
    const serverId = server_store.getPublicId
    if (!serverId) {
        toast.add({ severity: 'error', summary: t('messages.error.noServerSelected'), life: 3000 })
        submitting.value = false
        return
    }

    try {
        if (isEditMode.value && props.initialSession) {
             // Update
            const payload: IUpdateSessionRequest = {
                title: title.value.trim() || undefined,
                duration: Number(duration.value),
                date: date.value.toISOString(),
                participants: selected_participants.value.map((m) => m.public_id),
                comment: comment.value.trim() || undefined
            }

            const res = await updateSession(serverId, props.initialSession.public_id, payload)
            if (res.error || !res.data) {
                throw new Error(res.error || t('messages.error.updateFailed'))
            }

            toast.add({ severity: 'success', summary: t('messages.success.update'), life: 2500 })
            emit('success', res.data)

        } else {
            // Create
            const payload: ICreateActivitySessionRequest = {
                title: title.value.trim() || undefined,
                duration: Number(duration.value),
                date: date.value.toISOString(),
                participants: selected_participants.value.map((m) => m.public_id),
                comment: comment.value.trim() || undefined
            }

            const res = await createActivitySession(serverId, effectiveActivityId.value, payload)
            if (res.error || !res.data) {
                throw new Error(res.error || t('messages.error.createSessionFailed'))
            }

            toast.add({ severity: 'success', summary: t('messages.success.create'), life: 2500 })

            // Remove chrono if selected
            if (selected_chrono.value) {
                removeChrono(selected_chrono.value.id)
            }

            emit('success', res.data)
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : t('messages.error.operationFailed')
        toast.add({ severity: 'error', summary: message, life: 3000 })
    } finally {
        submitting.value = false
    }
}

const isHexColor = (v?: string): boolean => {
    if (!v) return false
    return /^#([0-9A-F]{3}){1,2}$/i.test(v)
}
</script>

<template>
    <div class="flex flex-col gap-6 h-full">
        <!-- Activity and Title Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Title -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-tag text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">
                        {{ t('common.fields.title') }}
                    </span>
                    <span class="text-xs text-surface-500 text-right">
                        {{ title.length }}/{{ TITLE_MAX_LENGTH }}
                    </span>
                </div>
                <InputText
                    v-model="title"
                    :placeholder="t('views.server_sessions.add_modal.title_placeholder')"
                    :maxlength="TITLE_MAX_LENGTH"
                    class="w-full"
                />
            </div>

            <!-- Activity -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <ActivityIcon class="text-surface-500" />
                    <span class="text-sm font-medium text-surface-700"
                        >{{ t('common.steps.activity') }} <span class="text-red-500">*</span></span
                    >
                </div>
                <div class="w-full">
                    <!-- If Edit Mode or Pre-selected, show readonly input -->
                    <InputText
                        v-if="isEditMode || props.preSelectedActivityId"
                        :model-value="pre_selected_activity?.name || activity_name"
                        disabled
                        class="w-full"
                    />
                     <!-- Else show Autocomplete -->
                    <ActivityAutocomplete
                        v-else
                        v-model="activity_name"
                        :initial-activity="pre_selected_activity"
                        @select="(a) => (selected_activity = a)"
                    />
                </div>
            </div>

            <!-- Date -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-calendar text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700"
                        >{{ t('common.fields.date') }} <span class="text-red-500">*</span></span
                    >
                </div>
                <DatePicker
                    v-model="date"
                    show-time
                    hour-format="24"
                    date-format="dd/mm/yy"
                    class="w-full date-picker-full"
                />
            </div>
        </div>

        <!-- Row 2: Duration -->
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <i class="pi pi-clock text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700"
                    >{{ t('common.fields.duration') }} <span class="text-red-500">*</span></span
                >
            </div>

            <div class="flex gap-2">
                <DurationInput v-model="duration" :show-seconds="false" class="flex-1" />

                <!-- Chronos only in Create Mode -->
                <div v-if="!isEditMode && availableChronos.length > 0" class="flex flex-col gap-1">
                    <Select
                        v-model="selected_chrono"
                        :options="availableChronos"
                        option-label="label"
                        :placeholder="t('common.actions.select_short')"
                        class="h-9 w-28"
                    >
                        <template #option="slotProps">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-2 h-2 rounded-full"
                                    :style="{ backgroundColor: slotProps.option.color }"
                                ></div>
                                <div
                                    v-tooltip.right="slotProps.option.title"
                                    class="truncate max-w-[80px]"
                                >
                                    {{ slotProps.option.title }}
                                </div>
                                <div class="text-xs text-surface-500 ml-auto">
                                    {{ formatDuration(slotProps.option.elapsed) }}
                                </div>
                            </div>
                        </template>
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center gap-2">
                                <div
                                    class="rounded-full"
                                    :style="{
                                        backgroundColor: slotProps.value.color
                                    }"
                                    :class="[
                                        isHexColor(slotProps.value?.label) ? 'w-12 h-5' : 'w-3 h-3'
                                    ]"
                                />
                                <div
                                    v-if="!isHexColor(slotProps.value?.label)"
                                    v-tooltip.right="slotProps.value.title"
                                    class="truncate max-w-[120px]"
                                >
                                    {{ slotProps.value?.label }}
                                </div>
                            </div>
                        </template>
                    </Select>
                    <span class="text-xs text-center text-surface-500">{{
                        t('common.fields.chronos')
                    }}</span>
                </div>
            </div>
        </div>

        <!-- Participants -->
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <MemberIcon class="text-surface-500" />
                <span class="text-sm font-medium text-surface-700">{{
                    t('views.server_sessions.session_details.extra_participants')
                }}</span>
            </div>
            <MultiSelect
                v-model="selected_participants"
                :options="filteredMembers"
                option-label="nickname"
                filter
                display="chip"
                :placeholder="t('views.server_sessions.add_modal.select_participants')"
                class="w-full"
            >
                <template #option="slotProps">
                    <div class="flex items-center gap-2">
                        <Avatar
                            :image="slotProps.option.avatar_url"
                            shape="circle"
                            size="small"
                        />
                        <span>{{ slotProps.option.nickname }}</span>
                    </div>
                </template>
            </MultiSelect>
        </div>

        <!-- Comment -->
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <i class="pi pi-comment text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700">{{
                    t('views.server_sessions.session_details.comment')
                }}</span>
            </div>
            <Textarea
                v-model="comment"
                rows="3"
                auto-resize
                :placeholder="t('views.server_sessions.add_modal.comment_placeholder')"
            />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-auto pt-4">
            <Button
                :label="t('common.actions.cancel')"
                severity="secondary"
                text
                @click="emit('cancel')"
            />
            <Button
                :label="isEditMode ? t('common.actions.save') : t('common.actions.next')"
                :disabled="!canSubmit"
                :loading="submitting"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onSubmit"
            />
        </div>
    </div>
</template>

<style scoped>
:deep(.date-picker-full) {
    width: 100%;
}

:deep(.date-picker-full input) {
    width: 100%;
}
</style>
