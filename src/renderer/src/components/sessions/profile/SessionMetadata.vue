<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ISessionMetadata } from '@shared/contracts/interfaces/entities/session.interfaces'
import MetadataIcon from '@/components/common/icons/MetadataIcon.vue'

interface Props {
    metadata?: ISessionMetadata[]
}

defineProps<Props>()
const { t } = useI18n()

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no')
    return String(value)
}
</script>

<template>
    <div class="bg-surface-0 border border-surface-200 rounded-2xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <MetadataIcon class="text-primary-500" />
            {{ t('common.steps.metadata') }}
        </h3>

        <div class="space-y-6">
            <!-- Custom Metadata -->
            <div>
                <div
                    v-if="metadata && metadata.length > 0"
                    class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                    <div
                        v-for="item in metadata"
                        :key="item.metadata_selection_public_id"
                        class="p-3 bg-surface-50 rounded-xl border border-surface-100"
                    >
                        <div class="text-sm text-surface-500 mb-1">{{ item.label }}</div>
                        <div class="font-medium text-surface-900">
                            {{ formatValue(item.value) }}
                        </div>
                    </div>
                </div>
                <div v-else class="text-sm text-surface-400 italic">
                    {{ t('views.server_sessions.add_modal.no_metadata') }}
                </div>
            </div>
        </div>
    </div>
</template>
