<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import MemberTotalDurationWidget from '@/components/widgets/member/MemberTotalDuration.widget.vue'
import MemberTotalSessionsWidget from '@/components/widgets/member/MemberTotalSessions.widget.vue'
import MemberRankingWidget from '@/components/widgets/member/MemberRanking.widget.vue'
import MemberTimelineChartWidget from '@/components/widgets/member/MemberTimelineChart.widget.vue'
import MemberActivityPatternsWidget from '@/components/widgets/member/MemberActivityPatterns.widget.vue'
import MemberActivitiesTableWidget from '@/components/widgets/member/MemberActivitiesTable.widget.vue'
import MemberAllSessionsWidget from '@/components/widgets/member/MemberAllSessions.widget.vue'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import { useServerStore } from '@/stores/server'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import type { IMemberStatsDetails } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

const route = useRoute()
const toast = useToast()
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

const displayName = computed(() => {
    if (!member.value) return ''
    return member.value.nickname
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {{ error }}
        </div>

        <!-- Member Header -->
        <div class="mb-6 p-6 rounded-3xl bg-surface-0 shadow-sm">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <i class="pi pi-user text-3xl text-primary-500"></i>
                </div>
                <div class="flex-1">
                    <h1 class="text-2xl font-bold">{{ displayName }}</h1>
                    <div v-if="member" class="text-sm text-gray-500">
                        {{ t('views.member.joined') }}
                        {{ new Date(member.created_at).toLocaleDateString() }}
                    </div>
                </div>
            </div>
        </div>

        <Tabs v-model:value="activeTab" class="mt-4">
            <TabList class="mb-4 flex items-center justify-between w-full pr-4">
                <div class="flex items-center">
                    <Tab value="stats">
                        <div class="flex items-center gap-2 px-2">
                            <i class="pi pi-chart-bar"></i>
                            <span>{{ t('views.member.tabs.stats') }}</span>
                        </div>
                    </Tab>
                    <Tab value="activities">
                        <div class="flex items-center gap-2 px-2">
                            <i class="pi pi-th-large"></i>
                            <span>{{ t('views.member.tabs.activities') }}</span>
                        </div>
                    </Tab>
                    <Tab value="sessions">
                        <div class="flex items-center gap-2 px-2">
                            <i class="pi pi-list"></i>
                            <span>{{ t('views.member.tabs.sessions') }}</span>
                        </div>
                    </Tab>
                </div>
            </TabList>

            <TabPanels class="bg-transparent! overflow-hidden">
                <TabPanel value="stats" class="p-0!">
                    <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
                        <div v-if="activeTab === 'stats'" key="stats-content">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <MemberTotalDurationWidget :show-identity="false" />
                                <MemberTotalSessionsWidget :show-identity="false" />
                                <div></div>
                            </div>

                            <MemberTimelineChartWidget :show-identity="false" class="mb-6" />

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                                <div class="space-y-5 min-w-0">
                                    <MemberRankingWidget :show-identity="false" />
                                </div>
                                <div class="space-y-5 min-w-0">
                                    <MemberActivityPatternsWidget :show-identity="false" />
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
