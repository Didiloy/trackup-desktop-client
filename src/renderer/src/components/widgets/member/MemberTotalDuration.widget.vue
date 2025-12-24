<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStore } from '@/stores/server'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IMemberStats } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-total-duration',
        title: 'Durée Totale',
        icon: 'pi pi-clock',
        description: 'Affiche la durée totale du membre',
        category: {
            key: EWidgetCategory.Member,
            label: 'Member'
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
const { getMemberStats } = useMemberStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const local_stats = ref<IMemberStats | null>(null)
const isLoadingLocal = ref(false)

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoadingLocal.value = true
    try {
        const res = await getMemberStats(serverId, memberId.value)
        if (res.data) {
            local_stats.value = res.data
        }
    } finally {
        isLoadingLocal.value = false
    }
}

onMounted(() => {
    void fetchStats()
})

watch(
    () => [server_store.getPublicId, memberId.value],
    () => {
        void fetchStats()
    }
)

const statsData = computed(() => local_stats.value)
const isLoading = computed(() => isLoadingLocal.value)

const value = computed(() =>
    statsData.value ? formatMinutesToLabel(statsData.value.total_duration) : ''
)
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.member.card.total_duration')"
        :value="value"
        icon="pi pi-clock"
        color="text-primary-500"
        bg="bg-primary-50"
        :loading="isLoading"
    >
        <template #corner>
            <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        </template>
    </BaseOverviewStatWidget>
</template>
