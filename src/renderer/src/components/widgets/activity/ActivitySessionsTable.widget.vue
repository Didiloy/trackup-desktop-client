<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
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
        title: 'Sessions',
        icon: 'pi pi-list',
        description: "Affiche la liste des sessions récentes de l'activité",
        category: {
            key: EWidgetCategory.Activity,
            label: 'Activity'
        },
        defaultSize: { w: 12, h: 8, minW: 6, minH: 6 },
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
const sessions = ref<IActivitySessionListItem[]>([])
const sessions_total = ref(0)
const sessions_page = ref(1)
const sessions_rows = ref(10)
const sessions_loading = ref(false)

async function loadSessions(page = sessions_page.value, rows = sessions_rows.value): Promise<void> {
    if (!server_store.getPublicId || !activityId.value) return

    sessions_loading.value = true
    try {
        const res = await listActivitySessions(server_store.getPublicId, activityId.value, {
            page,
            limit: rows
        })
        if (res.error || !res.data) {
            return
        }
        sessions.value = res.data.data as unknown as IActivitySessionListItem[]
        sessions_total.value = res.data.total
        sessions_page.value = res.data.page
        sessions_rows.value = res.data.limit
    } finally {
        sessions_loading.value = false
    }
}

function handleSessionPage(event: { page: number; rows: number }): void {
    void loadSessions(event.page, event.rows)
}

onMounted(() => {
    void loadSessions()
})

watch(
    () => [server_store.getPublicId, activityId.value],
    () => {
        void loadSessions()
    }
)
</script>

<template>
    <BaseWidgetContainer :loading="sessions_loading">
        <ActivityIdentityCorner :show="props.showIdentity" :activity-id="activityId" />

        <template #header>
            <div class="px-5 pt-5 pb-3">
                <p class="text-sm font-semibold text-surface-600">
                    {{ t('views.activity.recent_sessions') }}
                </p>
            </div>
        </template>

        <div class="h-full px-5 pb-5">
            <ActivitySessionsTable
                :sessions="sessions"
                :loading="sessions_loading"
                :total="sessions_total"
                :page="sessions_page"
                :rows="sessions_rows"
                @page="handleSessionPage"
            />
        </div>
    </BaseWidgetContainer>
</template>
