<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEnumDefinitionStatsStore } from '@/stores/enum-definition-stats'

const { t } = useI18n()
const store = useEnumDefinitionStatsStore()

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
    if (!store.valueDistribution || !Array.isArray(store.valueDistribution)) {
        return []
    }
    return [...store.valueDistribution].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
})

const maxUsage = computed(() => {
    if (!sortedValues.value.length) return 1
    return sortedValues.value[0]?.usage_count || 1
})
</script>

<template>
    <div class="bg-surface-0 rounded-3xl p-6 shadow-sm ring-1 ring-surface-200/60 h-full">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                <i class="pi pi-list text-lg"></i>
            </div>
            <div>
                <h3 class="font-semibold text-surface-900">
                    {{ t('views.server_definitions.profile.top_values.title') }}
                </h3>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="store.isLoading" class="space-y-3">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3">
                <Skeleton width="30px" height="24px" class="rounded-lg" />
                <Skeleton width="100%" height="36px" class="rounded-lg" />
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="!sortedValues.length"
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
                <div class="relative flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50/50 transition-colors">
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
                                t('views.server_definitions.profile.top_values.usage_count')
                            }}</span>
                        </span>
                        <span class="px-2 py-0.5 rounded-full bg-surface-100 text-xs">
                            {{ (item.percentage || 0).toFixed(1) }}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
