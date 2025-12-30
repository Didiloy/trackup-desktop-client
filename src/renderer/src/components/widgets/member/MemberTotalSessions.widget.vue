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
import type { IMemberStats } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-total-sessions',
        title_key: 'common.widgets.member.total_sessions.title',
        icon: 'pi pi-list',
        description_key: 'common.widgets.member.total_sessions.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'common.widgets.categories.member'
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

const value = computed(() => (statsData.value ? statsData.value.total_sessions.toString() : '0'))
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.member.card.total_sessions')"
        :value="value"
        icon="pi pi-list"
        color="text-blue-500"
        bg="bg-blue-50"
        :loading="isLoading"
    >
        <template #corner>
            <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        </template>
    </BaseOverviewStatWidget>
</template>
```
