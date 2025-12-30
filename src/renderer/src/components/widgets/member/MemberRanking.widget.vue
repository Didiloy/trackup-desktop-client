<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStore } from '@/stores/server'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IMemberRanking } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-ranking',
        title_key: 'common.widgets.member.ranking.title',
        icon: 'pi pi-trophy',
        description_key: 'common.widgets.member.ranking.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'common.widgets.categories.member'
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
const { getMemberStatsRanking } = useMemberStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const ranking = ref<IMemberRanking | null>(null)
const isLoading = ref(false)

async function fetchRanking(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberStatsRanking(serverId, memberId.value)
        if (res.data) {
            ranking.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchRanking()
})

watch(
    () => [server_store.getPublicId, memberId.value],
    () => {
        void fetchRanking()
    }
)

const rankingData = computed(() => {
    if (!ranking.value) return []
    return [
        {
            label: t('views.member.ranking.overall'),
            rank: ranking.value.rank_in_server,
            total: ranking.value.total_members,
            percentile: ranking.value.percentile,
            icon: 'pi pi-trophy'
        }
    ]
})

const statsData = computed(() => {
    if (!ranking.value) return []
    return [
        {
            label: t('views.member.ranking.total_duration'),
            value: formatMinutesToLabel(ranking.value.total_duration),
            icon: 'pi pi-clock'
        },
        {
            label: t('views.member.ranking.total_sessions'),
            value: ranking.value.total_sessions.toString(),
            icon: 'pi pi-list'
        }
    ]
})
</script>

<template>
    <BaseWidgetContainer :title="t('views.member.ranking.title')" :loading="isLoading">
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        <div class="space-y-4">
            <!-- Overall Ranking -->
            <div
                v-for="item in rankingData"
                :key="item.label"
                class="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100"
            >
                <div class="flex items-center gap-3">
                    <i :class="[item.icon, 'text-primary-600 text-2xl']"></i>
                    <div>
                        <div class="text-sm font-medium text-gray-700">{{ item.label }}</div>
                        <div class="text-xs text-gray-500">
                            {{
                                t('views.member.ranking.percentile', {
                                    percentile: item.percentile.toFixed(1)
                                })
                            }}
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold text-primary-600">#{{ item.rank }}</div>
                    <div class="text-xs text-gray-500">/ {{ item.total }}</div>
                </div>
            </div>

            <!-- Stats -->
            <div class="space-y-2">
                <div
                    v-for="stat in statsData"
                    :key="stat.label"
                    class="flex items-center justify-between p-3 rounded-xl bg-surface-100"
                >
                    <div class="flex items-center gap-2">
                        <i :class="[stat.icon, 'text-gray-500']"></i>
                        <span class="text-sm">{{ stat.label }}</span>
                    </div>
                    <span class="font-semibold">{{ stat.value }}</span>
                </div>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
