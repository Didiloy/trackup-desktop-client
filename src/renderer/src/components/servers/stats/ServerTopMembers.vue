<script setup lang="ts">
import type { ITopMember } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import AvatarButton from '@/components/common/buttons/AvatarButton.vue'

defineProps<{
    members: ITopMember[] | undefined
    loading?: boolean
}>()
const { t } = useI18n()
</script>

<template>
    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm h-full">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-surface-900">
                {{ t('views.server_stats.top_members', 'Most Active Members') }}
            </h3>
        </div>

        <div v-if="loading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4">
                <Skeleton shape="circle" size="2.5rem" />
                <div class="flex-1">
                    <Skeleton width="60%" class="mb-2" />
                    <Skeleton width="40%" height="0.8rem" />
                </div>
            </div>
        </div>

        <div v-else-if="!members?.length" class="text-center py-8 text-surface-400">
            {{ t('common.fields.none') }}
        </div>

        <div v-else class="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            <div
                v-for="(member, index) in members"
                :key="member.member_id"
                class="flex items-center gap-4 p-2 rounded-xl hover:bg-surface-50 transition-colors"
            >
                <div class="relative shrink-0 font-bold text-surface-400 w-6 text-center">
                    <i v-if="index === 0" class="pi pi-crown text-amber-500 text-lg"></i>
                    <span v-else>#{{ index + 1 }}</span>
                </div>

                <AvatarButton :src="undefined" :name="member.member_name" size="normal" />
                <!-- Using undefined for src as ITopMember doesn't seem to have avatar_url yet, fallback to initials -->

                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-surface-900 truncate">
                        {{ member.member_name }}
                    </p>
                    <p class="text-xs text-surface-500 truncate">
                        {{ member.total_sessions }}
                        {{ t('views.activity.performance_section.sessions', 'sessions') }}
                    </p>
                </div>

                <div class="text-right shrink-0">
                    <span
                        class="text-sm font-medium text-primary-600 bg-primary-200 px-2 py-1 rounded-md select-none"
                    >
                        {{ formatMinutesToLabel(member.total_duration) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
