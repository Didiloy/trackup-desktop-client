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
const { formatTrendValue, getTrendSeverity } = useSnapshot()

const selectedSnapshotId1 = ref<string | null>(null)
const selectedSnapshotId2 = ref<string | null>(null)
const availableSnapshots = ref<SnapshotOption[]>([])
const isLoadingSnapshots = ref(false)
const needsComparison = ref(true)

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
            // Reset comparison state when opening
            needsComparison.value = true
            loadSnapshots()
        } else {
            snapshotStore.clear_comparison()
            selectedSnapshotId1.value = null
            selectedSnapshotId2.value = null
            needsComparison.value = true
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
    } else {
        needsComparison.value = false
    }
}

const comparison = computed(() => snapshotStore.comparison)
const isComparing = computed(() => snapshotStore.is_comparing)

// Store full snapshot data for displaying specific values
const rawSnapshots = ref<ISnapshotLight[]>([])

const selectedSnapshot1Data = computed(() =>
    rawSnapshots.value.find((s) => s.id === selectedSnapshotId1.value)
)
const selectedSnapshot2Data = computed(() =>
    rawSnapshots.value.find((s) => s.id === selectedSnapshotId2.value)
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
        style-class="w-full max-w-5xl h-[80vh]"
        content-class="bg-surface-50 h-full overflow-hidden"
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
                <div class="flex flex-col gap-4 mb-2">
                    <div class="grid grid-cols-[260px_1fr_260px] md:grid-cols-[280px_1fr_280px] gap-4 items-end">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-medium text-surface-900 truncate">
                                {{ t('views.server_settings.snapshots.compare.snapshot_1') }}
                            </label>
                            <Select
                                v-model="selectedSnapshotId1"
                                :options="availableSnapshots"
                                option-label="label"
                                option-value="value"
                                :placeholder="t('views.server_settings.snapshots.compare.select_placeholder')"
                                class="w-full"
                                @change="needsComparison = true"
                            />
                        </div>

                        <div class="flex flex-col items-center justify-center pb-1">
                             <div v-if="needsComparison || !comparison" class="w-full flex justify-center">
                                <Button
                                    icon="pi pi-search"
                                    :label="t('views.server_settings.snapshots.actions.compare')"
                                    :loading="isComparing"
                                    size="small"
                                    rounded
                                    @click="handleCompare"
                                />
                             </div>
                            <div v-else class="flex flex-col items-center gap-1 pb-2">
                                <span class="text-xs text-surface-400 uppercase tracking-widest">{{ t('views.server_activities.evolution_comparison').split(' ')[0] }}</span>
                                <i class="pi pi-arrow-right text-surface-400 text-xl"></i>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-medium text-surface-900 truncate">
                                {{ t('views.server_settings.snapshots.compare.snapshot_2') }}
                            </label>
                            <Select
                                v-model="selectedSnapshotId2"
                                :options="availableSnapshots"
                                option-label="label"
                                option-value="value"
                                :placeholder="t('views.server_settings.snapshots.compare.select_placeholder')"
                                class="w-full"
                                @change="needsComparison = true"
                            />
                        </div>
                    </div>
                </div>

                <!-- Comparison results -->
                <div v-if="comparison" class="flex flex-col gap-4">
                    <h3 class="text-lg font-semibold text-surface-900">
                        {{ t('views.server_settings.snapshots.compare.results') }}
                    </h3>

                    <!-- Stats Grid -->
                    <!-- Stats Table -->
                    <div class="border border-surface-200 rounded-xl bg-white shadow-sm">
                        <!-- Table Header -->
                        <div class="grid grid-cols-[260px_1fr_260px] md:grid-cols-[280px_1fr_280px] bg-surface-50 border-b border-surface-200 p-4">
                            <div class="text-center font-medium text-surface-600 truncate px-2">
                                {{
                                    selectedSnapshot1Data?.title ||
                                    t('views.server_settings.snapshots.compare.snapshot_1')
                                }}
                            </div>
                            <div
                                class="text-center font-medium text-surface-400 uppercase text-xs tracking-wider flex items-center justify-center"
                            >
                                {{ t('views.server_activities.evolution_comparison').split(' ')[0] }}
                            </div>
                            <div class="text-center font-medium text-surface-600 truncate px-2">
                                {{
                                    selectedSnapshot2Data?.title ||
                                    t('views.server_settings.snapshots.compare.snapshot_2')
                                }}
                            </div>
                        </div>

                        <!-- Table Body -->
                        <div class="divide-y divide-surface-100">
                            <!-- Sessions -->
                            <div
                                class="grid grid-cols-[260px_1fr_260px] md:grid-cols-[280px_1fr_280px] p-4 items-center hover:bg-surface-50/50 transition-colors"
                            >
                                <div class="text-center text-xl font-bold text-surface-900">
                                    {{ selectedSnapshot1Data?.highlights?.total_sessions ?? '-' }}
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <span
                                        class="text-xs uppercase tracking-wider text-surface-500 font-medium"
                                        >{{ t('views.home.stats.sessions') }}</span
                                    >
                                    <div class="flex items-center gap-2">
                                        <i
                                            v-if="selectedSnapshot1Data && selectedSnapshot2Data"
                                            class="pi pi-arrow-right text-surface-300 text-xs"
                                        ></i>
                                        <Badge
                                            :value="
                                                formatTrendValue(
                                                    comparison.comparison.sessions_diff,
                                                    true
                                                )
                                            "
                                            :severity="
                                                getTrendSeverity(
                                                    comparison.comparison.sessions_diff
                                                )
                                            "
                                        />
                                    </div>
                                </div>
                                <div class="text-center text-xl font-bold text-surface-900">
                                    {{ selectedSnapshot2Data?.highlights?.total_sessions ?? '-' }}
                                </div>
                            </div>

                            <!-- Members -->
                            <div
                                class="grid grid-cols-[260px_1fr_260px] md:grid-cols-[280px_1fr_280px] p-4 items-center hover:bg-surface-50/50 transition-colors"
                            >
                                <div class="text-center text-xl font-bold text-surface-900">
                                    {{ selectedSnapshot1Data?.highlights?.total_members ?? '-' }}
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <span
                                        class="text-xs uppercase tracking-wider text-surface-500 font-medium"
                                        >{{ t('views.home.stats.members') }}</span
                                    >
                                    <div class="flex items-center gap-2">
                                        <i
                                            v-if="selectedSnapshot1Data && selectedSnapshot2Data"
                                            class="pi pi-arrow-right text-surface-300 text-xs"
                                        ></i>
                                        <Badge
                                            :value="
                                                formatTrendValue(
                                                    comparison.comparison.members_diff,
                                                    true
                                                )
                                            "
                                            :severity="
                                                getTrendSeverity(comparison.comparison.members_diff)
                                            "
                                        />
                                    </div>
                                </div>
                                <div class="text-center text-xl font-bold text-surface-900">
                                    {{ selectedSnapshot2Data?.highlights?.total_members ?? '-' }}
                                </div>
                            </div>

                            <!-- Duration -->
                            <div
                                class="grid grid-cols-[260px_1fr_260px] md:grid-cols-[280px_1fr_280px] p-4 items-center hover:bg-surface-50/50 transition-colors"
                            >
                                <div class="text-center text-xl font-bold text-surface-900">
                                    {{
                                        (selectedSnapshot1Data?.highlights?.total_duration
                                            ? (
                                                  selectedSnapshot1Data?.highlights
                                                      ?.total_duration / 3600
                                              ).toFixed(1)
                                            : '-') + 'h'
                                    }}
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <span
                                        class="text-xs uppercase tracking-wider text-surface-500 font-medium"
                                        >{{ t('views.server_stats.total_duration') }}</span
                                    >
                                    <div class="flex items-center gap-2">
                                        <i
                                            v-if="selectedSnapshot1Data && selectedSnapshot2Data"
                                            class="pi pi-arrow-right text-surface-300 text-xs"
                                        ></i>
                                        <Badge
                                            :value="
                                                formatTrendValue(
                                                    comparison.comparison.duration_diff,
                                                    true
                                                )
                                            "
                                            :severity="
                                                getTrendSeverity(
                                                    comparison.comparison.duration_diff
                                                )
                                            "
                                        />
                                    </div>
                                </div>
                                <div class="text-center text-xl font-bold text-surface-900">
                                    {{
                                        (selectedSnapshot2Data?.highlights?.total_duration
                                            ? (
                                                  selectedSnapshot2Data?.highlights
                                                      ?.total_duration / 3600
                                              ).toFixed(1)
                                            : '-') + 'h'
                                    }}
                                </div>
                            </div>

                            <!-- Engagement -->
                            <div
                                class="grid grid-cols-[260px_1fr_260px] md:grid-cols-[280px_1fr_280px] p-4 items-center hover:bg-surface-50/50 transition-colors"
                            >
                                <div class="text-center text-xl font-bold text-surface-900">
                                    {{
                                        selectedSnapshot1Data?.highlights?.engagement_score?.toFixed(
                                            1
                                        ) ?? '-'
                                    }}
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <span
                                        class="text-xs uppercase tracking-wider text-surface-500 font-medium"
                                        >{{ t('views.server_stats.engagement_score') }}</span
                                    >
                                    <div class="flex items-center gap-2">
                                        <i
                                            v-if="selectedSnapshot1Data && selectedSnapshot2Data"
                                            class="pi pi-arrow-right text-surface-300 text-xs"
                                        ></i>
                                        <Badge
                                            :value="
                                                formatTrendValue(
                                                    comparison.comparison.engagement_diff,
                                                    true
                                                )
                                            "
                                            :severity="
                                                getTrendSeverity(
                                                    comparison.comparison.engagement_diff
                                                )
                                            "
                                        />
                                    </div>
                                </div>
                                <div class="text-center text-xl font-bold text-surface-900">
                                    {{
                                        selectedSnapshot2Data?.highlights?.engagement_score?.toFixed(
                                            1
                                        ) ?? '-'
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Top items changes -->
                    <!-- Top items changes -->
                    <div class="flex flex-col gap-4 mt-2">
                        <!-- Top Members Support -->
                        <div
                            class="border border-surface-200 rounded-xl bg-white shadow-sm"
                        >
                            <div
                                class="bg-surface-50 border-b border-surface-200 p-3 text-center font-semibold text-surface-700"
                            >
                                {{
                                    t('views.server_settings.snapshots.compare.top_members_changes')
                                }}
                            </div>
                            <div
                                class="grid grid-cols-[260px_1fr_260px] md:grid-cols-[280px_1fr_280px] p-4 items-center"
                            >
                                <div class="text-center">
                                    <span class="block text-xl font-bold text-red-600">
                                        -{{ comparison.top_members_changes.dropped_entries.length }}
                                    </span>
                                    <span
                                        class="text-xs text-surface-500 uppercase tracking-wider"
                                        >{{
                                            t(
                                                'views.server_settings.snapshots.compare.dropped_entries'
                                            )
                                        }}</span
                                    >
                                </div>

                                <div class="flex flex-col items-center justify-center">
                                    <span class="text-xl font-bold text-surface-900">
                                        {{ comparison.top_members_changes.maintained }}
                                    </span>
                                    <span
                                        class="text-xs text-surface-500 uppercase tracking-wider"
                                        >{{
                                            t('views.server_settings.snapshots.compare.maintained')
                                        }}</span
                                    >
                                </div>

                                <div class="text-center">
                                    <span class="block text-xl font-bold text-green-600">
                                        +{{ comparison.top_members_changes.new_entries.length }}
                                    </span>
                                    <span
                                        class="text-xs text-surface-500 uppercase tracking-wider"
                                        >{{
                                            t('views.server_settings.snapshots.compare.new_entries')
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Top Activities Changes -->
                        <div
                            class="border border-surface-200 rounded-xl bg-white shadow-sm"
                        >
                            <div
                                class="bg-surface-50 border-b border-surface-200 p-3 text-center font-semibold text-surface-700"
                            >
                                {{
                                    t(
                                        'views.server_settings.snapshots.compare.top_activities_changes'
                                    )
                                }}
                            </div>
                            <div
                                class="grid grid-cols-[260px_1fr_260px] md:grid-cols-[280px_1fr_280px] p-4 items-center"
                            >
                                <div class="text-center">
                                    <span class="block text-xl font-bold text-red-600">
                                        -{{
                                            comparison.top_activities_changes.dropped_entries.length
                                        }}
                                    </span>
                                    <span
                                        class="text-xs text-surface-500 uppercase tracking-wider"
                                        >{{
                                            t(
                                                'views.server_settings.snapshots.compare.dropped_entries'
                                            )
                                        }}</span
                                    >
                                </div>

                                <div class="flex flex-col items-center justify-center">
                                    <span class="text-xl font-bold text-surface-900">
                                        {{ comparison.top_activities_changes.maintained }}
                                    </span>
                                    <span
                                        class="text-xs text-surface-500 uppercase tracking-wider"
                                        >{{
                                            t('views.server_settings.snapshots.compare.maintained')
                                        }}</span
                                    >
                                </div>

                                <div class="text-center">
                                    <span class="block text-xl font-bold text-green-600">
                                        +{{ comparison.top_activities_changes.new_entries.length }}
                                    </span>
                                    <span
                                        class="text-xs text-surface-500 uppercase tracking-wider"
                                        >{{
                                            t('views.server_settings.snapshots.compare.new_entries')
                                        }}</span
                                    >
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
