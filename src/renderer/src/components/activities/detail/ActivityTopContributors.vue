<script setup lang="ts">
import type { ITopContributor } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { useI18n } from 'vue-i18n'
import { convertMinuteToHoursMinute } from '@/utils'

const props = defineProps<{
    contributors: ITopContributor[] | undefined
}>()

const { t } = useI18n()
</script>

<template>
    <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-surface-600">
                {{ t('userInterface.serverActivitiesView.card.top_contributor') }}
            </p>
            <span class="text-xs text-surface-400">{{ props.contributors?.length || 0 }} </span>
        </div>

        <div class="space-y-3">
            <div
                v-for="member in props.contributors"
                :key="member.member_id"
                class="flex items-center gap-3 p-3 rounded-2xl bg-surface-100 ring-1 ring-surface-200/60"
            >
                <span class="text-lg font-semibold text-primary-500">#{{ member.rank }}</span>
                <div class="flex-1">
                    <p class="text-sm font-medium text-surface-900">
                        {{ member.user_email || '—' }}
                    </p>
                    <p class="text-xs text-surface-500">
                        {{ member.sessions_count }} {{ t('userInterface.serverActivitiesView.ActivityPerformanceSection.sessions') }} ·
                        {{ convertMinuteToHoursMinute(member.total_duration) }}
                    </p>
                </div>
                <span class="text-xl">
                    <i
                        :class="
                            member.rank === 1
                                ? 'pi pi-medal text-amber-500'
                                : 'pi pi-star text-surface-400'
                        "
                    ></i>
                </span>
            </div>
        </div>
        <div v-if="!props.contributors?.length" class="text-sm text-surface-400 text-center py-4">
            {{ t('common.none') }}
        </div>
    </div>
</template>
