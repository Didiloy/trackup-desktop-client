<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useActivityNavigation } from '@/composables/activities/useActivityNavigation'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { getMetadataTypeTranslationKey } from '@/utils/metadata.utils'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

import MetadataTotalUsageWidget from '@/components/widgets/activity-metadata/MetadataTotalUsage.widget.vue'
import MetadataUniqueValuesWidget from '@/components/widgets/activity-metadata/MetadataUniqueValues.widget.vue'
import MetadataMostCommonValueWidget from '@/components/widgets/activity-metadata/MetadataMostCommonValue.widget.vue'
import MetadataNumericSummaryWidget from '@/components/widgets/activity-metadata/MetadataNumericSummary.widget.vue'
import MetadataDistributionWidget from '@/components/widgets/activity-metadata/MetadataDistribution.widget.vue'
import MetadataChoicesWidget from '@/components/widgets/activity-metadata/MetadataChoices.widget.vue'
import MetadataTypeBadge from '@/components/common/icons/MetadataTypeBadge.vue'

const route = useRoute()
const { navigateToActivityProfile } = useActivityNavigation()
const { t } = useI18n()
const server_store = useServerStore()
const { getMetadataDefinitionById } = useActivityMetadataDefinitionCRUD()
const { getActivityById } = useActivityCRUD()

const activityId = computed(() => route.params.activityId as string)
const definitionId = computed(() => route.params.metadataDefinitionId as string)

const definition = ref<IActivityMetadataDefinition | null>(null)
const activity = ref<IActivity | null>(null)
const loading = ref(true)

async function fetchDefinition(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId || !activityId.value || !definitionId.value) return

    loading.value = true
    try {
        const [defRes, actRes] = await Promise.all([
            getMetadataDefinitionById(serverId, activityId.value, definitionId.value),
            getActivityById(serverId, activityId.value)
        ])

        if (defRes.data) {
            definition.value = defRes.data
        }
        if (actRes.data) {
            activity.value = actRes.data
        }
    } catch (e) {
        console.error('Failed to fetch data:', e)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    void fetchDefinition()
})

watch(
    () => [server_store.getPublicId, activityId.value, definitionId.value],
    () => {
        void fetchDefinition()
    }
)

function handleBack(): void {
    const serverId = server_store.getPublicId
    if (serverId && activityId.value) {
        navigateToActivityProfile(activityId.value)
    }
}
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <!-- Header -->
        <div class="mb-6">
            <div
                v-if="activity"
                class="flex items-center gap-3 mb-4 cursor-pointer group"
                @click="handleBack"
            >
                <div
                    class="w-10 h-10 rounded-xl bg-surface-0 shadow-sm ring-1 ring-surface-200 flex items-center justify-center overflow-hidden"
                >
                    <img
                        v-if="activity.logo"
                        :src="activity.logo"
                        :alt="activity.name"
                        class="w-full h-full object-cover"
                    />
                    <span v-else class="text-lg font-bold text-surface-400">
                        {{ activity.name.charAt(0).toUpperCase() }}
                    </span>
                </div>
                <div>
                    <h2
                        class="text-sm font-medium text-surface-500 group-hover:text-primary-600 transition-colors"
                    >
                        {{ activity.name }}
                    </h2>
                    <div class="flex items-center gap-1 text-xs text-surface-400">
                        <i class="pi pi-arrow-left text-[10px]"></i>
                        <span>{{ t('common.actions.back') }}</span>
                    </div>
                </div>
            </div>

            <div
                v-if="definition"
                class="relative rounded-3xl p-6 overflow-hidden ring-1 ring-surface-200/40 bg-linear-to-br from-surface-100 via-surface-50 to-surface-0 shadow-xs"
            >
                <div class="relative z-10 flex flex-wrap items-center gap-6">
                    <!-- Icon -->
                    <div
                        class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-surface-0 text-primary-600 ring-1 ring-surface-200 shadow-sm"
                    >
                        <MetadataTypeBadge :type="definition.type" />
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-[220px]">
                        <div class="flex items-center gap-3 mb-1">
                            <h1 class="text-2xl font-bold text-surface-900">
                                {{ definition.label }}
                            </h1>
                            <Badge
                                v-if="definition.archived"
                                :value="t('common.fields.archived')"
                                severity="warn"
                                class="shadow-lg"
                            />
                            <span
                                class="px-2 py-0.5 rounded-full bg-surface-200 text-surface-600 text-xs font-semibold uppercase tracking-wide"
                            >
                                {{ t(getMetadataTypeTranslationKey(definition.type)) }}
                            </span>
                            <span
                                v-if="definition.required"
                                class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold uppercase tracking-wide"
                            >
                                {{ t('common.fields.required') }}
                            </span>
                        </div>
                        <p class="text-sm text-surface-500 max-w-2xl">
                            {{ definition.description || t('common.fields.no_description') }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Loading Skeleton -->
            <div v-else-if="loading" class="h-40 rounded-3xl bg-surface-100 animate-pulse"></div>
        </div>

        <!-- Stats Grid -->
        <div v-if="definition" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetadataChoicesWidget
                    v-if="definition.choices && definition.choices.length > 0"
                    :show-identity="false"
                    :metadata-definition-id="definitionId"
                />

                <MetadataTotalUsageWidget
                    :show-identity="false"
                    :metadata-definition-id="definitionId"
                />

                <MetadataNumericSummaryWidget
                    v-if="definition.type === 'NUMBER'"
                    :show-identity="false"
                    :metadata-definition-id="definitionId"
                />

                <MetadataUniqueValuesWidget
                    v-else
                    :show-identity="false"
                    :metadata-definition-id="definitionId"
                />

                <MetadataMostCommonValueWidget
                    v-if="definition.type !== 'NUMBER'"
                    :show-identity="false"
                    :metadata-definition-id="definitionId"
                />
            </div>

            <!-- Distribution Chart -->
            <MetadataDistributionWidget
                :show-identity="false"
                :metadata-definition-id="definitionId"
            />
        </div>
    </div>
</template>
