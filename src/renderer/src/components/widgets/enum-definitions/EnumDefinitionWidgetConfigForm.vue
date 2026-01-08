<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import EnumDefinitionAutocomplete from '@/components/enum-definitions/EnumDefinitionAutocomplete.vue'
import { useServerStore } from '@/stores/server'
import { useEnumDefinitionCRUD } from '@/composables/enum-definitions/useEnumDefinitionCRUD'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'

const props = defineProps<{
    modelValue: Record<string, any>
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, any>): void
}>()

const { t } = useI18n()
const server_store = useServerStore()
const { listEnumDefinitions } = useEnumDefinitionCRUD()
const selectedDefinition = ref<IEnumDefinition | null>(null)

// Attempt to restore selected definition if config has ID
onMounted(async () => {
    if (props.modelValue.enumDefinitionId && server_store.getPublicId) {
        // We could look in store first if available
        let def = server_store.getEnumsDefinition?.find(
            (d) => d.public_id === props.modelValue.enumDefinitionId
        )

        if (!def) {
            // Fallback to fetch if not in store (though usually it should be)
            try {
                const res = await listEnumDefinitions(server_store.getPublicId)
                if (res.data) {
                    server_store.setEnumsDefinition(res.data)
                    def = res.data.find((d) => d.public_id === props.modelValue.enumDefinitionId)
                }
            } catch (e) {
                console.error(e)
            }
        }

        if (def) {
            selectedDefinition.value = def
        }
    }
})

function handleSelect(definition: IEnumDefinition | null): void {
    selectedDefinition.value = definition
    emit('update:modelValue', {
        ...props.modelValue,
        enumDefinitionId: definition?.public_id
    })
}
</script>

<template>
    <div class="space-y-4">
        <label class="block text-sm font-medium text-surface-700">
            {{
                t('common.actions.select', {
                    entity: t('views.server_enum_definitions.profile.title').toLowerCase()
                })
            }}
        </label>
        <EnumDefinitionAutocomplete
            :initial-definition="selectedDefinition"
            :model-value="selectedDefinition?.name || ''"
            @select="handleSelect"
        />
    </div>
</template>
