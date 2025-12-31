<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useEnumDefinitionStatsCRUD } from '@/composables/enums-definition/useEnumDefinitionStatsCRUD'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import EnumDefinitionIdentityCorner from '@/components/definitions/profile/EnumDefinitionIdentityCorner.vue'
import type {
    IWidgetMetadata,
    IEnumDefinitionWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IEnumDefinitionStatsDto } from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'enum-definition-unique-users',
        title_key: 'widgets.enum_definition.unique_users.title',
        icon: 'pi pi-users',
        description_key: 'widgets.enum_definition.unique_users.description',
        category: {
            key: EWidgetCategory.EnumDefinition,
            label_key: 'widgets.categories.enum_definition'
        },
        defaultSize: { w: 1, h: 2, minW: 1, minH: 2 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IEnumDefinitionWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getEnumDefinitionStats } = useEnumDefinitionStatsCRUD()

const definitionId = computed(
    () => (route.params.definitionId as string) || props.config?.enumDefinitionId
)
const local_stats = ref<IEnumDefinitionStatsDto[]>([])
const isLoadingLocal = ref(false)

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!definitionId.value || !serverId) return

    isLoadingLocal.value = true
    try {
        const res = await getEnumDefinitionStats(serverId, definitionId.value, {
            period: EPeriod.ALL_TIME
        })
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
    () => [server_store.getPublicId, definitionId.value],
    () => {
        void fetchStats()
    }
)

const value = computed(() => {
    // Note: This sums unique users OF EACH VALUE.
    // If a user selected multiple values, they are counted multiple times.
    // This is an approximation as we don't have the definition-aggregated unique users here.
    return local_stats.value.reduce((acc, curr) => acc + curr.unique_users, 0)
})
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_definitions.profile.overview.unique_users')"
        :value="value"
        icon="pi pi-users"
        color="text-orange-600"
        bg="bg-orange-100"
        :loading="isLoadingLocal"
    >
        <template #corner>
            <EnumDefinitionIdentityCorner :show="props.showIdentity" :definition-id="definitionId" />
        </template>
    </BaseOverviewStatWidget>
</template>
