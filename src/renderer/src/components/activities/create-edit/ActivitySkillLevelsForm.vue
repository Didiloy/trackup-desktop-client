<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
    ICreateActivitySkillLevelRequest,
    IActivitySkillLevel
} from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { useActivitySkillLevelCRUD } from '@/composables/activities/skillLevels/useActivitySkillLevelCRUD'
import { useServerStore } from '@/stores/server'
import { useToast } from 'primevue/usetoast'
import SkillLevelIcon from '@/components/common/icons/SkillLevelIcon.vue'

const props = withDefaults(
    defineProps<{
        initialDisplayOrder?: number
        activityId?: string | null
    }>(),
    {
        initialDisplayOrder: 1,
        activityId: null
    }
)

const emit = defineEmits<{
    (e: 'skip'): void
    (e: 'success'): void
}>()

const { t } = useI18n()
const toast = useToast()
const { listSkillLevels, deleteSkillLevel, createSkillLevel } = useActivitySkillLevelCRUD()
const server_store = useServerStore()

const levels = ref<ICreateActivitySkillLevelRequest[]>([])
const existingLevels = ref<IActivitySkillLevel[]>([])
const nextDisplayOrder = ref(props.initialDisplayOrder)
const submitting = ref(false)

const draft = ref({
    name: '',
    min_sessions: 0,
    max_sessions: null as number | null,
    min_duration: 0,
    max_duration: null as number | null,
    description: '',
    color: '#4CAF50'
})

const can_add = computed(() => {
    return !!draft.value.name.trim()
})

function normalizeColor(raw: string | null | undefined): string | undefined {
    const value = raw?.trim()
    if (!value) return undefined
    return value.startsWith('#') ? value : `#${value}`
}

const normalized_color = computed(() => {
    return normalizeColor(draft.value.color)
})

async function syncDisplayOrder(): Promise<void> {
    if (!props.activityId) return
    const serverId = server_store.getPublicId
    if (!serverId) return
    try {
        const res = await listSkillLevels(serverId, props.activityId)
        if (res.error || !res.data?.length) {
            nextDisplayOrder.value = props.initialDisplayOrder
            return
        }
        existingLevels.value = res.data
        const maxOrder = Math.max(...res.data.map((lvl) => lvl.display_order ?? 0))
        nextDisplayOrder.value = maxOrder + 1
    } catch {
        nextDisplayOrder.value = props.initialDisplayOrder
    }
}

onMounted(async () => {
    await syncDisplayOrder()
})

watch(
    () => props.activityId,
    async (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
            await syncDisplayOrder()
        }
    }
)
function addLevel(): void {
    if (!can_add.value) return
    levels.value.push({
        name: draft.value.name.trim(),
        display_order: nextDisplayOrder.value,
        min_sessions: Number(draft.value.min_sessions) || 0,
        max_sessions: draft.value.max_sessions ?? null,
        min_duration: Number(draft.value.min_duration) || 0,
        max_duration: draft.value.max_duration ?? null,
        description: draft.value.description?.trim() || undefined,
        color: normalizeColor(draft.value.color) || undefined
    })
    nextDisplayOrder.value += 1
    draft.value = {
        name: '',
        min_sessions: 0,
        max_sessions: null,
        min_duration: 0,
        max_duration: null,
        description: '',
        color: '#4CAF50'
    }
}

function removeLevel(index: number): void {
    levels.value.splice(index, 1)
}

async function removeExistingLevel(levelId: string): Promise<void> {
    if (!props.activityId || !server_store.getPublicId) return
    try {
        const res = await deleteSkillLevel(server_store.getPublicId, props.activityId, levelId)
        if (res.error) {
            throw new Error(res.error)
        }
        await syncDisplayOrder()
    } catch (e) {
        console.error('Failed to delete skill level', e)
        toast.add({
            severity: 'error',
            summary: t('messages.error.delete'),
            detail: e instanceof Error ? e.message : String(e),
            life: 2500
        })
    }
}

async function onSubmit(): Promise<void> {
    if (levels.value.length === 0) {
        emit('success')
        return
    }

    submitting.value = true
    try {
        const serverId = server_store.getPublicId
        if (!serverId || !props.activityId) {
            throw new Error(t('messages.error.noServerSelected'))
        }

        for (const level of levels.value) {
            const res = await createSkillLevel(serverId, props.activityId, level)
            if (res.error) {
                throw new Error(res.error)
            }
        }

        toast.add({ severity: 'success', summary: t('messages.success.create'), life: 2500 })
        emit('success')
    } catch (e) {
        const message = e instanceof Error ? e.message : t('messages.error.create')
        toast.add({ severity: 'error', summary: message, life: 3000 })
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <div class="flex items-center gap-2">
            <SkillLevelIcon class="text-primary-500" />
            <div class="flex flex-col">
                <span class="text-sm font-medium text-surface-700">
                    {{ t('views.server_activities.add_modal.skill_levels_title') }}
                </span>
                <span class="text-xs text-surface-500">
                    {{ t('views.server_activities.add_modal.skill_levels_description') }}
                </span>
                <span class="text-xs text-surface-500">
                    {{ t('views.server_activities.add_modal.skill_levels_description_detail') }}
                </span>
            </div>
        </div>

        <!-- Draft form -->
        <div class="grid grid-cols-1 gap-3">
            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.fields.name') }}</label>
                <InputText v-model="draft.name" class="w-full" />
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{
                    t('views.server_activities.add_modal.color')
                }}</label>
                <div class="flex items-center gap-2">
                    <ColorPicker v-model="draft.color" />
                    <InputText
                        v-model="draft.color"
                        placeholder="#4CAF50"
                        class="w-full"
                        :value="normalized_color"
                    />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('views.server_activities.add_modal.min_sessions')
                    }}</label>
                    <InputNumber v-model="draft.min_sessions" class="w-full" show-buttons />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('views.server_activities.add_modal.max_sessions')
                    }}</label>
                    <InputNumber v-model="draft.max_sessions" class="w-full" show-buttons />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('views.server_activities.add_modal.min_duration')
                    }}</label>
                    <InputNumber v-model="draft.min_duration" class="w-full" show-buttons />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('views.server_activities.add_modal.max_duration')
                    }}</label>
                    <InputNumber v-model="draft.max_duration" class="w-full" show-buttons />
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.fields.description') }}</label>
                <Textarea v-model="draft.description" rows="2" auto-resize />
            </div>

            <div class="flex justify-end">
                <Button
                    :label="t('views.server_activities.add_modal.add_level')"
                    icon="pi pi-plus"
                    :disabled="!can_add"
                    outlined
                    @click="addLevel"
                />
            </div>
        </div>

        <!-- Levels list -->
        <div v-if="levels.length || existingLevels.length" class="flex flex-col gap-2">
            <div class="text-sm font-medium text-surface-700">
                {{ t('views.server_activities.add_modal.levels') }}
            </div>
            <div class="flex flex-col gap-2">
                <!-- Existing levels -->
                <div
                    v-for="lvl in existingLevels"
                    :key="lvl.public_id"
                    class="flex items-center justify-between p-2 rounded-md bg-surface-100 opacity-75"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-surface-600">#{{ lvl.display_order }}</span>
                        <span class="text-sm text-surface-900 font-medium">{{ lvl.name }}</span>
                        <span class="text-xs text-surface-600">
                            {{ lvl.min_sessions }}-{{ lvl.max_sessions ?? ' ∞' }}
                            {{ t('views.server_activities.performance_section.sessions') }},
                            {{ lvl.min_duration }}-{{ lvl.max_duration ?? ' ∞' }}
                            {{ t('views.server_activities.add_modal.minutes') }}
                        </span>
                    </div>
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        size="small"
                        @click="removeExistingLevel(lvl.public_id)"
                    />
                </div>

                <!-- New levels (drafts) -->
                <div
                    v-for="(lvl, idx) in levels"
                    :key="idx"
                    class="flex items-center justify-between p-2 rounded-md bg-surface-50 border border-surface-200"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-surface-600">#{{ lvl.display_order }}</span>
                        <span class="text-sm text-surface-900">{{ lvl.name }}</span>
                        <span class="text-xs text-surface-600">
                            {{ lvl.min_sessions }}-{{ lvl.max_sessions ?? '∞' }}
                            {{ t('views.server_activities.performance_section.sessions') }},
                            {{ lvl.min_duration }}-{{ lvl.max_duration ?? '∞' }}
                            {{ t('views.server_activities.add_modal.minutes') }}
                        </span>
                    </div>
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        size="small"
                        @click="removeLevel(idx)"
                    />
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 mt-auto">
            <Button
                :label="t('common.actions.skip')"
                severity="secondary"
                text
                @click="emit('skip')"
            />
            <Button
                :label="t('common.actions.create')"
                :loading="submitting"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onSubmit"
            />
        </div>
    </div>
</template>
