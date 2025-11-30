<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'
import type {
    ICreateActivitySessionRequest,
    IActivity
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import ActivityAutocomplete from '@/components/activities/ActivityAutocomplete.vue'
import Select from 'primevue/select'
import { useChronos, type IChrono } from '@/composables/useChronos'
import DurationInput from '@/components/common/inputs/DurationInput.vue'
import { formatDuration, convertMsToMinutes } from '@/utils/time.utils'

const props = withDefaults(
    defineProps<{
        loading?: boolean
        preSelectedActivityId?: string | null
    }>(),
    {
        loading: false,
        preSelectedActivityId: null
    }
)

const emit = defineEmits<{
    (e: 'create', payload: { activityId: string; request: ICreateActivitySessionRequest }): void
    (e: 'cancel'): void
    (e: 'update:activityId', id: string | null): void
}>()

const { t } = useI18n()
const server_store = useServerStore()
const user_store = useUserStore()
const { getActivityById } = useActivityCRUD()
const { chronos, removeChrono } = useChronos()

// Form fields
const title = ref('')
const duration = ref<number>(60)
const date = ref<Date>(new Date())
const selected_participants = ref<IServerMember[]>([])
const comment = ref('')
const pre_selected_activity = ref<IActivity | null>(null)
const selected_activity = ref<IActivity | null>(null)
const activity_name = ref('')
const selected_chrono = ref<IChrono | null>(null)

// Activity selection state
const effectiveActivityId = computed(() => {
    if (props.preSelectedActivityId) return props.preSelectedActivityId
    return selected_activity.value?.public_id
})

watch(effectiveActivityId, (newId) => {
    emit('update:activityId', newId || null)
})

// Chrono Options with Label
const availableChronos = computed(() => {
    return chronos.value.filter((c) => !c.isRunning)
})


// Watch selected_chrono to update duration and title
watch(selected_chrono, (chrono) => {
    if (chrono) {
        duration.value = convertMsToMinutes(chrono.elapsed)
        if (chrono.title) {
            title.value = chrono.title
        }
    }
})

// Initialize
onMounted(async () => {
    if (props.preSelectedActivityId && server_store.getPublicId) {
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
    return !props.loading && !!effectiveActivityId.value && duration.value > 0 && !!date.value
})

const filteredMembers = computed(
    () => server_store.getMembers?.filter((m) => m.user_email !== user_store.getEmail) || []
)

// Participants
function onCreate(): void {
    if (!canSubmit.value || !effectiveActivityId.value) return

    const payload: ICreateActivitySessionRequest = {
        title: title.value.trim() || undefined, // Optional, backend generates if missing
        duration: Number(duration.value),
        date: date.value.toISOString(),
        participants: selected_participants.value.map((m) => m.public_id),
        comment: comment.value.trim() || undefined
    }

    emit('create', {
        activityId: effectiveActivityId.value,
        request: payload
    })

    if (selected_chrono.value) {
        removeChrono(selected_chrono.value.id)
    }
}
</script>

<template>
    <div class="flex flex-col gap-6 h-full">
        <!-- Activity and Title Row -->
        <!-- Row 1: Title, Activity, Date -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Title -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-tag text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">{{
                        t('common.fields.title')
                    }}</span>
                </div>
                <InputText
                    v-model="title"
                    :placeholder="t('views.server_sessions.add_modal.title_placeholder')"
                    class="w-full"
                />
            </div>

            <!-- Activity -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-trophy text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700"
                        >{{ t('common.steps.activity') }} <span class="text-red-500">*</span></span
                    >
                </div>
                <div class="w-full">
                    <ActivityAutocomplete
                        v-if="!props.preSelectedActivityId"
                        v-model="activity_name"
                        :initial-activity="pre_selected_activity"
                        @select="(a) => (selected_activity = a)"
                    />
                    <InputText
                        v-else
                        :model-value="pre_selected_activity?.name || ''"
                        disabled
                        class="w-full"
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
                <DatePicker v-model="date" show-time hour-format="24" class="w-full" />
            </div>
        </div>

        <!-- Row 2: Duration -->
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <i class="pi pi-clock text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700"
                    >{{ t('views.server_sessions.session_details.duration') }}
                    <span class="text-red-500">*</span></span
                >
            </div>

            <div class="flex gap-2">
                <DurationInput v-model="duration" :show-seconds="false" class="flex-1" />

                <div v-if="availableChronos.length > 0" class="flex flex-col gap-1">
                    <!-- Select if chronos exist -->
                    <Select
                        v-model="selected_chrono"
                        :options="availableChronos"
                        option-label="title"
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
                <i class="pi pi-users text-surface-500"></i>
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
                            :label="slotProps.option.nickname?.charAt(0).toUpperCase()"
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
                :label="t('common.actions.next')"
                :disabled="!canSubmit"
                :loading="props.loading"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onCreate"
            />
        </div>
    </div>
</template>
