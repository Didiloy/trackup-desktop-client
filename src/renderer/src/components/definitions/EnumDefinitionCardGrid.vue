<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import type { IEnumDefinitionStats } from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'
import EnumDefinitionCard from './EnumDefinitionCard.vue'
import EnumDefinitionCreateEditDialog from './EnumDefinitionCreateEditDialog.vue'

const { t } = useI18n()

interface Props {
    definitions: IEnumDefinition[]
    statsMap: Map<string, IEnumDefinitionStats>
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

const showCreateDialog = ref(false)
const definitionToEdit = ref<IEnumDefinition | null>(null)

const isEmpty = computed(() => props.definitions.length === 0 && !props.loading)

function getStats(defId: string): IEnumDefinitionStats | undefined {
    return props.statsMap.get(defId)
}

function openCreateDialog(): void {
    definitionToEdit.value = null
    showCreateDialog.value = true
}

defineEmits<{
    (e: 'refresh'): void
}>()
</script>

<template>
    <div class="w-full h-full overflow-y-auto p-2">
        <!-- Loading State -->
        <div
            v-if="loading && definitions.length === 0"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full"
        >
            <div
                v-for="i in 6"
                :key="i"
                class="bg-surface-0 rounded-3xl overflow-hidden shadow-sm"
            >
                <Skeleton height="80px" class="!rounded-none" />
                <div class="p-5 space-y-3">
                    <Skeleton width="70%" height="1.5rem" />
                    <Skeleton width="50%" height="1rem" />
                    <div class="flex gap-2 pt-2">
                        <Skeleton width="60px" height="28px" class="rounded-lg" />
                        <Skeleton width="60px" height="28px" class="rounded-lg" />
                        <Skeleton width="60px" height="28px" class="rounded-lg" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="isEmpty"
            class="flex flex-col items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-surface-50 to-surface-100 rounded-3xl border-2 border-dashed border-surface-200"
        >
            <div
                class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-5 shadow-lg shadow-primary-500/10"
            >
                <i class="pi pi-list text-3xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-bold text-surface-900 mb-2">
                {{ t('views.server_enum_definitions.no_definitions_title') }}
            </h3>
            <p class="text-surface-500 text-sm mb-6 max-w-sm text-center">
                {{ t('views.server_enum_definitions.no_definitions') }}
            </p>
            <Button
                :label="t('views.server_enum_definitions.add_definition')"
                icon="pi pi-plus"
                rounded
                class="shadow-lg shadow-primary-500/25"
                @click="openCreateDialog"
            />
        </div>

        <!-- Cards Grid -->
        <TransitionGroup
            v-else
            name="fade"
            tag="div"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full pb-8"
        >
            <EnumDefinitionCard
                v-for="(def, index) in definitions"
                :key="def.public_id"
                :definition="def"
                :stats="getStats(def.public_id)"
                :color-index="index"
            />
        </TransitionGroup>

        <EnumDefinitionCreateEditDialog
            v-model="showCreateDialog"
            :definition-to-edit="definitionToEdit"
            @created="$emit('refresh')"
            @updated="$emit('refresh')"
        />
    </div>
</template>
