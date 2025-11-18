<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ICreateActivitySkillLevelRequest } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'

const props = defineProps<{
    submitting?: boolean
}>()

const emit = defineEmits<{
    (e: 'back'): void
    (e: 'skip'): void
    (e: 'submit', levels: ICreateActivitySkillLevelRequest[]): void
}>()

const { t } = useI18n()

const levels = ref<ICreateActivitySkillLevelRequest[]>([])

const draft = ref<ICreateActivitySkillLevelRequest>({
    name: '',
    display_order: 1,
    min_sessions: 0,
    max_sessions: null,
    min_duration: 0,
    max_duration: null,
    description: '',
    color: ''
})

const can_add = computed(() => {
    return !!draft.value.name.trim() && draft.value.display_order >= 0
})

function addLevel(): void {
    if (!can_add.value) return
    levels.value.push({
        name: draft.value.name.trim(),
        display_order: draft.value.display_order,
        min_sessions: Number(draft.value.min_sessions) || 0,
        max_sessions: draft.value.max_sessions ?? null,
        min_duration: Number(draft.value.min_duration) || 0,
        max_duration: draft.value.max_duration ?? null,
        description: draft.value.description?.trim() || undefined,
        color: draft.value.color?.trim() || undefined
    })
    // reset draft, keep display_order incremented
    const nextOrder = draft.value.display_order + 1
    draft.value = {
        name: '',
        display_order: nextOrder,
        min_sessions: 0,
        max_sessions: null,
        min_duration: 0,
        max_duration: null,
        description: '',
        color: ''
    }
}

function removeLevel(index: number): void {
    levels.value.splice(index, 1)
}

function submitLevels(): void {
    emit('submit', levels.value)
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
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
            </div>
        </div>

        <!-- Draft form -->
        <div class="grid grid-cols-1 gap-3">
            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.name') }}</label>
                <InputText
                    v-model="draft.name"
                    class="w-full"
                    :pt="{ root: { style: background_style } }"
                />
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.displayOrder')
                    }}</label>
                    <InputNumber v-model="draft.display_order" class="w-full" :pt="{ root: { style: background_style } }" />
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
                            :pt="{ root: { style: background_style } }"
                        />
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.minSessions')
                    }}</label>
                    <InputNumber v-model="draft.min_sessions" class="w-full" :pt="{ root: { style: background_style } }" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.maxSessions')
                    }}</label>
                    <InputNumber v-model="draft.max_sessions" class="w-full" :pt="{ root: { style: background_style } }" />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.minDuration')
                    }}</label>
                    <InputNumber v-model="draft.min_duration" class="w-full" :pt="{ root: { style: background_style } }" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-500">{{
                        t('userInterface.serverActivitiesView.addActivityModal.maxDuration')
                    }}</label>
                    <InputNumber v-model="draft.max_duration" class="w-full" :pt="{ root: { style: background_style } }" />
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-500">{{ t('common.description') }}</label>
                <Textarea
                    v-model="draft.description"
                    rows="2"
                    auto-resize
                    :pt="{ root: { style: background_style } }"
                />
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
                    :style="background_style"
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

        <div class="flex justify-between gap-2 pt-2 mt-auto">
            <div class="flex gap-2">
                <Button :label="t('common.back')" text @click="emit('back')" />
            </div>
            <div class="flex gap-2">
                <Button :label="t('common.skip')" severity="secondary" text @click="emit('skip')" />
                <Button
                    :label="t('actions.create')"
                    :loading="props.submitting"
                    :style="{ background: 'var(--gradient-primary)' }"
                    @click="submitLevels"
                />
            </div>
        </div>
    </div>
</template>
