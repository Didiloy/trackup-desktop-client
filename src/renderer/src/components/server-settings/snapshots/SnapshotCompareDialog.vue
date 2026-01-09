<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStore } from '@/stores/snapshot'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Badge from 'primevue/badge'
import type { ISnapshotLight } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

interface Props {
    visible: boolean
    serverId: string
}

interface SnapshotOption {
    label: string
    value: string
    type: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

const { t, d } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStore()

const selectedSnapshotId1 = ref<string | null>(null)
const selectedSnapshotId2 = ref<string | null>(null)
const availableSnapshots = ref<SnapshotOption[]>([])
const isLoadingSnapshots = ref(false)

// Load available snapshots when dialog opens
const loadSnapshots = async (): Promise<void> => {
    isLoadingSnapshots.value = true
    try {
        const res = await snapshotStore.fetchSnapshots(props.serverId, { page: 1, limit: 50 })
        if (!res.error && res.data) {
            availableSnapshots.value = res.data.data.map((s: ISnapshotLight) => {
                const typeLabel = t(`views.server_settings.snapshots.types.${s.type}`)
                const dateLabel = d(new Date(s.created_at), 'short')
                const titlePart = s.title ? `${s.title} - ` : ''
                return {
                    label: `${titlePart}${typeLabel} - ${dateLabel}`,
                    value: s.id,
                    type: s.type
                }
            })
        }
    } finally {
        isLoadingSnapshots.value = false
    }
}

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            loadSnapshots()
        }
    }
)

onMounted(() => {
    if (props.visible) {
        loadSnapshots()
    }
})

const handleCompare = async (): Promise<void> => {
    if (!selectedSnapshotId1.value || !selectedSnapshotId2.value) {
        toast.add({
            severity: 'warn',
            summary: t('messages.warning.title'),
            detail: t('views.server_settings.snapshots.compare.select_both'),
            life: 3000
        })
        return
    }

    const res = await snapshotStore.compareSnapshots(
        props.serverId,
        selectedSnapshotId1.value,
        selectedSnapshotId2.value
    )

    if (res.error) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: t('views.server_settings.snapshots.compare.error'),
            life: 3000
        })
    }
}

const comparison = computed(() => snapshotStore.comparison)
const isComparing = computed(() => snapshotStore.isComparing)

const formatDiff = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
}

const getDiffSeverity = (value: number): 'success' | 'danger' => {
    return value >= 0 ? 'success' : 'danger'
}

const closeDialog = (): void => {
    emit('update:visible', false)
    snapshotStore.clearComparison()
    selectedSnapshotId1.value = null
    selectedSnapshotId2.value = null
}
</script>

<template>
    <AppDialog
        :model-value="visible"
        style-class="w-full max-w-4xl"
        @update:model-value="emit('update:visible', $event)"
    >
        <template #header>
            <div class="flex flex-col gap-1">
                <h2 class="text-xl font-bold text-surface-900">
                    {{ t('views.server_settings.snapshots.compare.title') }}
                </h2>
                <p class="text-sm text-surface-500">
                    {{ t('views.server_settings.snapshots.compare.description') }}
                </p>
            </div>
        </template>

        <div class="flex flex-col gap-6 p-6">
            <!-- Loading snapshots -->
            <div v-if="isLoadingSnapshots" class="flex justify-center py-8">
                <ProgressSpinner style="width: 40px; height: 40px" />
            </div>

            <template v-else>
                <!-- Snapshot selectors -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-medium text-surface-900">
                            {{ t('views.server_settings.snapshots.compare.snapshot_1') }}
                        </label>
                        <Select
                            v-model="selectedSnapshotId1"
                            :options="availableSnapshots"
                            option-label="label"
                            option-value="value"
                            :placeholder="t('views.server_settings.snapshots.compare.select_placeholder')"
                            class="w-full"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-medium text-surface-900">
                            {{ t('views.server_settings.snapshots.compare.snapshot_2') }}
                        </label>
                        <Select
                            v-model="selectedSnapshotId2"
                            :options="availableSnapshots"
                            option-label="label"
                            option-value="value"
                            :placeholder="t('views.server_settings.snapshots.compare.select_placeholder')"
                            class="w-full"
                        />
                    </div>
                </div>

                <!-- Compare button -->
                <Button
                    :label="t('views.server_settings.snapshots.compare.submit')"
                    :loading="isComparing"
                    class="w-full md:w-auto"
                    @click="handleCompare"
                />

                <!-- Comparison results -->
                <div v-if="comparison" class="flex flex-col gap-4">
                    <h3 class="text-lg font-semibold text-surface-900">
                        {{ t('views.server_settings.snapshots.compare.results') }}
                    </h3>

                    <!-- Snapshot info -->
                    <div class="flex gap-4 p-4 rounded-xl bg-surface-50 border border-surface-200">
                        <div class="flex-1">
                            <p class="text-sm text-surface-500 mb-1">
                                {{ t('views.server_settings.snapshots.compare.snapshot_1') }}
                            </p>
                            <p class="font-semibold text-surface-900">
                                {{
                                    comparison.snapshot1.title ||
                                    t(`views.server_settings.snapshots.types.${comparison.snapshot1.type}`)
                                }}
                            </p>
                            <p class="text-sm text-surface-600">
                                {{ d(new Date(comparison.snapshot1.date), 'short') }}
                            </p>
                        </div>
                        <div class="flex items-center">
                            <i class="pi pi-arrow-right text-2xl text-surface-400"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm text-surface-500 mb-1">
                                {{ t('views.server_settings.snapshots.compare.snapshot_2') }}
                            </p>
                            <p class="font-semibold text-surface-900">
                                {{
                                    comparison.snapshot2.title ||
                                    t(`views.server_settings.snapshots.types.${comparison.snapshot2.type}`)
                                }}
                            </p>
                            <p class="text-sm text-surface-600">
                                {{ d(new Date(comparison.snapshot2.date), 'short') }}
                            </p>
                        </div>
                    </div>

                    <!-- Stats differences -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="p-4 rounded-xl bg-surface-50 border border-surface-200">
                            <p class="text-sm text-surface-500 mb-2">
                                {{ t('views.server_settings.snapshots.compare.sessions_diff') }}
                            </p>
                            <Badge
                                :value="formatDiff(comparison.comparison.sessions_diff)"
                                :severity="getDiffSeverity(comparison.comparison.sessions_diff)"
                                class="text-lg"
                            />
                        </div>

                        <div class="p-4 rounded-xl bg-surface-50 border border-surface-200">
                            <p class="text-sm text-surface-500 mb-2">
                                {{ t('views.server_settings.snapshots.compare.members_diff') }}
                            </p>
                            <Badge
                                :value="formatDiff(comparison.comparison.members_diff)"
                                :severity="getDiffSeverity(comparison.comparison.members_diff)"
                                class="text-lg"
                            />
                        </div>

                        <div class="p-4 rounded-xl bg-surface-50 border border-surface-200">
                            <p class="text-sm text-surface-500 mb-2">
                                {{ t('views.server_settings.snapshots.compare.duration_diff') }}
                            </p>
                            <Badge
                                :value="formatDiff(comparison.comparison.duration_diff)"
                                :severity="getDiffSeverity(comparison.comparison.duration_diff)"
                                class="text-lg"
                            />
                        </div>

                        <div class="p-4 rounded-xl bg-surface-50 border border-surface-200">
                            <p class="text-sm text-surface-500 mb-2">
                                {{ t('views.server_settings.snapshots.compare.engagement_diff') }}
                            </p>
                            <Badge
                                :value="formatDiff(comparison.comparison.engagement_diff)"
                                :severity="getDiffSeverity(comparison.comparison.engagement_diff)"
                                class="text-lg"
                            />
                        </div>
                    </div>

                    <!-- Top items changes -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 rounded-xl bg-surface-50 border border-surface-200">
                            <h4 class="font-semibold text-surface-900 mb-3">
                                {{ t('views.server_settings.snapshots.compare.top_members_changes') }}
                            </h4>
                            <div class="flex gap-4 text-sm">
                                <div>
                                    <span class="text-surface-500">{{
                                        t('views.server_settings.snapshots.compare.new_entries')
                                    }}:</span>
                                    <span class="font-bold text-green-600 ml-2">{{
                                        comparison.top_members_changes.new_entries.length
                                    }}</span>
                                </div>
                                <div>
                                    <span class="text-surface-500">{{
                                        t('views.server_settings.snapshots.compare.dropped_entries')
                                    }}:</span>
                                    <span class="font-bold text-red-600 ml-2">{{
                                        comparison.top_members_changes.dropped_entries.length
                                    }}</span>
                                </div>
                                <div>
                                    <span class="text-surface-500">{{
                                        t('views.server_settings.snapshots.compare.maintained')
                                    }}:</span>
                                    <span class="font-bold text-surface-900 ml-2">{{
                                        comparison.top_members_changes.maintained
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="p-4 rounded-xl bg-surface-50 border border-surface-200">
                            <h4 class="font-semibold text-surface-900 mb-3">
                                {{ t('views.server_settings.snapshots.compare.top_activities_changes') }}
                            </h4>
                            <div class="flex gap-4 text-sm">
                                <div>
                                    <span class="text-surface-500">{{
                                        t('views.server_settings.snapshots.compare.new_entries')
                                    }}:</span>
                                    <span class="font-bold text-green-600 ml-2">{{
                                        comparison.top_activities_changes.new_entries.length
                                    }}</span>
                                </div>
                                <div>
                                    <span class="text-surface-500">{{
                                        t('views.server_settings.snapshots.compare.dropped_entries')
                                    }}:</span>
                                    <span class="font-bold text-red-600 ml-2">{{
                                        comparison.top_activities_changes.dropped_entries.length
                                    }}</span>
                                </div>
                                <div>
                                    <span class="text-surface-500">{{
                                        t('views.server_settings.snapshots.compare.maintained')
                                    }}:</span>
                                    <span class="font-bold text-surface-900 ml-2">{{
                                        comparison.top_activities_changes.maintained
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Comparing spinner -->
                <div v-else-if="isComparing" class="flex justify-center items-center py-8">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>
            </template>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 p-6 pt-0">
                <Button
                    :label="t('common.actions.close')"
                    severity="secondary"
                    outlined
                    @click="closeDialog"
                />
            </div>
        </template>
    </AppDialog>
</template>
