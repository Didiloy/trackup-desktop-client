<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, watch, onUnmounted } from 'vue'
import { useEnumDefinitionStatsStore } from '@/stores/enum-definition-stats'
import { useServerStore } from '@/stores/server'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import EnumDefinitionProfileHeader from '@/components/definitions/profile/EnumDefinitionProfileHeader.vue'
import EnumDefinitionOverviewWidget from '@/components/widgets/enum-definition/EnumDefinitionOverview.widget.vue'
import EnumDefinitionDistributionWidget from '@/components/widgets/enum-definition/EnumDefinitionDistribution.widget.vue'
import EnumDefinitionTopValuesWidget from '@/components/widgets/enum-definition/EnumDefinitionTopValues.widget.vue'
import EnumDefinitionChoicesWidget from '@/components/widgets/enum-definition/EnumDefinitionChoices.widget.vue'

const route = useRoute()
const definitionId = computed(() => route.params.definitionId as string)

const enum_def_stats_store = useEnumDefinitionStatsStore()
const server_store = useServerStore()

async function loadData(): Promise<void> {
    if (!server_store.getPublicId || !definitionId.value) return
    await enum_def_stats_store.loadDefinition(server_store.getPublicId, definitionId.value)

    console.log(enum_def_stats_store.currentDefinition)
    console.log(enum_def_stats_store.currentDefinitionStats)
}

watch(
    () => [server_store.getPublicId, definitionId.value],
    () => {
        if (server_store.getPublicId && definitionId.value) {
            void loadData()
        }
    },
    { immediate: true }
)

onMounted(async () => {
    if (server_store.getPublicId && definitionId.value) {
        await loadData()
    }
})

onUnmounted(() => {
    enum_def_stats_store.reset()
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div
            v-if="enum_def_stats_store.error"
            class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
        >
            {{ enum_def_stats_store.error }}
        </div>

        <!-- Header with skeleton -->
        <EnumDefinitionProfileHeader
            v-if="enum_def_stats_store.currentDefinition || enum_def_stats_store.isLoading"
            :definition="enum_def_stats_store.currentDefinition"
            :stats="enum_def_stats_store.currentDefinitionStats"
            :loading="enum_def_stats_store.isLoading"
            class="mb-6"
        />

        <!-- Stats Content -->
        <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
            <div key="stats-content" class="space-y-6">
                <!-- Overview Widgets - 4 cards responsive -->
                <EnumDefinitionOverviewWidget />

                <!-- Main Grid: Distribution + Top Values on large screens, stacked on mobile -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <EnumDefinitionDistributionWidget />
                    <EnumDefinitionTopValuesWidget />
                </div>

                <!-- Choices Widget - full width -->
                <EnumDefinitionChoicesWidget />
            </div>
        </TransitionWrapper>
    </div>
</template>
