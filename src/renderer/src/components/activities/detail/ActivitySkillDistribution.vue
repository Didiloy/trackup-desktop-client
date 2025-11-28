<script setup lang="ts">
import type { IActivitySkillLevel } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    skillLevels?: IActivitySkillLevel[]
}>()

const { t } = useI18n()

const skillDistribution = computed(() => {
    if (!props.skillLevels?.length) return []
    const maxOrder = Math.max(...props.skillLevels.map((lvl) => lvl.display_order ?? 1))
    return props.skillLevels.map((lvl) => ({
        name: lvl.name,
        color: lvl.color || '#64748b',
        ratio: ((lvl.display_order ?? 1) / Math.max(maxOrder, 1)) * 100 //TODO CHANGER CECI PAR UN VRAI RATIO
    }))
})
</script>

<template>
    <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm h-full">
        <p class="text-sm font-semibold text-surface-600 mb-4">
            {{ t('userInterface.serverActivitiesView.ActivityPerformanceSection.skillLevels') }}
        </p>
        <div class="space-y-2">
            <div v-for="lvl in skillDistribution" :key="lvl.name" class="flex items-center gap-3">
                <span class="text-xs text-surface-500 w-20 truncate" v-tooltip.top="lvl.name">{{
                    lvl.name
                }}</span>
                <div class="flex-1 h-2 rounded-full bg-surface-200 overflow-hidden">
                    <div
                        v-tooltip.top="lvl.ratio + '%'"
                        class="h-full rounded-full transition-all duration-300"
                        :style="{ width: `${lvl.ratio}%`, background: lvl.color }"
                    ></div>
                </div>
            </div>
            <div v-if="!skillDistribution.length" class="text-xs text-surface-400">
                {{ t('common.none') }}
            </div>
        </div>
    </div>
</template>
