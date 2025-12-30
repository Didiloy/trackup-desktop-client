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
    return props.metadataDefinitions && props.metadataDefinitions.length > 0
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

function getColorForType(type: string): { bg: string; text: string } {
    switch (type) {
        case 'NUMBER':
            return { bg: 'bg-blue-50', text: 'text-blue-600' }
        case 'BOOLEAN':
            return { bg: 'bg-green-50', text: 'text-green-600' }
        case 'DATE':
            return { bg: 'bg-purple-50', text: 'text-purple-600' }
        default:
            return { bg: 'bg-primary-50', text: 'text-primary-600' }
    }
}
</script>

<template>
    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm h-full">
        <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-database text-primary-500"></i>
            <p class="text-sm font-semibold text-surface-700">
                {{ t('views.activity.add_modal.metadata_list') }}
            </p>
        </div>

        <div v-if="hasMetadata" class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            <div
                v-for="meta in metadataDefinitions"
                :key="meta.public_id"
                class="p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors"
            >
                <div class="flex items-start gap-3">
                    <!-- Type Icon -->
                    <div
                        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        :class="[getColorForType(meta.type).bg, getColorForType(meta.type).text]"
                    >
                        <i :class="getIconForType(meta.type)" class="text-lg"></i>
                    </div>

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

                        <p v-if="meta.description" class="text-xs text-surface-500 mt-0.5 line-clamp-2">
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
                                v-if="!meta.allow_not_predefined && meta.choices?.length"
                                class="text-[10px] px-2 py-1 rounded-full bg-surface-200 text-surface-600 font-medium"
                            >
                                {{ t('views.activity.add_modal.predefined_only') }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center py-8 text-surface-400"
        >
            <i class="pi pi-database text-3xl mb-2 opacity-50"></i>
            <span class="text-sm">{{ t('common.fields.none') }}</span>
        </div>
    </div>
</template>
