<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import MetadataIcon from '@/components/common/icons/MetadataIcon.vue'

const route = useRoute()
const server_store = useServerStore()
const { getMetadataDefinitionById } = useActivityMetadataDefinitionCRUD()

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

async function fetchDefinition(): Promise<void> {
    if (!props.metadataDefinitionId || !props.show) return

    const serverId = server_store.getPublicId
    if (!serverId || !activityIdValue.value) return

    try {
        const res = await getMetadataDefinitionById(
            serverId,
            activityIdValue.value,
            props.metadataDefinitionId
        )
        if (res.data) {
            localDefinition.value = res.data
        }
    } catch (e) {
        console.error(e)
    }
}

watch(
    () => [props.metadataDefinitionId, server_store.getPublicId, activityIdValue.value, props.show],
    () => {
        void fetchDefinition()
    },
    { immediate: true }
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
            <MetadataIcon />
            <router-link
                :to="{
                    name: 'ServerActivityMetadataProfile',
                    params: {
                        id: server_store.getPublicId,
                        activityId: props.activityId,
                        metadataDefinitionId: props.metadataDefinitionId
                    }
                }"
                class="max-w-[60px] truncate uppercase tracking-wider"
            >
                {{ definitionName }}
            </router-link>
        </div>
    </div>
</template>
