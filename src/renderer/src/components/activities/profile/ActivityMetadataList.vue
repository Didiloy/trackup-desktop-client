<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { computed } from 'vue'
import MetadataTypeBadge from '@/components/common/icons/MetadataTypeBadge.vue'
import MetadataIcon from '@/components/common/icons/MetadataIcon.vue'
import { getMetadataTypeTranslationKey } from '@/utils/metadata.utils'
import type { ActivityMetadataType } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

const props = defineProps<{
    activity: IActivity | null
    metadataDefinitions?: IActivityMetadataDefinition[]
}>()

const { t, te } = useI18n()
const router = useRouter()
const server_store = useServerStore()

function formatTypeLabel(type?: string): string {
    if (!type) return ''
    const key = getMetadataTypeTranslationKey(type as ActivityMetadataType)
    return te(key) ? t(key) : String(type)
}

const hasMetadata = computed(() => {
    return props.metadataDefinitions && props.metadataDefinitions.length > 0
})

async function navigateToMetadataProfile(metadataDefinitionId: string): Promise<void> {
    if (server_store.getPublicId && props.activity) {
        await router.push({
            name: 'ServerActivityMetadataProfile',
            params: {
                id: server_store.getPublicId,
                activityId: props.activity.public_id,
                metadataDefinitionId
            }
        })
    }
}
</script>

<template>
    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm h-full">
        <div class="flex items-center gap-2 mb-4">
            <MetadataIcon class="text-primary-500" />
            <p class="text-sm font-semibold text-surface-700">
                {{ t('views.server_activities.add_modal.metadata_list') }}
            </p>
        </div>

        <div v-if="hasMetadata" class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            <div
                v-for="meta in metadataDefinitions"
                :key="meta.public_id"
                class="p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors cursor-pointer"
                @click="navigateToMetadataProfile(meta.public_id)"
            >
                <div class="flex items-start gap-3">
                    <!-- Type Icon -->
                    <MetadataTypeBadge :type="meta.type" />

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <p class="font-medium text-surface-900">
                                {{ meta.label || meta.key }}
                            </p>
                            <span
                                v-if="meta.required"
                                class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 uppercase"
                            >
                                {{ t('common.fields.required') }}
                            </span>
                        </div>

                        <p
                            v-if="meta.description"
                            class="text-xs text-surface-500 mt-0.5 line-clamp-2"
                        >
                            {{ meta.description }}
                        </p>

                        <div class="flex flex-wrap gap-2 mt-2">
                            <span
                                class="text-[10px] px-2 py-1 rounded-full bg-surface-200 text-surface-600 font-medium"
                            >
                                {{ formatTypeLabel(meta.type) }}
                            </span>

                            <span
                                v-if="meta.choices?.length"
                                class="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium"
                            >
                                {{ meta.choices.length }} {{ t('common.fields.choices') }}
                            </span>

                            <span
                                v-if="!meta.allow_not_predefined_value && meta.choices?.length"
                                class="text-[10px] px-2 py-1 rounded-full bg-surface-200 text-surface-600 font-medium"
                            >
                                {{ t('views.server_activities.add_modal.predefined_only') }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-8 text-surface-400">
            <MetadataIcon class="text-3xl mb-2 opacity-50" />
            <span class="text-sm">{{ t('common.fields.none') }}</span>
        </div>
    </div>
</template>
