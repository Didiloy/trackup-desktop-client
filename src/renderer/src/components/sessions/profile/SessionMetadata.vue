<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type {
    ISession,
    ISessionMetadata
} from '@shared/contracts/interfaces/entities/session.interfaces'
import MetadataIcon from '@/components/common/icons/MetadataIcon.vue'
import { useMetadataNavigation } from '@/composables/activities/useMetadataNavigation'

interface Props {
    session: ISession
    metadata?: ISessionMetadata[]
}

const props = defineProps<Props>()
const { t } = useI18n()
const { navigateToMetadataProfile } = useMetadataNavigation()

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no')
    return String(value)
}

async function navigateToMetaDataProfile(metadata_definition_public_id: string): Promise<void> {
    await navigateToMetadataProfile(props.session.activity.public_id, metadata_definition_public_id)
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
                        class="p-3 bg-surface-50 rounded-xl border border-surface-100 hover:border-primary-200 transition-colors cursor-pointer"
                        @click="navigateToMetaDataProfile(item.metadata_definition_public_id)"
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
