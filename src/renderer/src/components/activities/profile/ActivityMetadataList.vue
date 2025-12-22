<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { computed } from 'vue'

const props = defineProps<{
    metadataDefinitions?: IActivityMetadataDefinition[]
}>()

const { t, te } = useI18n()

function formatTypeLabel(type?: string): string {
    if (!type) return ''
    const key = `views.activity.add_modal.metadata_type_${String(type).toLowerCase()}`
    return te(key) ? t(key) : String(type)
}

const hasMetadata = computed(() => {
    return (props.metadataDefinitions && props.metadataDefinitions.length > 0)
})

function getIconForType(type: string): string {
    switch (type) {
        case 'NUMBER':
            return 'pi pi-hashtag'
        case 'BOOLEAN':
            return 'pi pi-check-square'
        case 'DATE':
            return 'pi pi-calendar'
        default:
            return 'pi pi-align-left'
    }
}
</script>

<template>
    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm h-full">
        <p class="text-sm font-semibold text-surface-600 mb-4">
            {{ t('views.activity.add_modal.metadata_list') }}
        </p>

        <div v-if="hasMetadata" class="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            <div
                v-for="meta in metadataDefinitions"
                :key="meta.public_id"
                class="bg-surface-50 rounded-xl p-3 border border-surface-200 flex items-center gap-3"
            >
                <div
                    class="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"
                >
                    <i :class="getIconForType(meta.type)"></i>
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <p class="text-sm font-semibold text-surface-900 truncate">
                            {{ meta.label || meta.key }}
                        </p>

                        <span
                            v-if="meta.required"
                            class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 uppercase"
                        >
                            {{ t('common.fields.required') }}
                        </span>
                    </div>

                    <p v-if="meta.description" class="text-xs text-surface-500 truncate">
                        {{ meta.description }}
                    </p>

                    <div class="flex flex-wrap gap-1 mt-1">
                        <span
                            class="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-surface-600 font-medium"
                        >
                            {{ formatTypeLabel(meta.type) }}
                        </span>

                        <span
                            v-if="meta.choices?.length"
                            class="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-surface-600 font-medium"
                        >
                            {{ meta.choices.length }} {{ t('common.fields.choices') }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-8 text-center">
            <div
                class="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center mb-3"
            >
                <i class="pi pi-database text-surface-400 text-xl"></i>
            </div>

            <p class="text-sm text-surface-600 font-medium">
                {{ t('views.activity.no_metadata') }}
            </p>

            <p class="text-xs text-surface-500 mt-1 max-w-[200px]">
                {{ t('views.activity.no_metadata_description') }}
            </p>
        </div>
    </div>
</template>
