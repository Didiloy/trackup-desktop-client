<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IMemberRanking } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-ranking-overview',
        title_key: 'widgets.member.ranking.title',
        icon: 'pi pi-trophy',
        description_key: 'widgets.member.ranking.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'widgets.categories.member'
        },
        defaultSize: { w: 2, h: 3, minW: 2, minH: 3 },
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

const value = computed(() => (ranking.value ? `#${ranking.value.rank_in_server}` : '-'))
const subtitle = computed(() => (ranking.value ? `/ ${ranking.value.total_members}` : ''))
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_members.ranking.title')"
        :value="value"
        :sub-value="subtitle"
        icon="pi pi-trophy"
        color="text-amber-500"
        bg="bg-amber-50"
        :loading="isLoading"
    >
        <template #corner>
            <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        </template>
    </BaseOverviewStatWidget>
</template>
