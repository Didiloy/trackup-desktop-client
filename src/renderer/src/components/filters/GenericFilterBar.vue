<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
    count?: number
    showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    count: 0,
    showCount: true
})

const { t } = useI18n()
</script>

<template>
    <div class="w-full flex flex-nowrap items-center gap-3 p-2 bg-surface-100 rounded-md">
        <!-- Primary Filters Slot -->
        <slot name="primary-filters" />

        <!-- Advanced Filters Slot -->
        <slot name="advanced-filters" />

        <!-- Actions Slot (e.g., toggles, quick filters) -->
        <slot name="actions" />

        <!-- Count Display -->
        <div v-if="showCount" class="ml-auto flex items-center text-xs text-surface-600">
            <i class="pi pi-list mr-2"></i>
            <span>{{ count }} {{ t('common.items') ?? 'items' }}</span>
        </div>

        <!-- Custom Count Slot (overrides default count) -->
        <slot name="count" :count="count" />
    </div>
</template>
