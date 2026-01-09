<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStore } from '@/stores/snapshot'
import { useSnapshot } from '@/composables/snapshots/useSnapshot'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Badge from 'primevue/badge'
import type { ISnapshotLight } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'
import { formatDate } from '@/utils'

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

const { t } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStore()
const { getSnapshotDisplayName, formatTrendValue, getTrendSeverity } = useSnapshot()

const selectedSnapshotId1 = ref<string | null>(null)
const selectedSnapshotId2 = ref<string | null>(null)
const availableSnapshots = ref<SnapshotOption[]>([])
const isLoadingSnapshots = ref(false)

// Load available snapshots when dialog opens
const loadSnapshots = async (): Promise<void> => {
    isLoadingSnapshots.value = true
    try {
        const res = await snapshotStore.fetch_snapshots(props.serverId, { page: 1, limit: 100 })
        if (!res.error && res.data) {
            rawSnapshots.value = res.data.data
            availableSnapshots.value = res.data.data.map((s: ISnapshotLight) => {
                const typeLabel = t(`common.periods.${s.snapshot_type}`)
                const dateLabel = formatDate(s.snapshot_date)
                const titlePart = s.title ? `${s.title} - ` : ''
                return {
                    label: `${titlePart}${typeLabel} - ${dateLabel}`,
                    value: s.id,
                    type: s.snapshot_type
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
        } else {
            snapshotStore.clear_comparison()
            selectedSnapshotId1.value = null
            selectedSnapshotId2.value = null
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

    const res = await snapshotStore.compare_snapshots(
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
const isComparing = computed(() => snapshotStore.is_comparing)

// Store full snapshot data for displaying specific values
const rawSnapshots = ref<ISnapshotLight[]>([])

const selectedSnapshot1Data = computed(() =>
    rawSnapshots.value.find(s => s.id === selectedSnapshotId1.value)
)
const selectedSnapshot2Data = computed(() =>
    rawSnapshots.value.find(s => s.id === selectedSnapshotId2.value)
)

const closeDialog = (): void => {
    emit('update:visible', false)
    snapshotStore.clear_comparison()
    selectedSnapshotId1.value = null
    selectedSnapshotId2.value = null
}
</script>

<template>
    <AppDialog
        :model-value="visible"
        style-class="w-full max-w-5xl"
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
                <div class="grid grid-cols-1 md:grid-cols-[1fr_60px_1fr_auto] gap-4 items-end">
                    <div class="flex flex-col gap-2 w-full">
                        <label class="font-medium text-surface-900">
                            {{ t('views.server_settings.snapshots.compare.snapshot_1') }}
                        </label>
                        <Select
                            v-model="selectedSnapshotId1"
                            :options="availableSnapshots"
                            option-label="label"
                            option-value="value"
                            :placeholder="
                                t('views.server_settings.snapshots.compare.select_placeholder')
                            "
                            class="w-full"
                        />
                    </div>

                    <div class="flex items-center justify-center pb-3">
                        <i class="pi pi-arrow-right text-surface-400 text-xl hidden md:block"></i>
                        <i class="pi pi-arrow-down text-surface-400 text-xl md:hidden"></i>
                    </div>

                    <div class="flex flex-col gap-2 w-full">
                        <label class="font-medium text-surface-900">
                            {{ t('views.server_settings.snapshots.compare.snapshot_2') }}
                        </label>
                        <Select
                            v-model="selectedSnapshotId2"
                            :options="availableSnapshots"
                            option-label="label"
                            option-value="value"
                            :placeholder="
                                t('views.server_settings.snapshots.compare.select_placeholder')
                            "
                            class="w-full"
                        />
                    </div>

                    <Button
                        icon="pi pi-search"
                        :label="t('views.server_settings.snapshots.actions.compare')"
                        :loading="isComparing"
                        class="w-full md:w-auto mt-4 md:mt-0"
                        @click="handleCompare"
                    />
                </div>

                <!-- Comparison results -->
                <div v-if="comparison" class="flex flex-col gap-4">
                    <h3 class="text-lg font-semibold text-surface-900">
                        {{ t('views.server_settings.snapshots.compare.results') }}
                    </h3>

                    <!-- Stats Grid -->
                    <div class="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-6 items-center">
                        <!-- Headers (optional, or just labels per row) -->

                        <!-- Sessions -->
                        <div class="col-span-4 grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 rounded-xl bg-surface-50 border border-surface-200">
                             <div class="text-center">
                                <p class="text-sm text-surface-500 mb-1">
                                    {{ t('views.server_settings.snapshots.compare.snapshot_1') }}
                                </p>
                                <p class="text-lg font-semibold text-surface-900">
                                    {{ selectedSnapshot1Data?.highlights?.total_sessions ?? '-' }}
                                </p>
                                <p class="text-xs text-surface-500">{{ t('common.stats.sessions') }}</p>
                             </div>

                             <div class="flex flex-col items-center">
                                <Badge
                                    :value="formatTrendValue(comparison.comparison.sessions_diff, true)"
                                    :severity="getTrendSeverity(comparison.comparison.sessions_diff)"
                                    class="text-lg"
                                />
                                <p class="text-xs text-surface-500 mt-1">{{ t('views.server_settings.snapshots.compare.sessions_diff') }}</p>
                             </div>

                             <div class="text-center">
                                <p class="text-sm text-surface-500 mb-1">
                                    {{ t('views.server_settings.snapshots.compare.snapshot_2') }}
                                </p>
                                <p class="text-lg font-semibold text-surface-900">
                                    {{ selectedSnapshot2Data?.highlights?.total_sessions ?? '-' }}
                                </p>
                                <p class="text-xs text-surface-500">{{ t('common.stats.sessions') }}</p>
                             </div>
                        </div>

                        <!-- Members -->
                        <div class="col-span-4 grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 rounded-xl bg-surface-50 border border-surface-200">
                             <div class="text-center">
                                <p class="text-lg font-semibold text-surface-900">
                                    {{ selectedSnapshot1Data?.highlights?.total_members ?? '-' }}
                                </p>
                                <p class="text-xs text-surface-500">{{ t('common.stats.members') }}</p>
                             </div>

                             <div class="flex flex-col items-center">
                                <Badge
                                    :value="formatTrendValue(comparison.comparison.members_diff, true)"
                                    :severity="getTrendSeverity(comparison.comparison.members_diff)"
                                    class="text-lg"
                                />
                                <p class="text-xs text-surface-500 mt-1">{{ t('views.server_settings.snapshots.compare.members_diff') }}</p>
                             </div>

                             <div class="text-center">
                                <p class="text-lg font-semibold text-surface-900">
                                    {{ selectedSnapshot2Data?.highlights?.total_members ?? '-' }}
                                </p>
                                <p class="text-xs text-surface-500">{{ t('common.stats.members') }}</p>
                             </div>
                        </div>

                        <!-- Duration -->
                        <div class="col-span-4 grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 rounded-xl bg-surface-50 border border-surface-200">
                             <div class="text-center">
                                <p class="text-lg font-semibold text-surface-900">
                                    {{ (selectedSnapshot1Data?.highlights?.total_duration ? (selectedSnapshot1Data?.highlights?.total_duration / 3600).toFixed(1) : '-') + 'h' }}
                                </p>
                                <p class="text-xs text-surface-500">{{ t('common.stats.total_duration') }}</p>
                             </div>

                             <div class="flex flex-col items-center">
                                <Badge
                                    :value="formatTrendValue(comparison.comparison.duration_diff, true)"
                                    :severity="getTrendSeverity(comparison.comparison.duration_diff)"
                                    class="text-lg"
                                />
                                <p class="text-xs text-surface-500 mt-1">{{ t('views.server_settings.snapshots.compare.duration_diff') }}</p>
                             </div>

                             <div class="text-center">
                                <p class="text-lg font-semibold text-surface-900">
                                    {{ (selectedSnapshot2Data?.highlights?.total_duration ? (selectedSnapshot2Data?.highlights?.total_duration / 3600).toFixed(1) : '-') + 'h' }}
                                </p>
                                <p class="text-xs text-surface-500">{{ t('common.stats.total_duration') }}</p>
                             </div>
                        </div>

                        <!-- Engagement -->
                        <div class="col-span-4 grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 rounded-xl bg-surface-50 border border-surface-200">
                             <div class="text-center">
                                <p class="text-lg font-semibold text-surface-900">
                                    {{ selectedSnapshot1Data?.highlights?.engagement_score?.toFixed(1) ?? '-' }}
                                </p>
                                <p class="text-xs text-surface-500">{{ t('common.stats.engagement') }}</p>
                             </div>

                             <div class="flex flex-col items-center">
                                <Badge
                                    :value="formatTrendValue(comparison.comparison.engagement_diff, true)"
                                    :severity="getTrendSeverity(comparison.comparison.engagement_diff)"
                                    class="text-lg"
                                />
                                <p class="text-xs text-surface-500 mt-1">{{ t('views.server_settings.snapshots.compare.engagement_diff') }}</p>
                             </div>

                             <div class="text-center">
                                <p class="text-lg font-semibold text-surface-900">
                                    {{ selectedSnapshot2Data?.highlights?.engagement_score?.toFixed(1) ?? '-' }}
                                </p>
                                <p class="text-xs text-surface-500">{{ t('common.stats.engagement') }}</p>
                             </div>
                        </div>
                    </div>

                    <!-- Top items changes -->
                    <h4 class="font-semibold text-surface-900 mt-2">
                        {{ t('views.server_settings.snapshots.compare.top_members_changes') }}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-[1fr_60px_1fr_auto] gap-4 items-center p-4 rounded-xl bg-surface-50 border border-surface-200">
                        <div class="text-center md:text-left">
                           <span class="text-surface-500 text-sm block">{{ t('views.server_settings.snapshots.compare.dropped_entries') }}</span>
                           <span class="font-bold text-red-600 text-lg">{{ comparison.top_members_changes.dropped_entries.length }}</span>
                        </div>
                        <div class="text-center">
                           <span class="text-surface-500 text-xs block mb-1">{{ t('views.server_settings.snapshots.compare.maintained') }}</span>
                           <span class="font-bold text-surface-900">{{ comparison.top_members_changes.maintained }}</span>
                        </div>
                        <div class="text-center md:text-left">
                           <span class="text-surface-500 text-sm block">{{ t('views.server_settings.snapshots.compare.new_entries') }}</span>
                           <span class="font-bold text-green-600 text-lg">{{ comparison.top_members_changes.new_entries.length }}</span>
                        </div>
                         <div class="hidden md:block w-[100px]"></div>
                    </div>
                    
                    <h4 class="font-semibold text-surface-900 mt-2">
                        {{ t('views.server_settings.snapshots.compare.top_activities_changes') }}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-[1fr_60px_1fr_auto] gap-4 items-center p-4 rounded-xl bg-surface-50 border border-surface-200">
                        <div class="text-center md:text-left">
                           <span class="text-surface-500 text-sm block">{{ t('views.server_settings.snapshots.compare.dropped_entries') }}</span>
                           <span class="font-bold text-red-600 text-lg">{{ comparison.top_activities_changes.dropped_entries.length }}</span>
                        </div>
                        <div class="text-center">
                           <span class="text-surface-500 text-xs block mb-1">{{ t('views.server_settings.snapshots.compare.maintained') }}</span>
                           <span class="font-bold text-surface-900">{{ comparison.top_activities_changes.maintained }}</span>
                        </div>
                        <div class="text-center md:text-left">
                           <span class="text-surface-500 text-sm block">{{ t('views.server_settings.snapshots.compare.new_entries') }}</span>
                           <span class="font-bold text-green-600 text-lg">{{ comparison.top_activities_changes.new_entries.length }}</span>
                        </div>
                         <div class="hidden md:block w-[100px]"></div>
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
