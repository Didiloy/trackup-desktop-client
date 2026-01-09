<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ISnapshot } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

import { useSnapshot } from '@/composables/snapshots/useSnapshot'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import { formatDate } from '@/utils'
import Icon from '@/components/common/icons/Icon.vue'
import SnapshotIcon from '@/components/common/icons/SnapshotIcon.vue'

interface Props {
    visible: boolean
    snapshot: ISnapshot | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

const { t, d } = useI18n()

const {
    getTypeLabel,
    downloadSnapshotWithFeedback,
    getSnapshotDisplayName,
    formatTrendValue,
    getTrendSeverity
} = useSnapshot()

const isDownloading = ref(false)

const snapshotType = computed(() => props.snapshot?.snapshot_type ?? 'custom')

const typeLabel = computed(() => getTypeLabel(snapshotType.value))

const displayTitle = computed(() => {
    return getSnapshotDisplayName(props.snapshot)
})

const handleDownload = async (): Promise<void> => {
    if (!props.snapshot) return

    isDownloading.value = true
    try {
        await downloadSnapshotWithFeedback(props.snapshot.server_id, props.snapshot.id)
    } finally {
        isDownloading.value = false
    }
}
</script>

<template>
    <AppDialog
        :model-value="visible"
        style-class="w-full max-w-5xl"
        @update:model-value="emit('update:visible', $event)"
    >
        <template #header>
            <div v-if="snapshot" class="flex flex-col gap-1 w-full pr-8">
                <div class="flex gap-4 mb-1">
                    <SnapshotIcon class="mt-3 text-primary-600" />
                    <h2
                        class="text-2xl font-bold text-surface-900 leading-tight flex items-center gap-2"
                    >
                        {{ displayTitle }}
                    </h2>
                    <Badge
                        :value="typeLabel"
                        :severity="snapshotType === 'milestone' ? 'danger' : 'secondary'"
                        class="uppercase tracking-wider font-bold mt-2"
                    />
                    <span class="text-surface-500 text-sm font-medium mt-2">{{
                        formatDate(snapshot.snapshot_date)
                    }}</span>
                </div>
            </div>
        </template>

        <div v-if="snapshot" class="flex flex-col gap-8 p-1">
            <!-- Description -->
            <div v-if="snapshot.description" class="bg-surface-50 rounded-xl">
                <div class="flex items-center gap-2 mb-2 text-surface-900 font-semibold">
                    <i class="pi pi-align-left text-primary-500"></i>
                    <h3>{{ t('views.server_settings.snapshots.detail.description') }}</h3>
                </div>
                <p class="text-surface-700 leading-relaxed">{{ snapshot.description }}</p>
            </div>

            <!-- Server Stats -->
            <div v-if="snapshot.data.server_stats">
                <h3 class="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <i class="pi pi-chart-pie text-primary-500"></i>
                    {{ t('views.server_settings.snapshots.detail.server_stats') }}
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        class="stat-card bg-surface-0 border border-surface-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <span
                                class="text-sm font-medium text-surface-500 uppercase tracking-wide"
                            >
                                {{ t('views.server_stats.total_sessions') }}
                            </span>
                            <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <i class="pi pi-desktop text-lg"></i>
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-surface-900">
                            {{ snapshot.data.server_stats.total_sessions }}
                        </p>
                    </div>

                    <div
                        class="stat-card bg-surface-0 border border-surface-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <span
                                class="text-sm font-medium text-surface-500 uppercase tracking-wide"
                            >
                                {{ t('views.server_stats.total_members') }}
                            </span>
                            <div class="p-2 bg-green-50 text-green-600 rounded-lg">
                                <i class="pi pi-users text-lg"></i>
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-surface-900">
                            {{ snapshot.data.server_stats.total_members }}
                        </p>
                    </div>

                    <div
                        class="stat-card bg-surface-0 border border-surface-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <span
                                class="text-sm font-medium text-surface-500 uppercase tracking-wide"
                            >
                                {{ t('views.server_stats.active_members') }}
                            </span>
                            <div class="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <i class="pi pi-star text-lg"></i>
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-surface-900">
                            {{ snapshot.data.server_stats.active_members }}
                        </p>
                    </div>

                    <div
                        class="stat-card bg-surface-0 border border-surface-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <span
                                class="text-sm font-medium text-surface-500 uppercase tracking-wide"
                            >
                                {{ t('views.server_stats.engagement_score') }}
                            </span>
                            <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <i class="pi pi-chart-line text-lg"></i>
                            </div>
                        </div>
                        <div class="flex items-baseline gap-1">
                            <p class="text-3xl font-bold text-surface-900">
                                {{ Math.round(snapshot.data.server_stats.engagement_score || 0) }}
                            </p>
                            <span class="text-surface-400 font-medium">/100</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Top Members -->
                <div v-if="snapshot.data.top_members?.length" class="flex flex-col gap-3">
                    <h3 class="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <i class="pi pi-trophy text-yellow-500"></i>
                        {{ t('views.server_settings.snapshots.detail.top_members') }}
                    </h3>
                    <div class="flex flex-col gap-2">
                        <div
                            v-for="member in snapshot.data.top_members.slice(0, 5)"
                            :key="member.member_id"
                            class="flex items-center justify-between p-3 rounded-xl bg-surface-0 border border-surface-200 hover:border-primary-300 transition-colors shadow-sm"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-inner"
                                    :class="{
                                        'bg-yellow-100 text-yellow-700': (member.rank || 0) === 1,
                                        'bg-surface-100 text-surface-600': (member.rank || 0) > 1
                                    }"
                                >
                                    {{ member.rank }}
                                </div>
                                <span class="font-medium text-surface-900">{{ member.email }}</span>
                            </div>
                            <div class="text-right flex flex-col items-end">
                                <span class="text-sm font-bold text-primary-600">
                                    {{ member.total_sessions }}
                                    {{ t('views.server_settings.snapshots.detail.sessions') }}
                                </span>
                                <span class="text-xs text-surface-500">
                                    {{ Math.floor(member.total_duration / 60) }}min
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Activities -->
                <div v-if="snapshot.data.top_activities?.length" class="flex flex-col gap-3">
                    <h3 class="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <i class="pi pi-bolt text-purple-500"></i>
                        {{ t('views.server_settings.snapshots.detail.top_activities') }}
                    </h3>
                    <div class="flex flex-col gap-2">
                        <div
                            v-for="activity in snapshot.data.top_activities.slice(0, 5)"
                            :key="activity.activity_id"
                            class="flex items-center justify-between p-3 rounded-xl bg-surface-0 border border-surface-200 hover:border-purple-300 transition-colors shadow-sm"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-inner"
                                    :class="{
                                        'bg-purple-100 text-purple-700': (activity.rank || 0) === 1,
                                        'bg-surface-100 text-surface-600': (activity.rank || 0) > 1
                                    }"
                                >
                                    {{ activity.rank }}
                                </div>
                                <span class="font-medium text-surface-900">{{
                                    activity.name
                                }}</span>
                            </div>
                            <div class="text-right flex flex-col items-end">
                                <span class="text-sm font-bold text-purple-600">
                                    {{ activity.total_sessions }}
                                    {{ t('views.server_settings.snapshots.detail.sessions') }}
                                </span>
                                <div class="flex items-center gap-1 text-xs text-surface-500">
                                    <i
                                        class="pi pi-star-fill text-orange-400"
                                        style="font-size: 0.7rem"
                                    ></i>
                                    {{ Math.round(activity.popularity_score || 0) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div
                class="flex justify-end gap-3 p-4 border-t border-surface-200 bg-surface-50 -mx-6 -mb-6 mt-6 rounded-b-lg"
            >
                <Button
                    :label="t('views.server_settings.snapshots.actions.download')"
                    icon="pi pi-download"
                    severity="secondary"
                    outlined
                    :loading="isDownloading"
                    @click="handleDownload"
                />
                <Button :label="t('common.actions.close')" @click="emit('update:visible', false)" />
            </div>
        </template>
    </AppDialog>
</template>

<style scoped>
/* No specific styles needed anymore with utility classes, but keeping block for safety or future needs */
</style>
