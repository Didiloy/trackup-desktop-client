<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import AvatarButton from '@/components/common/buttons/AvatarButton.vue'
import { useServerStore } from '@/stores/server'
import { useServerStatsStore } from '@/stores/server-stats'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-top-members',
        title: 'Top Membres',
        icon: 'pi pi-star',
        description: 'Affiche les membres les plus actifs du serveur',
        category: EWidgetCategory.Server,
        defaultSize: { w: 6, h: 4, minW: 4, minH: 3 }
    }
})

const server_store = useServerStore()
const server_stats_store = useServerStatsStore()
const { t } = useI18n()
</script>

<template>
    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm h-full">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-surface-900">
                {{ t('views.server_stats.top_members', 'Most Active Members') }}
            </h3>
        </div>

        <div v-if="server_stats_store.isLoading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4">
                <Skeleton shape="circle" size="2.5rem" />
                <div class="flex-1">
                    <Skeleton width="60%" class="mb-2" />
                    <Skeleton width="40%" height="0.8rem" />
                </div>
            </div>
        </div>

        <div
            v-else-if="!server_stats_store.getDetails?.top_members?.length"
            class="text-center py-8 text-surface-400"
        >
            {{ t('common.fields.none') }}
        </div>

        <div v-else class="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            <div
                v-for="(member, index) in server_stats_store.getDetails.top_members"
                :key="member.member_id"
                class="flex items-center gap-4 p-2 rounded-xl hover:bg-surface-50 transition-colors"
            >
                <div class="relative shrink-0 font-bold text-surface-400 w-6 text-center">
                    <i v-if="index === 0" class="pi pi-crown text-amber-500 text-lg"></i>
                    <span v-else>#{{ index + 1 }}</span>
                </div>

                <AvatarButton
                    :src="server_store.getMemberById(member.member_id)?.avatar_url"
                    :name="server_store.getMemberById(member.member_id)?.nickname"
                    size="normal"
                />
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-surface-900 truncate">
                        {{ server_store.getMemberById(member.member_id)?.nickname }}
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
                        {{ formatMinutesToLabel(member.total_duration ?? 0) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
