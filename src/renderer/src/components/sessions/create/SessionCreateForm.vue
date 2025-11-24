<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivitySearch } from '@/composables/activities/useActivitySearch'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'
import type {
    ICreateActivitySessionRequest,
    IActivity
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'

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
const {
    activityQuery,
    activitySuggestions,
    selectedActivityId,
    searchActivities,
    onActivityQueryChange
} = useActivitySearch()

// Form fields
const title = ref('')
const duration = ref<number>(60)
const date = ref<Date>(new Date())
const selected_participants = ref<IServerMember[]>([])
const comment = ref('')
const pre_selected_activity = ref<IActivity | null>(null)

// Activity selection state
const effectiveActivityId = computed(() => props.preSelectedActivityId || selectedActivityId.value)

watch(effectiveActivityId, (newId) => {
    emit('update:activityId', newId || null)
})

// Initialize
onMounted(async () => {
    if (props.preSelectedActivityId && server_store.getPublicId) {
        const res = await getActivityById(server_store.getPublicId, props.preSelectedActivityId)
        if (!res.error && res.data) {
            pre_selected_activity.value = res.data
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
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
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
                        >{{ t('common.activity') }} <span class="text-red-500">*</span></span
                    >
                </div>
                <AutoComplete
                    v-if="!props.preSelectedActivityId"
                    v-model="activityQuery"
                    :suggestions="activitySuggestions"
                    option-label="name"
                    :placeholder="
                        t(
                            'userInterface.serverSessionsView.addSessionModal.searchActivityPlaceholder'
                        )
                    "
                    class="w-full"
                    :pt="{
                        input: { class: 'bg-surface-100', style: background_style },
                        overlay: { class: 'bg-surface-100', style: background_style }
                    }"
                    @complete="searchActivities($event.query)"
                    @item-select="(e) => onActivityQueryChange(e.value.name)"
                >
                    <template #option="slotProps">
                        <div class="flex items-center gap-2">
                            <img
                                v-if="slotProps.option.logo"
                                :src="slotProps.option.logo"
                                class="w-6 h-6 rounded object-cover"
                                alt="logo"
                            />
                            <div
                                v-else
                                class="w-6 h-6 rounded bg-surface-200 flex items-center justify-center text-xs"
                            >
                                {{ slotProps.option.name.charAt(0).toUpperCase() }}
                            </div>
                            <span>{{ slotProps.option.name }}</span>
                        </div>
                    </template>
                </AutoComplete>
                <InputText
                    v-else
                    :model-value="pre_selected_activity?.name || ''"
                    disabled
                    class="w-full"
                    :pt="{ root: { style: background_style } }"
                />
            </div>

            <!-- Title -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-tag text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">{{
                        t('common.title')
                    }}</span>
                </div>
                <InputText
                    v-model="title"
                    :placeholder="
                        t('userInterface.serverSessionsView.addSessionModal.titlePlaceholder') ||
                        'Optional title'
                    "
                    class="w-full"
                    :pt="{ root: { style: background_style } }"
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
                        >{{ t('common.date') }} <span class="text-red-500">*</span></span
                    >
                </div>
                <Calendar
                    v-model="date"
                    show-time
                    hour-format="24"
                    :pt="{ input: { style: background_style } }"
                    class="w-full"
                />
            </div>

            <!-- Duration -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-clock text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700"
                        >{{ t('common.duration') }} ({{ t('common.minutes_short') }})
                        <span class="text-red-500">*</span></span
                    >
                </div>
                <InputNumber
                    v-model="duration"
                    :min="1"
                    show-buttons
                    class="w-full"
                    :pt="{ input: { style: background_style } }"
                />
            </div>
        </div>

        <!-- Participants -->
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <i class="pi pi-users text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700">{{
                    t('common.participants')
                }}</span>
            </div>
            <MultiSelect
                v-model="selected_participants"
                :options="filteredMembers"
                option-label="nickname"
                filter
                display="chip"
                :placeholder="
                    t('userInterface.serverSessionsView.addSessionModal.selectParticipants')
                "
                class="w-full"
                :pt="{
                    root: { class: 'bg-surface-100', style: background_style },
                    overlay: { class: 'bg-surface-100', style: background_style },
                    listContainer: { class: 'bg-surface-100', style: background_style }
                }"
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
                <span class="text-sm font-medium text-surface-700">{{ t('common.comment') }}</span>
            </div>
            <Textarea
                v-model="comment"
                rows="3"
                auto-resize
                :placeholder="
                    t('userInterface.serverSessionsView.addSessionModal.commentPlaceholder')
                "
                :pt="{ root: { style: background_style } }"
            />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-auto pt-4">
            <Button :label="t('common.cancel')" severity="secondary" text @click="emit('cancel')" />
            <Button
                :label="t('common.next')"
                :disabled="!canSubmit"
                :loading="props.loading"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onCreate"
            />
        </div>
    </div>
</template>
