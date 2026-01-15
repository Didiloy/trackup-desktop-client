<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useServerStore } from '@/stores/server'
import { useEnumDefinitionCRUD } from '@/composables/enum-definitions/useEnumDefinitionCRUD'
import { useEnumDefinitionNavigation } from '@/composables/enum-definitions/useEnumDefinitionNavigation'

const server_store = useServerStore()
const { listEnumDefinitions } = useEnumDefinitionCRUD()

const props = withDefaults(
    defineProps<{
        show?: boolean
        class?: string
        definitionId?: string
    }>(),
    {
        show: true,
        class: 'top-4 right-4',
        definitionId: undefined
    }
)

const localDefinitionName = ref<string | null>(null)

// Computed property that reactively checks store first, then falls back to API-fetched name
const definitionName = computed(() => {
    if (!props.definitionId || !props.show) return null

    // Try store first (this will be reactive to store changes)
    const definitionsInStore = server_store.getEnumsDefinition || []
    const found = definitionsInStore.find((d) => d.public_id === props.definitionId)
    if (found) {
        return found.name
    }

    // Fallback to fetched name from API
    return localDefinitionName.value
})

async function fetchDefinitionName(): Promise<void> {
    if (!props.definitionId || !props.show) return

    // Only fetch from API if not in store
    const definitionsInStore = server_store.getEnumsDefinition || []
    const definitionInStore = definitionsInStore.find((d) => d.public_id === props.definitionId)
    if (definitionInStore) {
        // Already in store, no need to fetch
        return
    }

    // If not in store, fetch list from API (fallback)
    const serverId = server_store.getPublicId
    if (!serverId) return

    try {
        const res = await listEnumDefinitions(serverId)
        if (res.data) {
            const found = res.data.find((d) => d.public_id === props.definitionId)
            if (found) {
                localDefinitionName.value = found.name
            }
        }
    } catch (e) {
        console.error(e)
    }
}

// Trigger API fetch on mount if needed
watch(
    () => [props.definitionId, server_store.getPublicId, props.show],
    () => {
        void fetchDefinitionName()
    },
    { immediate: true }
)

const isVisible = computed(() => props.show)

const { navigateToEnumDefinitionProfile } = useEnumDefinitionNavigation()
</script>

<template>
    <div
        v-if="isVisible && definitionName"
        v-tooltip.top="definitionName"
        class="absolute z-10"
        :class="props.class"
    >
        <div
            class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-100/80 backdrop-blur-sm border border-surface-200/50 text-[10px] font-medium text-surface-500 hover:text-primary-500 hover:border-primary-200 transition-colors cursor-pointer"
        >
            <i class="pi pi-list text-[9px]"></i>
            <span
                class="max-w-[80px] truncate uppercase tracking-wider"
                @click="navigateToEnumDefinitionProfile(props.definitionId!)"
            >
                {{ definitionName }}
            </span>
        </div>
    </div>
</template>
