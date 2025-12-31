<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEnumDefinitionStatsStore } from '@/stores/enum-definition-stats'

const { t } = useI18n()
const store = useEnumDefinitionStatsStore()

const MAX_VALUES_PER_CHUNK = 5

const choices = computed(() => {
    if (!store.currentDefinition?.values?.length) return []
    const flattened: string[] = []
    store.currentDefinition.values.forEach((valueObj) => {
        for (let i = 1; i <= MAX_VALUES_PER_CHUNK; i++) {
            const key = `value${i}` as keyof typeof valueObj
            const val = valueObj[key]
            if (typeof val === 'string' && val.trim()) {
                flattened.push(val)
            }
        }
    })
    return flattened
})
</script>

<template>
    <div class="bg-surface-0 rounded-3xl p-6 shadow-sm ring-1 ring-surface-200/60 h-full">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-5">
            <div
                class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"
            >
                <i class="pi pi-check-square text-lg"></i>
            </div>
            <div>
                <h3 class="font-semibold text-surface-900">
                    {{ t('common.fields.choices') }}
                </h3>
                <p class="text-sm text-surface-500">
                    {{ choices.length }} {{ t('common.fields.items') }}
                </p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="store.isLoading" class="flex flex-wrap gap-2">
            <Skeleton v-for="i in 6" :key="i" width="80px" height="32px" class="rounded-lg" />
        </div>

        <!-- Empty State -->
        <div
            v-else-if="!choices.length"
            class="flex flex-col items-center justify-center py-8 text-surface-400"
        >
            <i class="pi pi-list text-3xl mb-2"></i>
            <p class="text-sm">{{ t('common.fields.no_data') }}</p>
        </div>

        <!-- Choices Grid -->
        <div v-else class="flex flex-wrap gap-2">
            <span
                v-for="(choice, idx) in choices"
                :key="idx"
                class="px-3 py-1.5 rounded-xl text-sm font-medium bg-surface-100 text-surface-700 ring-1 ring-inset ring-surface-200 transition-transform hover:scale-105 hover:bg-surface-200"
            >
                {{ choice }}
            </span>
        </div>
    </div>
</template>
