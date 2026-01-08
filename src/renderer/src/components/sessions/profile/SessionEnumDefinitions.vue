<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ISessionEnum } from '@shared/contracts/interfaces/entities/session.interfaces'
import { useEnumDefinitionNavigation } from '@/composables/enum-definitions/useEnumDefinitionNavigation'

interface Props {
    enums?: ISessionEnum[]
}

defineProps<Props>()
const { t } = useI18n()
const { navigateToEnumDefinitionProfile } = useEnumDefinitionNavigation()

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no')
    return String(value)
}
async function navigateToEnumDefinition(enum_definition_public_id: string): Promise<void> {
    await navigateToEnumDefinitionProfile(enum_definition_public_id)
}
</script>

<template>
    <div class="bg-surface-0 border border-surface-200 rounded-2xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <i class="pi pi-list text-primary-500"></i>
            {{ t('common.steps.enum_definitions') }}
        </h3>

        <div v-if="enums && enums.length > 0" class="flex flex-wrap gap-2">
            <div
                v-for="item in enums"
                :key="item.enum_selection_public_id"
                class="px-3 py-1.5 bg-surface-100 rounded-lg border border-surface-200 text-sm cursor-pointer hover:bg-surface-200 transition-colors"
                @click="navigateToEnumDefinition(item.enum_definition_public_id)"
            >
                <span class="text-surface-500 mr-2">{{ item.enum_definition_name }}:</span>
                <span class="font-medium text-surface-900">{{
                    formatValue(item.selected_value)
                }}</span>
            </div>
        </div>
        <div v-else class="text-sm text-surface-400 italic">
            {{ t('views.server_sessions.add_modal.no_enum_definitions') }}
        </div>
    </div>
</template>
