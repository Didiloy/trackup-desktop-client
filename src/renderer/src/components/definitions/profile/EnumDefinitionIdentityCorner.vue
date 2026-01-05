<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useServerStore } from '@/stores/server'
import { useEnumDefinitionCRUD } from '@/composables/enum-definitions/useEnumDefinitionCRUD'

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

async function fetchDefinitionName(): Promise<void> {
    if (!props.definitionId || !props.show) return

    // First, try to get from store
    const definitionsInStore = server_store.getEnumsDefinition || []
    const definitionInStore = definitionsInStore.find((d) => d.public_id === props.definitionId)

    if (definitionInStore) {
        localDefinitionName.value = definitionInStore.name
        return
    }

    // If not in store, fetch list from API (fallback)
    const serverId = server_store.getPublicId
    if (!serverId) return

    try {
        const res = await listEnumDefinitions(serverId)
        if (res.data) {
            // Optimistically update store? Maybe better not to interfere with other logic unless sure.
            // But we can find the name.
            const found = res.data.find((d) => d.public_id === props.definitionId)
            if (found) {
                localDefinitionName.value = found.name
            }
        }
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    if (props.definitionId) {
        void fetchDefinitionName()
    }
})

watch(
    () => props.definitionId,
    (newId) => {
        if (newId) {
            void fetchDefinitionName()
        }
    }
)

const definitionName = computed(() => localDefinitionName.value)
const isVisible = computed(() => props.show)
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
            <router-link
                :to="{
                    name: 'ServerEnumDefinitionProfile',
                    params: {
                        id: server_store.getPublicId,
                        definitionId: props.definitionId
                    }
                }"
                class="max-w-[80px] truncate uppercase tracking-wider"
            >
                {{ definitionName }}
            </router-link>
        </div>
    </div>
</template>
