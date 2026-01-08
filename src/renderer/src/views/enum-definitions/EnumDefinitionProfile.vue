<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useEnumDefinitionNavigation } from '@/composables/enum-definitions/useEnumDefinitionNavigation'
import { useEnumDefinitionCRUD } from '@/composables/enum-definitions/useEnumDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import EnumDefinitionProfileHeader from '@/components/definitions/profile/EnumDefinitionProfileHeader.vue'
import EnumDefinitionTotalUsageWidget from '@/components/widgets/enum-definition/EnumDefinitionTotalUsage.widget.vue'
import EnumDefinitionTotalSessionsWidget from '@/components/widgets/enum-definition/EnumDefinitionTotalSessions.widget.vue'
import EnumDefinitionTotalDurationWidget from '@/components/widgets/enum-definition/EnumDefinitionTotalDuration.widget.vue'
import EnumDefinitionUniqueUsersWidget from '@/components/widgets/enum-definition/EnumDefinitionUniqueUsers.widget.vue'
import EnumDefinitionDistributionWidget from '@/components/widgets/enum-definition/EnumDefinitionDistribution.widget.vue'
import EnumDefinitionChoicesWidget from '@/components/widgets/enum-definition/EnumDefinitionChoices.widget.vue'
import EnumDefinitionMostUsedValueWidget from '@/components/widgets/enum-definition/EnumDefinitionMostUsedValue.widget.vue'
import EnumDefinitionAvgLikesWidget from '@/components/widgets/enum-definition/EnumDefinitionAvgLikes.widget.vue'
import EnumDefinitionAvgParticipantsWidget from '@/components/widgets/enum-definition/EnumDefinitionAvgParticipants.widget.vue'
import EnumDefinitionCreateEditDialog from '@/components/definitions/EnumDefinitionCreateEditDialog.vue'
import EnumDefinitionTopValuesWidget from '@/components/widgets/enum-definition/EnumDefinitionTopValues.widget.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const definitionId = computed(() => route.params.enumDefinitionId as string)

const server_store = useServerStore()
const { deleteEnumDefinition } = useEnumDefinitionCRUD()
const { navigateToEnumDefinitionProfile } = useEnumDefinitionNavigation()

// Local state
const enumDefinition = ref<IEnumDefinition | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Dialogs
const showEditDialog = ref(false)
const showDeleteConfirm = ref(false)

async function loadEnumDefinition(): Promise<void> {
    if (!server_store.getPublicId || !definitionId.value) return

    loading.value = true
    error.value = null

    try {
        // Get definition from server store (already loaded)
        const definitions = server_store.getEnumsDefinition
        if (!definitions || definitions.length === 0) {
            error.value = t('messages.error.fetch')
            return
        }

        const foundDef = definitions.find((d) => d.public_id === definitionId.value)
        if (!foundDef) {
            error.value = t('messages.error.not_found')
            return
        }

        enumDefinition.value = foundDef
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.fetch')
    } finally {
        loading.value = false
    }
}

function openEditDialog() {
    showEditDialog.value = true
}

function openDeleteConfirm() {
    showDeleteConfirm.value = true
}

async function handleDelete() {
    if (!server_store.getPublicId || !definitionId.value) return
    try {
        const res = await deleteEnumDefinition(server_store.getPublicId, definitionId.value)
        if (res.error) throw new Error(res.error)

        toast.add({
            severity: 'success',
            summary: t('messages.success.delete'),
            life: 3000
        })

        // Navigate back to list - doesn't need navigation since it's going to list view
        //navigateToEnumDefinitionProfile(server_store.getPublicId)
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.delete'),
            detail: e instanceof Error ? e.message : 'Unknown error',
            life: 3000
        })
    } finally {
        showDeleteConfirm.value = false
    }
}

async function handleUpdated() {
    showEditDialog.value = false
    await loadEnumDefinition()
}

watch(
    () => [server_store.getPublicId, definitionId.value],
    () => {
        if (server_store.getPublicId && definitionId.value) {
            void loadEnumDefinition()
        }
    },
    { immediate: true }
)

onMounted(async () => {
    if (server_store.getPublicId && definitionId.value) {
        await loadEnumDefinition()
    }
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {{ error }}
        </div>

        <!-- Header with skeleton -->
        <EnumDefinitionProfileHeader
            v-if="enumDefinition || loading"
            :definition="enumDefinition"
            :loading="loading"
            class="mb-6"
            @edit="openEditDialog"
            @delete="openDeleteConfirm"
        />

        <!-- Stats Content -->
        <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
            <div key="stats-content" class="space-y-6">
                <EnumDefinitionChoicesWidget :show-identity="false" />
                <!-- Overview Widgets - 5 cards responsive -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <EnumDefinitionTotalUsageWidget :show-identity="false" />
                    <EnumDefinitionTotalSessionsWidget :show-identity="false" />
                    <EnumDefinitionTotalDurationWidget :show-identity="false" />
                    <EnumDefinitionUniqueUsersWidget :show-identity="false" />
                    <EnumDefinitionAvgLikesWidget :show-identity="false" />
                    <EnumDefinitionAvgParticipantsWidget :show-identity="false" />
                    <EnumDefinitionMostUsedValueWidget :show-identity="false" />
                </div>

                <!-- Main Grid: Distribution + Top Values on large screens, stacked on mobile -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <EnumDefinitionDistributionWidget :show-identity="false" />
                    <EnumDefinitionTopValuesWidget :show-identity="false" />
                </div>

                <!-- Choices Widget - full width -->
            </div>
        </TransitionWrapper>

        <!-- Edit Dialog -->
        <EnumDefinitionCreateEditDialog
            v-model="showEditDialog"
            :definition-to-edit="enumDefinition"
            @updated="handleUpdated"
        />

        <!-- Delete Confirmation Dialog -->
        <ConfirmationDialog
            :model-value="showDeleteConfirm"
            :title="t('common.actions.delete')"
            :message="t('messages.warning.delete')"
            :confirmation-name="enumDefinition?.name || ''"
            @update:model-value="showDeleteConfirm = $event"
            @confirm="handleDelete"
        />
    </div>
</template>
