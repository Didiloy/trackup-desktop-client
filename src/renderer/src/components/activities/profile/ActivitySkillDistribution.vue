<script setup lang="ts">
import type { IActivitySkillLevel } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { translateSkillLevel } from '@/utils/skill-level.utils'
import { formatMinutesToLabel } from '@/utils/time.utils'

const props = defineProps<{
    skillLevels?: IActivitySkillLevel[]
}>()

const { t } = useI18n()

const sortedSkillLevels = computed(() => {
    if (!props.skillLevels?.length) return []
    return [...props.skillLevels].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
})
</script>

<template>
    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm h-full">
        <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-graduation-cap text-primary-500"></i>
            <p class="text-sm font-semibold text-surface-700">
                {{ t('views.activity.performance_section.skill_levels_title') }}
            </p>
        </div>

        <div v-if="sortedSkillLevels.length > 0" class="space-y-3">
            <div
                v-for="(lvl, index) in sortedSkillLevels"
                :key="lvl.public_id || lvl.name"
                class="flex items-center gap-3 p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors"
            >
                <!-- Order Badge -->
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    :style="{ backgroundColor: lvl.color || '#64748b', color: '#fff' }"
                >
                    {{ index + 1 }}
                </div>

                <!-- Level Name -->
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-surface-900 truncate">
                        {{ translateSkillLevel(lvl.name, t) }}
                    </div>
                    <div
                        v-if="
                            lvl.min_sessions ||
                            lvl.max_sessions ||
                            lvl.min_duration ||
                            lvl.max_duration
                        "
                        class="text-xs text-surface-500 mt-0.5"
                    >
                        <span v-if="lvl.min_sessions || lvl.max_sessions">
                            {{ lvl.min_sessions || 0 }} - {{ lvl.max_sessions || '∞' }} sessions
                        </span>
                        <span
                            v-if="
                                (lvl.min_sessions || lvl.max_sessions) &&
                                (lvl.min_duration || lvl.max_duration)
                            "
                            class="mx-1"
                            >•</span
                        >
                        <span v-if="lvl.min_duration || lvl.max_duration">
                            {{ formatMinutesToLabel(lvl.min_duration) }} -
                            {{ lvl.max_duration ? formatMinutesToLabel(lvl.max_duration) : '∞' }}
                        </span>
                    </div>
                </div>

                <!-- Color Indicator -->
                <div
                    class="w-3 h-3 rounded-full shrink-0"
                    :style="{ backgroundColor: lvl.color || '#64748b' }"
                    v-tooltip.top="lvl.color || 'Default'"
                ></div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-8 text-surface-400">
            <i class="pi pi-graduation-cap text-3xl mb-2 opacity-50"></i>
            <span class="text-sm">{{ t('common.fields.none') }}</span>
        </div>
    </div>
</template>
