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

// Duration Input Model for Editable Select
const durationInputModel = ref<string | number | IChrono>(60)

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

const chronoOptions = computed(() => {
    return availableChronos.value.map((c) => ({
        ...c,
        label: `${Math.ceil(c.elapsed / 60000)}`
    }))
})

// Watch durationInputModel to update duration and handle chrono selection
watch(durationInputModel, (val) => {
    if (val && typeof val === 'object' && 'id' in val) {
        // Chrono selected
        const chrono = val as IChrono
        selected_chrono.value = chrono
        const minutes = Math.ceil(chrono.elapsed / 60000)
        duration.value = Math.max(1, minutes)
        if (chrono.title) {
            title.value = chrono.title
        }
    } else {
        // Manual input
        selected_chrono.value = null
        const num = Number(val)
        if (!isNaN(num) && num > 0) {
            duration.value = num
        }
    }
})

// Sync duration back to input model (if changed externally or init)
watch(duration, (newVal) => {
    // Only update if the current model is not the chrono object (to preserve display)
    // and if the numeric value differs
    if (
        typeof durationInputModel.value !== 'object' &&
        Number(durationInputModel.value) !== newVal
    ) {
        durationInputModel.value = newVal
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

    // Init duration model
    durationInputModel.value = duration.value
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Activity -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-trophy text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700"
                        >{{ t('common.steps.activity') }} <span class="text-red-500">*</span></span
                    >
                </div>
                <div class="max-w-[180px]">
                    <ActivityAutocomplete
                        v-if="!props.preSelectedActivityId"
                        v-model="activity_name"
                        :initial-activity="pre_selected_activity"
                        @select="(a) => (selected_activity = a)"
                    />
                    <InputText v-else :model-value="pre_selected_activity?.name || ''" disabled />
                </div>
            </div>

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
        </div>

        <!-- Date and Duration Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <!-- Duration -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-clock text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700"
                        >{{ t('views.server_sessions.session_details.duration') }} ({{
                            t('common.misc.minutes_short')
                        }}) <span class="text-red-500">*</span></span
                    >
                </div>

                <!-- Editable Select if chronos exist -->
                <Select
                    v-if="availableChronos.length > 0"
                    v-model="durationInputModel"
                    :options="chronoOptions"
                    option-label="label"
                    editable
                    :placeholder="t('common.fields.duration') || 'Duration'"
                    class="w-full"
                >
                    <template #option="slotProps">
                        <div class="flex items-center gap-2">
                            <div
                                class="w-2 h-2 rounded-full"
                                :style="{ backgroundColor: slotProps.option.color }"
                            ></div>
                            <div>{{ slotProps.option.title }}</div>
                            <div class="text-xs text-surface-500 ml-auto">
                                {{ Math.ceil(slotProps.option.elapsed / 60000) }}m
                            </div>
                        </div>
                    </template>
                </Select>

                <!-- Standard InputNumber if no chronos -->
                <InputNumber
                    v-else
                    v-model="duration"
                    :min="1"
                    show-buttons
                    class="w-full"
                />
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
