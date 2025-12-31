<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useEnumDefinitionStatsStore } from '@/stores/enum-definition-stats'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import EnumDefinitionProfileHeader from '@/components/definitions/profile/EnumDefinitionProfileHeader.vue'
import EnumDefinitionOverviewWidget from '@/components/widgets/enum-definition/EnumDefinitionOverview.widget.vue'
import EnumDefinitionDistributionWidget from '@/components/widgets/enum-definition/EnumDefinitionDistribution.widget.vue'
import EnumDefinitionTopValuesWidget from '@/components/widgets/enum-definition/EnumDefinitionTopValues.widget.vue'
import EnumDefinitionChoicesWidget from '@/components/widgets/enum-definition/EnumDefinitionChoices.widget.vue'
import EnumDefinitionCreateEditDialog from '@/components/definitions/EnumDefinitionCreateEditDialog.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const definitionId = computed(() => route.params.definitionId as string)

const enum_def_stats_store = useEnumDefinitionStatsStore()
const server_store = useServerStore()
const { deleteEnumDefinition } = useEnumDefinitionCRUD()

// Dialogs
const showEditDialog = ref(false)
const showDeleteConfirm = ref(false)

async function loadData(): Promise<void> {
    if (!server_store.getPublicId || !definitionId.value) return
    await enum_def_stats_store.loadDefinition(server_store.getPublicId, definitionId.value)
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

        // Navigate back to list
        router.push({
            name: 'ServerDefinitions',
            params: { id: server_store.getPublicId }
        })
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
    await loadData()
}

watch(
    () => [server_store.getPublicId, definitionId.value],
    () => {
        if (server_store.getPublicId && definitionId.value) {
            void loadData()
        }
    },
    { immediate: true }
)

onMounted(async () => {
    if (server_store.getPublicId && definitionId.value) {
        await loadData()
    }
})

onUnmounted(() => {
    enum_def_stats_store.reset()
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div
            v-if="enum_def_stats_store.error"
            class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
        >
            {{ enum_def_stats_store.error }}
        </div>

        <!-- Header with skeleton -->
        <EnumDefinitionProfileHeader
            v-if="enum_def_stats_store.currentDefinition || enum_def_stats_store.isLoading"
            :definition="enum_def_stats_store.currentDefinition"
            :stats="enum_def_stats_store.currentDefinitionStats"
            :loading="enum_def_stats_store.isLoading"
            class="mb-6"
            @edit="openEditDialog"
            @delete="openDeleteConfirm"
        />

        <!-- Stats Content -->
        <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
            <div key="stats-content" class="space-y-6">
                <!-- Overview Widgets - 4 cards responsive -->
                <EnumDefinitionOverviewWidget />

                <!-- Main Grid: Distribution + Top Values on large screens, stacked on mobile -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <EnumDefinitionDistributionWidget />
                    <EnumDefinitionTopValuesWidget />
                </div>

                <!-- Choices Widget - full width -->
                <EnumDefinitionChoicesWidget />
            </div>
        </TransitionWrapper>

        <!-- Edit Dialog -->
        <EnumDefinitionCreateEditDialog
            v-model="showEditDialog"
            :definition-to-edit="enum_def_stats_store.currentDefinition"
            @updated="handleUpdated"
        />

        <!-- Delete Confirmation Dialog -->
        <ConfirmationDialog
            :model-value="showDeleteConfirm"
            :title="t('common.actions.delete')"
            :message="t('messages.warning.delete')"
            :confirmation-name="enum_def_stats_store.currentDefinition?.name || ''"
            @update:model-value="showDeleteConfirm = $event"
            @confirm="handleDelete"
        />
    </div>
</template>
