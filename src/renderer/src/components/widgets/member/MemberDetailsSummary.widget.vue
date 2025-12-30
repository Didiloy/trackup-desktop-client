<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IMemberStatsDetails } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'
import { formatMinutesToLabel } from '@/utils/time.utils'

defineOptions({
    widgetMetadata: {
        id: 'member-details-summary',
        title_key: 'widgets.member.details_summary.title',
        icon: 'pi pi-info-circle',
        description_key: 'widgets.member.details_summary.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'widgets.categories.member'
        },
        defaultSize: { w: 4, h: 6, minW: 3, minH: 5 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IMemberWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getMemberStatsDetails } = useMemberStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const details = ref<IMemberStatsDetails | null>(null)
const isLoading = ref(false)

async function fetchDetails(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberStatsDetails(serverId, memberId.value)
        if (res.data) {
            details.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchDetails()
})

watch(
    () => [server_store.getPublicId, memberId.value],
    () => {
        void fetchDetails()
    }
)

const statsList = computed(() => {
    if (!details.value) return []
    return [
        {
            label: t('views.server_members.details.total_sessions'),
            value: details.value.total_sessions,
            icon: 'pi pi-list'
        },
        {
            label: t('views.server_members.details.total_duration'),
            value: formatMinutesToLabel(details.value.total_duration),
            icon: 'pi pi-clock'
        },
        {
            label: t('views.server_members.details.avg_duration'),
            value: formatMinutesToLabel(details.value.avg_session_duration),
            icon: 'pi pi-stopwatch'
        },
        {
            label: t('views.server_members.details.likes_received'),
            value: details.value.likes_received,
            icon: 'pi pi-heart'
        }
    ]
})

const favoriteActivity = computed(() => details.value?.favorite_activity)
</script>

<template>
    <BaseWidgetContainer :title="t('widgets.member.details_summary.title')" :loading="isLoading">
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        
        <div v-if="details" class="space-y-6">
            <!-- Main Stats Grid -->
            <div class="grid grid-cols-2 gap-3">
                <div
                    v-for="stat in statsList"
                    :key="stat.label"
                    class="p-3 rounded-2xl bg-surface-50 border border-surface-100 flex flex-col items-center text-center"
                >
                    <i :class="[stat.icon, 'text-primary-500 mb-2']"></i>
                    <div class="text-[10px] text-surface-500 uppercase font-bold tracking-wider mb-1">
                        {{ stat.label }}
                    </div>
                    <div class="font-bold text-surface-900 text-sm">
                        {{ stat.value }}
                    </div>
                </div>
            </div>

            <!-- Favorite Activity -->
            <div v-if="favoriteActivity" class="p-4 rounded-2xl bg-primary-50 border border-primary-100">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm">
                        <i class="pi pi-star-fill"></i>
                    </div>
                    <div>
                        <div class="text-[10px] text-primary-600 uppercase font-bold tracking-wider mb-0.5">
                            {{ t('views.server_members.details.favorite_activity') }}
                        </div>
                        <div class="font-bold text-surface-900">
                            {{ favoriteActivity.name }}
                        </div>
                        <div class="text-xs text-surface-500">
                            {{ t('views.server_members.details.activity_sessions', { count: favoriteActivity.sessions_count }) }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pattern Highlights -->
            <div v-if="details.patterns" class="space-y-3">
                <h4 class="text-xs font-bold text-surface-500 uppercase tracking-widest px-1">
                    {{ t('views.server_members.details.patterns_title') }}
                </h4>
                <div class="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-100">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-bolt text-amber-500"></i>
                        <span class="text-sm">{{ t('views.server_members.details.current_streak') }}</span>
                    </div>
                    <span class="font-bold">{{ details.patterns.streak_current }} {{ t('common.time.days') }}</span>
                </div>
            </div>
        </div>

        <div v-else-if="!isLoading" class="flex flex-col items-center justify-center h-full text-surface-400">
            <i class="pi pi-search text-3xl mb-2"></i>
            <p>{{ t('common.fields.no_data') }}</p>
        </div>
    </BaseWidgetContainer>
</template>
