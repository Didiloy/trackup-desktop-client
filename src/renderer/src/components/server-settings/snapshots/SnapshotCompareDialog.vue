<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStatsStore } from '@/stores/snapshot-stats'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps<{
    visible: boolean
    serverId: string
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

const { t, d } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStatsStore()

const snapshot1Id = ref<string | null>(null)
const snapshot2Id = ref<string | null>(null)
const isComparing = ref(false)
const availableSnapshots = ref<any[]>([])

onMounted(async () => {
    // Fetch snapshots for selection
    await snapshotStore.fetchSnapshots(props.serverId, { page: 1, limit: 50 })
    availableSnapshots.value = snapshotStore.getSnapshots.map((s) => ({
        label: `${t(`views.server_settings.snapshots.types.${s.type}`)} - ${d(new Date(s.created_at), 'short')}`,
        value: s.id
    }))
})

const handleCompare = async () => {
    if (!snapshot1Id.value || !snapshot2Id.value) {
        toast.add({
            severity: 'warn',
            summary: t('messages.warning.title'),
            detail: t('views.server_settings.snapshots.compare.select_placeholder'),
            life: 3000
        })
        return
    }

    isComparing.value = true
    try {
        const res = await snapshotStore.compareSnapshots(
            props.serverId,
            snapshot1Id.value,
            snapshot2Id.value
        )

        if (res.error) {
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: t('views.server_settings.snapshots.compare.error'),
                life: 3000
            })
        }
    } finally {
        isComparing.value = false
    }
}

const comparisonResult = computed(() => snapshotStore.getComparison)

const formatDiff = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
}

const getDiffColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
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
            <!-- Snapshot selectors -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-surface-900">
                        {{ t('views.server_settings.snapshots.compare.snapshot_1') }}
                    </label>
                    <Select
                        v-model="snapshot1Id"
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
                        v-model="snapshot2Id"
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
            <div v-if="comparisonResult" class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-surface-900">
                    {{ t('views.server_settings.snapshots.compare.results') }}
                </h3>

                <!-- Stats differences -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="p-4 rounded-xl bg-surface-50 ring-1 ring-surface-200/60">
                        <p class="text-sm text-surface-500 mb-1">
                            {{ t('views.server_settings.snapshots.compare.sessions_diff') }}
                        </p>
                        <p :class="`text-xl font-bold ${getDiffColor(comparisonResult.comparison.sessions_diff)}`">
                            {{ formatDiff(comparisonResult.comparison.sessions_diff) }}
                        </p>
                    </div>

                    <div class="p-4 rounded-xl bg-surface-50 ring-1 ring-surface-200/60">
                        <p class="text-sm text-surface-500 mb-1">
                            {{ t('views.server_settings.snapshots.compare.members_diff') }}
                        </p>
                        <p :class="`text-xl font-bold ${getDiffColor(comparisonResult.comparison.members_diff)}`">
                            {{ formatDiff(comparisonResult.comparison.members_diff) }}
                        </p>
                    </div>

                    <div class="p-4 rounded-xl bg-surface-50 ring-1 ring-surface-200/60">
                        <p class="text-sm text-surface-500 mb-1">
                            {{ t('views.server_settings.snapshots.compare.duration_diff') }}
                        </p>
                        <p :class="`text-xl font-bold ${getDiffColor(comparisonResult.comparison.duration_diff)}`">
                            {{ formatDiff(comparisonResult.comparison.duration_diff) }}
                        </p>
                    </div>

                    <div class="p-4 rounded-xl bg-surface-50 ring-1 ring-surface-200/60">
                        <p class="text-sm text-surface-500 mb-1">
                            {{ t('views.server_settings.snapshots.compare.engagement_diff') }}
                        </p>
                        <p :class="`text-xl font-bold ${getDiffColor(comparisonResult.comparison.engagement_diff)}`">
                            {{ formatDiff(comparisonResult.comparison.engagement_diff) }}
                        </p>
                    </div>
                </div>

                <!-- Top items changes -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 rounded-xl bg-surface-50 ring-1 ring-surface-200/60">
                        <h4 class="font-semibold text-surface-900 mb-3">
                            {{ t('views.server_settings.snapshots.compare.top_members_changes') }}
                        </h4>
                        <div class="flex gap-4 text-sm">
                            <div>
                                <span class="text-surface-500">{{ t('views.server_settings.snapshots.compare.new_entries') }}:</span>
                                <span class="font-bold text-green-600 ml-2">{{ comparisonResult.top_members_changes.new_entries.length }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500">{{ t('views.server_settings.snapshots.compare.dropped_entries') }}:</span>
                                <span class="font-bold text-red-600 ml-2">{{ comparisonResult.top_members_changes.dropped_entries.length }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500">{{ t('views.server_settings.snapshots.compare.maintained') }}:</span>
                                <span class="font-bold text-surface-900 ml-2">{{ comparisonResult.top_members_changes.maintained }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 rounded-xl bg-surface-50 ring-1 ring-surface-200/60">
                        <h4 class="font-semibold text-surface-900 mb-3">
                            {{ t('views.server_settings.snapshots.compare.top_activities_changes') }}
                        </h4>
                        <div class="flex gap-4 text-sm">
                            <div>
                                <span class="text-surface-500">{{ t('views.server_settings.snapshots.compare.new_entries') }}:</span>
                                <span class="font-bold text-green-600 ml-2">{{ comparisonResult.top_activities_changes.new_entries.length }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500">{{ t('views.server_settings.snapshots.compare.dropped_entries') }}:</span>
                                <span class="font-bold text-red-600 ml-2">{{ comparisonResult.top_activities_changes.dropped_entries.length }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500">{{ t('views.server_settings.snapshots.compare.maintained') }}:</span>
                                <span class="font-bold text-surface-900 ml-2">{{ comparisonResult.top_activities_changes.maintained }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading state for comparison -->
            <div v-else-if="isComparing" class="flex justify-center items-center py-8">
                <ProgressSpinner style="width: 50px; height: 50px" />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 p-6">
                <Button
                    :label="t('common.actions.close')"
                    severity="secondary"
                    outlined
                    @click="emit('update:visible', false)"
                />
            </div>
        </template>
    </AppDialog>
</template>
