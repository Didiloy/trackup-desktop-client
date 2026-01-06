<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import MetadataTypeBadge from '@/components/common/icons/MetadataTypeBadge.vue'

const route = useRoute()
const server_store = useServerStore()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()

const props = withDefaults(
    defineProps<{
        show?: boolean
        class?: string
        activityId?: string
        metadataDefinitionId?: string
    }>(),
    {
        show: true,
        class: 'top-4 right-4',
        activityId: undefined,
        metadataDefinitionId: undefined
    }
)

const localDefinition = ref<IActivityMetadataDefinition | null>(null)
const activityIdValue = computed(() => props.activityId || (route.params.activityId as string))

const definitionName = computed(() => {
    if (!props.metadataDefinitionId || !props.show) return null
    return localDefinition.value?.label || localDefinition.value?.key || null
})

const definitionType = computed(() => {
    if (!props.metadataDefinitionId || !props.show) return null
    return localDefinition.value?.type || null
})

async function fetchDefinition(): Promise<void> {
    if (!props.metadataDefinitionId || !props.show) return

    const serverId = server_store.getPublicId
    if (!serverId || !activityIdValue.value) return

    try {
        const res = await listMetadataDefinitions(serverId, activityIdValue.value)
        if (res.data) {
            const found = res.data.find((d) => d.public_id === props.metadataDefinitionId)
            if (found) {
                localDefinition.value = found
            }
        }
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    if (props.metadataDefinitionId) {
        void fetchDefinition()
    }
})

watch(
    () => props.metadataDefinitionId,
    (newId) => {
        if (newId) {
            void fetchDefinition()
        }
    }
)

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
            <MetadataTypeBadge
                :type="definitionType"
                class="text-[9px] text-surface-500 hover:text-primary-500"
                size="sm"
            />
            <router-link
                :to="{
                    name: 'ServerActivityMetadataProfile',
                    params: {
                        id: server_store.getPublicId,
                        activityId: props.activityId,
                        metadataDefinitionId: props.metadataDefinitionId
                    }
                }"
                class="max-w-[80px] truncate uppercase tracking-wider"
            >
                {{ definitionName }}
            </router-link>
        </div>
    </div>
</template>
