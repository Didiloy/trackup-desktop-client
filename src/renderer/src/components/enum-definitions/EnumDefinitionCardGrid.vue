<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import EnumDefinitionCard from './EnumDefinitionCard.vue'
import EnumDefinitionCreateEditDialog from './create-edit/EnumDefinitionCreateEditDialog.vue'
import TransitionGroupWrapper from '@/components/common/transitions/TransitionGroupWrapper.vue'
import MemberIcon from '@/components/common/icons/MemberIcon.vue'
import EnumDefinitionsIcon from '@/components/common/icons/EnumDefinitionsIcon.vue'

const { t } = useI18n()

interface Props {
    definitions: IEnumDefinition[]
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

const showCreateDialog = ref(false)
const definitionToEdit = ref<IEnumDefinition | null>(null)

const isEmpty = computed(() => props.definitions.length === 0 && !props.loading)

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
            <div v-for="i in 6" :key="i" class="bg-surface-0 rounded-3xl overflow-hidden shadow-sm">
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
        <!-- Empty State -->
        <div
            v-else-if="isEmpty"
            class="flex flex-col items-center justify-center h-full min-h-[400px]"
        >
            <EnumDefinitionsIcon class="text-7xl text-surface-300 mb-4" />
            <p class="text-xl font-medium text-surface-600">{{ t('common.filters.no_results') }}</p>
            <p class="text-sm text-surface-500 mt-2">{{ t('common.filters.try_adjusting') }}</p>
        </div>

        <!-- Cards Grid -->
        <TransitionGroupWrapper
            v-else
            name="fade"
            tag="div"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full pb-8"
        >
            <EnumDefinitionCard
                v-for="(def, index) in definitions"
                :key="def.public_id"
                :definition="def"
                :color-index="index"
            />
        </TransitionGroupWrapper>

        <EnumDefinitionCreateEditDialog
            v-model="showCreateDialog"
            :definition-to-edit="definitionToEdit"
            @created="$emit('refresh')"
            @updated="$emit('refresh')"
        />
    </div>
</template>
