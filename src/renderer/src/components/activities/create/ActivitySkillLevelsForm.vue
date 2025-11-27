<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ICreateActivitySkillLevelRequest } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { useActivitySkillLevelCRUD } from '@/composables/activities/skillLevels/useActivitySkillLevelCRUD'
import { useServerStore } from '@/stores/server'

const props = withDefaults(
    defineProps<{
        submitting?: boolean
        initialDisplayOrder?: number
        activityId?: string | null
    }>(),
    {
        submitting: false,
        initialDisplayOrder: 1,
        activityId: null
    }
)

const emit = defineEmits<{
    (e: 'skip'): void
    (e: 'create', levels: ICreateActivitySkillLevelRequest[]): void
}>()

const { t } = useI18n()
const { listSkillLevels } = useActivitySkillLevelCRUD()
const server_store = useServerStore()

const levels = ref<ICreateActivitySkillLevelRequest[]>([])
const nextDisplayOrder = ref(props.initialDisplayOrder)

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
        const maxOrder = Math.max(...res.data.map((lvl) => lvl.display_order ?? 0))
        nextDisplayOrder.value = maxOrder + 1
    } catch (e) {
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

function submitLevels(): void {
    emit('create', levels.value)
}
</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <div class="flex items-center gap-2">
            <i class="pi pi-sliders-h text-surface-500"></i>
            <div class="flex flex-col">
                <span class="text-sm font-medium text-surface-700">
                    {{ t('userInterface.serverActivitiesView.addActivityModal.skillLevelsTitle') }}
                </span>
                <span class="text-xs text-surface-500">
                    {{
                        t(
                            'userInterface.serverActivitiesView.addActivityModal.skillLevelsDescription'
                        )
                    }}
                </span>
                <span class="text-xs text-surface-500">
                    {{
                        t(
                            'userInterface.serverActivitiesView.addActivityModal.skillLevelsDescriptionDetail'
                        )
                    }}
                </span>
            </div>
        </div>

        <!-- Draft form -->
        <div class="grid grid-cols-1 gap-3">
            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.name') }}</label>
                <InputText v-model="draft.name" class="w-full" />
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{
                    t('userInterface.serverActivitiesView.addActivityModal.color')
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
                        t('userInterface.serverActivitiesView.addActivityModal.minSessions')
                    }}</label>
                    <InputNumber v-model="draft.min_sessions" class="w-full" show-buttons />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.maxSessions')
                    }}</label>
                    <InputNumber v-model="draft.max_sessions" class="w-full" show-buttons />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.minDuration')
                    }}</label>
                    <InputNumber v-model="draft.min_duration" class="w-full" show-buttons />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.maxDuration')
                    }}</label>
                    <InputNumber v-model="draft.max_duration" class="w-full" show-buttons />
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.description') }}</label>
                <Textarea v-model="draft.description" rows="2" auto-resize />
            </div>

            <div class="flex justify-end">
                <Button
                    :label="t('actions.add') || 'Add level'"
                    icon="pi pi-plus"
                    :disabled="!can_add"
                    outlined
                    @click="addLevel"
                />
            </div>
        </div>

        <!-- Levels list -->
        <div v-if="levels.length" class="flex flex-col gap-2">
            <div class="text-sm font-medium text-surface-700">
                {{ t('userInterface.serverActivitiesView.addActivityModal.levels') }}
            </div>
            <div class="flex flex-col gap-2">
                <div
                    v-for="(lvl, idx) in levels"
                    :key="idx"
                    class="flex items-center justify-between p-2 rounded-md"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-surface-600">#{{ lvl.display_order }}</span>
                        <span class="text-sm text-surface-900">{{ lvl.name }}</span>
                        <span class="text-xs text-surface-600">
                            {{ lvl.min_sessions }}-{{ lvl.max_sessions ?? '∞' }}
                            {{ t('userInterface.serverActivitiesView.addActivityModal.sessions') }},
                            {{ lvl.min_duration }}-{{ lvl.max_duration ?? '∞' }}
                            {{ t('userInterface.serverActivitiesView.addActivityModal.minutes') }}
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
            <Button :label="t('common.skip')" severity="secondary" text @click="emit('skip')" />
            <Button
                :label="t('actions.create')"
                :loading="props.submitting"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="submitLevels"
            />
        </div>
    </div>
</template>
