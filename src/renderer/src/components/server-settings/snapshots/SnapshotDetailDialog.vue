<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import type { ISnapshot } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'
import { useSnapshotStatsCRUD } from '@/composables/snapshots/useSnapshotStatsCRUD'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Badge from 'primevue/badge'
import Icon from '@/components/common/icons/Icon.vue'

const props = defineProps<{
    visible: boolean
    snapshot: ISnapshot | null
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

const { t, d } = useI18n()
const toast = useToast()
const { getSnapshotStatsById } = useSnapshotStatsCRUD()
const isDownloading = ref(false)

const safeType = computed(() => {
    return props.snapshot?.type || 'custom'
})

const typeLabel = computed(() => {
    return t(`views.server_settings.snapshots.types.${safeType.value}`)
})

const formattedDate = computed(() => {
    if (!props.snapshot) return ''
    return d(new Date(props.snapshot.created_at), 'medium')
})

const handleDownload = async () => {
    if (!props.snapshot) return
    
    isDownloading.value = true
    try {
        const res = await getSnapshotStatsById(props.snapshot.server_id, props.snapshot.id)
        if (res.error || !res.data) {
            throw new Error('Failed to fetch snapshot data')
        }

        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `snapshot-${res.data.type}-${new Date(res.data.snapshot_date).toLocaleDateString()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.add({
            severity: 'success',
            summary: t('messages.success.title'),
            detail: t('views.server_settings.snapshots.download.success'),
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: t('views.server_settings.snapshots.download.error'),
            life: 3000
        })
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
            <div v-if="snapshot" class="flex flex-col gap-2 w-full pr-8">
                <div class="flex items-center gap-3">
                    <div :class="`p-2 rounded-lg bg-primary-50 text-primary-600`">
                        <Icon icon="mdi:camera" class="text-xl" />
                    </div>
                    <div class="flex flex-col">
                        <h2 class="text-xl font-bold text-surface-900 leading-tight">
                            {{ snapshot.title || typeLabel }}
                        </h2>
                        <div class="flex items-center gap-2 text-sm text-surface-500">
                            <span>{{ formattedDate }}</span>
                            <span>•</span>
                            <Badge 
                                :value="typeLabel" 
                                :severity="safeType === 'milestone' ? 'danger' : 'info'" 
                                size="small"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div v-if="snapshot" class="flex flex-col gap-8 p-1">
            <!-- Description -->
            <div v-if="snapshot.description" class="bg-surface-50 p-4 rounded-xl border border-surface-100">
                <div class="flex items-center gap-2 mb-2 text-surface-900 font-semibold">
                    <Icon icon="mdi:text-box-outline" class="text-lg" />
                    <h3>Description</h3>
                </div>
                <p class="text-surface-600 leading-relaxed">{{ snapshot.description }}</p>
            </div>

            <!-- Server Stats -->
            <div v-if="snapshot.data.server_stats">
                <div class="flex items-center gap-2 mb-4">
                    <Icon icon="mdi:chart-bar" class="text-xl text-primary-600" />
                    <h3 class="text-lg font-bold text-surface-900">
                        {{ t('views.server_settings.snapshots.detail.server_stats') }}
                    </h3>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="stat-card bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                        <p class="text-xs font-semibold text-blue-600 uppercase mb-1">{{ t('views.server_stats.total_sessions') }}</p>
                        <p class="text-2xl font-bold text-surface-900">{{ snapshot.data.server_stats.total_sessions }}</p>
                    </div>
                    <div class="stat-card bg-green-50/50 border border-green-100 p-4 rounded-xl">
                        <p class="text-xs font-semibold text-green-600 uppercase mb-1">{{ t('views.server_stats.total_members') }}</p>
                        <p class="text-2xl font-bold text-surface-900">{{ snapshot.data.server_stats.total_members }}</p>
                    </div>
                    <div class="stat-card bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
                        <p class="text-xs font-semibold text-orange-600 uppercase mb-1">{{ t('views.server_stats.active_members') }}</p>
                        <p class="text-2xl font-bold text-surface-900">{{ snapshot.data.server_stats.active_members }}</p>
                    </div>
                    <div class="stat-card bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
                        <p class="text-xs font-semibold text-purple-600 uppercase mb-1">{{ t('views.server_stats.engagement_score') }}</p>
                        <div class="flex items-baseline gap-1">
                            <p class="text-2xl font-bold text-surface-900">{{ Math.round(snapshot.data.server_stats.engagement_score || 0) }}</p>
                            <span class="text-sm text-surface-500">/100</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trends -->
            <div v-if="snapshot.data.trends?.sessions_change !== undefined">
                <div class="flex items-center gap-2 mb-4">
                    <Icon icon="mdi:trending-up" class="text-xl text-primary-600" />
                    <h3 class="text-lg font-bold text-surface-900">
                        {{ t('views.server_settings.snapshots.detail.trends') }}
                    </h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 rounded-xl border border-surface-200 bg-surface-0">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-sm font-medium text-surface-500">{{ t('views.server_settings.snapshots.compare.sessions_diff') }}</span>
                            <Badge 
                                :value="(snapshot.data.trends.sessions_change ?? 0) >= 0 ? '+' + (snapshot.data.trends.sessions_change ?? 0) : snapshot.data.trends.sessions_change" 
                                :severity="(snapshot.data.trends.sessions_change ?? 0) >= 0 ? 'success' : 'danger'"
                            />
                        </div>
                    </div>
                    <div class="p-4 rounded-xl border border-surface-200 bg-surface-0">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-sm font-medium text-surface-500">{{ t('views.server_settings.snapshots.compare.members_diff') }}</span>
                            <Badge 
                                :value="(snapshot.data.trends.members_change ?? 0) >= 0 ? '+' + (snapshot.data.trends.members_change ?? 0) : snapshot.data.trends.members_change" 
                                :severity="(snapshot.data.trends.members_change ?? 0) >= 0 ? 'success' : 'danger'"
                            />
                        </div>
                    </div>
                    <div class="p-4 rounded-xl border border-surface-200 bg-surface-0">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-sm font-medium text-surface-500">{{ t('views.server_settings.snapshots.compare.engagement_diff') }}</span>
                            <Badge 
                                :value="(snapshot.data.trends.engagement_change ?? 0) >= 0 ? '+' + (snapshot.data.trends.engagement_change ?? 0).toFixed(1) : (snapshot.data.trends.engagement_change ?? 0).toFixed(1)" 
                                :severity="(snapshot.data.trends.engagement_change ?? 0) >= 0 ? 'success' : 'danger'"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Top Members -->
                <div v-if="snapshot.data.top_members?.length">
                    <div class="flex items-center gap-2 mb-4">
                        <Icon icon="mdi:trophy" class="text-xl text-yellow-500" />
                        <h3 class="text-lg font-bold text-surface-900">
                            {{ t('views.server_settings.snapshots.detail.top_members') }}
                        </h3>
                    </div>
                    <div class="space-y-2">
                        <div
                            v-for="member in snapshot.data.top_members.slice(0, 5)"
                            :key="member.member_id"
                            class="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 border border-transparent hover:border-surface-200 transition-colors"
                        >
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-100 font-bold text-surface-600 text-sm">
                                    {{ member.rank }}
                                </div>
                                <span class="font-medium text-surface-900">{{ member.email }}</span>
                            </div>
                            <div class="text-right flex flex-col items-end">
                                <span class="text-sm font-semibold text-surface-900">{{ member.total_sessions }} sessions</span>
                                <span class="text-xs text-surface-500">{{ Math.floor(member.total_duration / 60) }}min</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Activities -->
                <div v-if="snapshot.data.top_activities?.length">
                    <div class="flex items-center gap-2 mb-4">
                        <Icon icon="mdi:controller" class="text-xl text-purple-500" />
                        <h3 class="text-lg font-bold text-surface-900">
                            {{ t('views.server_settings.snapshots.detail.top_activities') }}
                        </h3>
                    </div>
                    <div class="space-y-2">
                        <div
                            v-for="activity in snapshot.data.top_activities.slice(0, 5)"
                            :key="activity.activity_id"
                            class="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 border border-transparent hover:border-surface-200 transition-colors"
                        >
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-100 font-bold text-surface-600 text-sm">
                                    {{ activity.rank }}
                                </div>
                                <span class="font-medium text-surface-900">{{ activity.name }}</span>
                            </div>
                            <div class="text-right flex flex-col items-end">
                                <span class="text-sm font-semibold text-surface-900">{{ activity.total_sessions }} sessions</span>
                                <span class="text-xs text-surface-500">Popularity: {{ Math.round(activity.popularity_score || 0) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 p-4 border-t border-surface-200 bg-surface-50/50 -mx-6 -mb-6 mt-6 rounded-b-xl">
                 <Button
                    :label="t('views.server_settings.snapshots.actions.download')"
                    icon="mdi:download"
                    severity="secondary"
                    outlined
                    :loading="isDownloading"
                    @click="handleDownload"
                />
                <Button
                    :label="t('common.actions.close')"
                    @click="emit('update:visible', false)"
                />
            </div>
        </template>
    </AppDialog>
</template>

<style scoped>
.stat-card {
    transition: transform 0.2s;
}
.stat-card:hover {
    transform: translateY(-2px);
}
</style>
