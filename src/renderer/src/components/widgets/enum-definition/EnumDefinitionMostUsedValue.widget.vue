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
import type { IEnumDefinitionStats } from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'enum-definition-most-used-value',
        title_key: 'widgets.enum_definition.most_used_value.title',
        icon: 'pi pi-star',
        description_key: 'widgets.enum_definition.most_used_value.description',
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
const local_stats = ref<IEnumDefinitionStats | null>(null)
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
    if (!local_stats.value?.most_used_value) return t('common.fields.none')
    return (
        local_stats.value.most_used_value.selected_value ||
        local_stats.value.most_used_value.selected_key ||
        'N/A'
    )
})

const usageCountLabel = computed(() => {
    const count = local_stats.value?.most_used_value?.usage_count
    if (!count || count === 0) return ''
    return t('widgets.enum_definition.most_used_value.usage_count', { count })
})
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_definitions.profile.overview.most_used_value')"
        :value="value"
        :sub-value="usageCountLabel"
        icon="pi pi-star"
        color="text-amber-600"
        bg="bg-amber-100"
        :loading="isLoadingLocal"
    >
        <template #corner>
            <EnumDefinitionIdentityCorner :show="props.showIdentity" :definition-id="definitionId" />
        </template>
    </BaseOverviewStatWidget>
</template>
