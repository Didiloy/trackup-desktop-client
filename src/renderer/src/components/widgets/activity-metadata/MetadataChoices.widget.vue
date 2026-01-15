<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import ActivityMetadataIdentityCorner from '@/components/activities/metadata/ActivityMetadataIdentityCorner.vue'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import type {
    IWidgetMetadata,
    IActivityMetadataWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'activity-metadata-choices',
        title_key: 'widgets.activity_metadata.choices.title',
        icon: 'pi pi-list',
        description_key: 'widgets.activity_metadata.choices.description',
        category: {
            key: EWidgetCategory.ActivityMetadata,
            label_key: 'widgets.categories.activity_metadata'
        },
        defaultSize: { w: 4, h: 3, minW: 4, minH: 3 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IActivityMetadataWidgetConfig
        metadataDefinitionId?: string
    }>(),
    {
        showIdentity: true,
        config: undefined,
        metadataDefinitionId: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getMetadataDefinitionById } = useActivityMetadataDefinitionCRUD()

const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)
const definitionId = computed(
    () => props.metadataDefinitionId || props.config?.metadataDefinitionId
)
const localDefinition = ref<IActivityMetadataDefinition | null>(null)
const isLoading = ref(false)

async function fetchDefinition(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!definitionId.value || !serverId || !activityId.value) return

    isLoading.value = true
    try {
        const res = await getMetadataDefinitionById(serverId, activityId.value, definitionId.value)
        if (res.data) {
            localDefinition.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchDefinition()
})

watch(
    () => [server_store.getPublicId, definitionId.value, activityId.value],
    () => {
        void fetchDefinition()
    }
)

const choices = computed(() => localDefinition.value?.choices || [])
</script>

<template>
    <BaseWidgetContainer :loading="isLoading">
        <template #header>
            <div class="pt-2 pb-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0"
                        >
                            <i class="pi pi-tags text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-surface-900">
                                {{ t('widgets.activity_metadata.choices.title') }}
                            </h3>
                            <p class="text-xs text-surface-500 mt-1">
                                {{ t('widgets.activity_metadata.choices.description') }}
                            </p>
                        </div>
                        <ActivityIdentityCorner
                            :show="props.showIdentity"
                            class="static ml-5"
                            :activity-id="activityId"
                        />
                        <ActivityMetadataIdentityCorner
                            :show="props.showIdentity"
                            class="static"
                            :activity-id="activityId"
                            :metadata-definition-id="definitionId"
                        />
                    </div>
                </div>
            </div>
        </template>

        <div v-if="choices.length > 0" class="flex-1 overflow-y-auto pr-1">
            <div class="flex flex-wrap gap-2">
                <span
                    v-for="(choice, idx) in choices"
                    :key="idx"
                    class="px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 font-medium hover:bg-surface-100 transition-colors"
                >
                    {{ choice }}
                </span>
            </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center text-surface-400">
            <i class="pi pi-ban text-2xl mb-2"></i>
            <p class="text-sm">{{ t('common.fields.no_data') }}</p>
        </div>
    </BaseWidgetContainer>
</template>
