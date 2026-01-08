<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import MemberTotalDurationWidget from '@/components/widgets/member/MemberTotalDuration.widget.vue'
import MemberTotalSessionsWidget from '@/components/widgets/member/MemberTotalSessions.widget.vue'
import MemberRankingWidget from '@/components/widgets/member/MemberRanking.widget.vue'
import MemberTimelineChartWidget from '@/components/widgets/member/MemberTimelineChart.widget.vue'
import MemberPatternsSummaryWidget from '@/components/widgets/member/MemberPatternsSummary.widget.vue'
import MemberActivitiesTableWidget from '@/components/widgets/member/MemberActivitiesTable.widget.vue'
import MemberAllSessionsWidget from '@/components/widgets/member/MemberAllSessions.widget.vue'
import MemberRankingOverviewWidget from '@/components/widgets/member/MemberRankingOverview.widget.vue'
import MemberGrowthTrendsWidget from '@/components/widgets/member/MemberGrowthTrends.widget.vue'
import MemberDetailsSummaryWidget from '@/components/widgets/member/MemberDetailsSummary.widget.vue'
import MemberFavoriteActivityWidget from '@/components/widgets/member/MemberFavoriteActivity.widget.vue'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import { useServerStore } from '@/stores/server'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import type { IMemberStatsDetails } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { useI18n } from 'vue-i18n'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

import MemberProfileHeader from '@/components/members/profile/MemberProfileHeader.vue'
import { ICONS } from '@/constants/icons'
import Icon from '@/components/common/icons/Icon.vue'
import ActivityIcon from '@/components/common/icons/ActivityIcon.vue'
import SessionIcon from '@/components/common/icons/SessionIcon.vue'

const route = useRoute()
const { t } = useI18n()
const memberId = computed(() => route.params.memberId as string)

const { getMemberById } = useMemberCRUD()
const { getMemberStatsDetails } = useMemberStatsCRUD()
const server_store = useServerStore()

const member = ref<IServerMember | null>(null)
const memberDetails = ref<IMemberStatsDetails | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<'stats' | 'activities' | 'sessions'>('stats')

async function loadMember(): Promise<void> {
    if (!server_store.getPublicId || !memberId.value) return
    loading.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        const [memberRes, detailsRes] = await Promise.all([
            getMemberById(serverId, memberId.value),
            getMemberStatsDetails(serverId, memberId.value)
        ])

        if (memberRes.error || !memberRes.data) {
            error.value = memberRes.error ?? t('messages.error.fetch')
            return
        }
        if (detailsRes.error || !detailsRes.data) {
            error.value = detailsRes.error ?? t('messages.error.fetch')
            return
        }

        member.value = memberRes.data
        memberDetails.value = detailsRes.data
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.fetch')
    } finally {
        loading.value = false
    }
}

watch(
    () => [server_store.getPublicId, memberId.value],
    () => {
        if (server_store.getPublicId && memberId.value) {
            void loadMember()
        }
    },
    { immediate: true }
)

onMounted(async () => {
    if (server_store.getPublicId && memberId.value) {
        await loadMember()
    }
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {{ error }}
        </div>

        <!-- Member Header -->
        <MemberProfileHeader v-if="member" :member="member" class="mb-6" />

        <Tabs v-model:value="activeTab" class="mt-4">
            <TabList class="mb-4 flex items-center justify-between w-full pr-4">
                <div class="flex items-center">
                    <Tab value="stats">
                        <div class="flex items-center gap-2 px-2">
                            <i class="pi pi-chart-bar"></i>
                            <span>{{ t('views.server_members.tabs.stats') }}</span>
                        </div>
                    </Tab>
                    <Tab value="activities">
                        <div class="flex items-center gap-2 px-2">
                            <ActivityIcon />
                            <span>{{ t('views.server_members.tabs.activities') }}</span>
                        </div>
                    </Tab>
                    <Tab value="sessions">
                        <div class="flex items-center gap-2 px-2">
                            <SessionIcon />
                            <span>{{ t('views.server_members.tabs.sessions') }}</span>
                        </div>
                    </Tab>
                </div>
            </TabList>

            <TabPanels class="bg-transparent! overflow-hidden">
                <TabPanel value="stats" class="p-0!">
                    <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
                        <div v-if="activeTab === 'stats'" key="stats-content">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <MemberRankingOverviewWidget :show-identity="false" />
                                <MemberTotalDurationWidget :show-identity="false" />
                                <MemberTotalSessionsWidget :show-identity="false" />
                                <MemberFavoriteActivityWidget :show-identity="false" />
                            </div>

                            <MemberTimelineChartWidget :show-identity="false" class="mb-6" />

                            <MemberGrowthTrendsWidget :show-identity="false" class="mb-6" />

                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                                <div class="space-y-5 min-w-0">
                                    <MemberRankingWidget :show-identity="false" />
                                </div>
                                <div class="space-y-5 min-w-0">
                                    <MemberDetailsSummaryWidget :show-identity="false" />
                                </div>
                                <div class="space-y-5 min-w-0">
                                    <MemberPatternsSummaryWidget :show-identity="false" />
                                </div>
                            </div>
                        </div>
                    </TransitionWrapper>
                </TabPanel>

                <TabPanel value="activities" class="p-0!">
                    <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
                        <div v-if="activeTab === 'activities'" key="activities-content">
                            <MemberActivitiesTableWidget :show-identity="false" class="mb-6" />
                        </div>
                    </TransitionWrapper>
                </TabPanel>

                <TabPanel value="sessions" class="p-0!">
                    <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
                        <div v-if="activeTab === 'sessions'" key="sessions-content">
                            <MemberAllSessionsWidget :show-identity="false" class="mb-6" />
                        </div>
                    </TransitionWrapper>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
