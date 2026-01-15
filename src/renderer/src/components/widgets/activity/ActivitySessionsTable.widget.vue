<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { usePaginatedFetcher } from '@/composables/usePaginatedFetcher'
import ActivitySessionsTable from '@/components/activities/profile/ActivitySessionsTable.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IActivitySessionListItem } from '@shared/contracts/interfaces/entities/activity.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-sessions-table',
        title_key: 'widgets.activity.sessions_table.title',
        icon: 'pi pi-list',
        description_key: 'widgets.activity.sessions_table.description',
        category: {
            key: EWidgetCategory.Activity,
            label_key: 'widgets.categories.activity'
        },
        defaultSize: { w: 4, h: 6, minW: 4, minH: 6 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IActivityWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { listActivitySessions } = useActivityCRUD()

const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)

const {
    items: sessions,
    loading,
    hasMore,
    load,
    loadMore
} = usePaginatedFetcher<IActivitySessionListItem>({
    fetcher: async ({ page, limit }) => {
        if (!server_store.getPublicId || !activityId.value) {
            return { data: [], total: 0 }
        }

        const res = await listActivitySessions(server_store.getPublicId, activityId.value, {
            page,
            limit
        })

        if (res.error || !res.data) {
            return { data: [], total: 0, error: res.error }
        }

        return {
            data: res.data.data as unknown as IActivitySessionListItem[],
            total: res.data.total
        }
    },
    limit: 25,
    filters: [() => server_store.getPublicId, activityId]
})

onMounted(() => {
    void load()
})

watch(
    () => [server_store.getPublicId, activityId.value],
    () => {
        void load()
    }
)
</script>

<template>
    <BaseWidgetContainer :loading="loading && sessions.length === 0">
        <ActivityIdentityCorner :show="props.showIdentity" :activity-id="activityId" />

        <template #header>
            <div class="px-5 pt-5 pb-3">
                <p class="text-sm font-semibold text-surface-600">
                    {{ t('views.server_activities.recent_sessions') }}
                </p>
            </div>
        </template>

        <div class="max-h-[500px] overflow-y-auto">
            <ActivitySessionsTable
                :sessions="sessions"
                :loading="loading"
                :has-more="hasMore"
                @load-more="loadMore"
            />
        </div>
    </BaseWidgetContainer>
</template>
