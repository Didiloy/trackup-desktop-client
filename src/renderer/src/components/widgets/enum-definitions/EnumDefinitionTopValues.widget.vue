<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useEnumDefinitionStatsCRUD } from '@/composables/enum-definitions/useEnumDefinitionStatsCRUD'
import EnumDefinitionIdentityCorner from '@/components/enum-definitions/profile/EnumDefinitionIdentityCorner.vue'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import type {
    IWidgetMetadata,
    IEnumDefinitionWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IEnumValueDistribution } from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'enum-definitions-top-values',
        title_key: 'widgets.enum_definition.top_values.title',
        icon: 'pi pi-list',
        description_key: 'widgets.enum_definition.top_values.description',
        category: {
            key: EWidgetCategory.EnumDefinition,
            label_key: 'widgets.categories.enum_definition'
        },
        defaultSize: { w: 4, h: 4, minW: 4, minH: 4 },
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
const { getEnumValueStatsDistribution } = useEnumDefinitionStatsCRUD()

const definitionId = computed(
    () => (route.params.enumDefinitionId as string) || props.config?.enumDefinitionId
)
const distribution = ref<IEnumValueDistribution[]>([])
const isLoadingLocal = ref(false)

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!definitionId.value || !serverId) return

    isLoadingLocal.value = true
    try {
        const res = await getEnumValueStatsDistribution(serverId, definitionId.value)
        if (res.data && Array.isArray(res.data)) {
            distribution.value = res.data
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

const loading = computed(() => isLoadingLocal.value)

const badgeColors = [
    'bg-blue-100 text-blue-700 ring-blue-500/20',
    'bg-green-100 text-green-700 ring-green-500/20',
    'bg-purple-100 text-purple-700 ring-purple-500/20',
    'bg-orange-100 text-orange-700 ring-orange-500/20',
    'bg-pink-100 text-pink-700 ring-pink-500/20',
    'bg-cyan-100 text-cyan-700 ring-cyan-500/20',
    'bg-amber-100 text-amber-700 ring-amber-500/20',
    'bg-rose-100 text-rose-700 ring-rose-500/20'
]

const sortedValues = computed(() => {
    if (!distribution.value || !Array.isArray(distribution.value)) {
        return []
    }
    return [...distribution.value].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
})

const maxUsage = computed(() => {
    if (!sortedValues.value.length) return 1
    return sortedValues.value[0]?.usage_count || 1
})
</script>

<template>
    <BaseWidgetContainer :loading="loading">
        <template #header>
            <div class="pt-2 pb-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">

                        <div>
                            <h3 class="text-lg font-bold text-surface-900">
                                {{ t('views.server_enum_definitions.profile.top_values.title') }}
                            </h3>
                        </div>
                        <EnumDefinitionIdentityCorner
                            :show="props.showIdentity"
                            class="static ml-5"
                            :definition-id="definitionId"
                        />
                    </div>
                </div>
            </div>
        </template>

        <!-- Empty State -->
        <div
            v-if="!sortedValues.length"
            class="flex flex-col items-center justify-center h-48 text-surface-400"
        >
            <i class="pi pi-list text-4xl mb-3"></i>
            <p class="text-sm">{{ t('common.fields.no_data') }}</p>
        </div>

        <!-- Values List -->
        <div v-else class="space-y-3 max-h-72 overflow-y-auto">
            <div
                v-for="(item, index) in sortedValues"
                :key="item.enum_value_id || index"
                class="group relative"
            >
                <!-- Progress bar background -->
                <div
                    class="absolute inset-0 rounded-xl opacity-20 transition-all group-hover:opacity-30"
                    :class="badgeColors[index % badgeColors.length].split(' ')[0]"
                    :style="{ width: `${((item.usage_count || 0) / maxUsage) * 100}%` }"
                ></div>

                <!-- Content -->
                <div
                    class="relative flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50/50 transition-colors"
                >
                    <!-- Rank badge -->
                    <span
                        class="shrink-0 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ring-1 ring-inset"
                        :class="badgeColors[index % badgeColors.length]"
                    >
                        {{ index + 1 }}
                    </span>

                    <!-- Value name -->
                    <span class="flex-1 font-medium text-surface-900 truncate">
                        {{ item.selected_value || 'N/A' }}
                    </span>

                    <!-- Stats -->
                    <div class="flex items-center gap-3 text-sm text-surface-500">
                        <span class="font-semibold text-surface-800">
                            {{ item.usage_count || 0 }}
                            <span class="font-normal">{{
                                t('views.server_enum_definitions.profile.top_values.usage_count')
                            }}</span>
                        </span>
                        <span class="px-2 py-0.5 rounded-full bg-surface-100 text-xs">
                            {{ (item.percentage || 0).toFixed(1) }}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
