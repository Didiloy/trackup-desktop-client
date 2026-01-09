<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ISnapshot } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Button from 'primevue/button'
import Divider from 'primevue/divider'

const props = defineProps<{
    visible: boolean
    snapshot: ISnapshot | null
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

const { t, d } = useI18n()

const safeType = computed(() => {
    return props.snapshot?.type || 'custom'
})

const typeLabel = computed(() => {
    return t(`views.server_settings.snapshots.types.${safeType.value}`)
})

const formattedDate = computed(() => {
    if (!props.snapshot) return ''
    return d(new Date(props.snapshot.created_at), 'short')
})
</script>

<template>
    <AppDialog
        :model-value="visible"
        style-class="w-full max-w-6xl"
        @update:model-value="emit('update:visible', $event)"
    >
        <template #header>
            <div v-if="snapshot" class="flex flex-col gap-1">
                <div class="flex items-center gap-3">
                    <h2 class="text-xl font-bold text-surface-900">
                        {{ t('views.server_settings.snapshots.detail.title') }}
                    </h2>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                        {{ typeLabel }}
                    </span>
                </div>
                <p class="text-sm text-surface-500">
                    {{ formattedDate }}
                </p>
            </div>
        </template>

        <div v-if="snapshot" class="flex flex-col gap-6 p-6 max-h-[70vh] overflow-y-auto">
            <!-- Description -->
            <div v-if="snapshot.description" class="bg-surface-50 p-4 rounded-xl">
                <p class="text-surface-700">{{ snapshot.description }}</p>
            </div>

            <!-- Server Stats -->
            <div v-if="snapshot.data.server_stats" class="flex flex-col gap-3">
                <h3 class="text-lg font-semibold text-surface-900">
                    {{ t('views.server_settings.snapshots.detail.server_stats') }}
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-surface-50 p-4 rounded-xl">
                        <p class="text-xs text-surface-500 mb-1">{{ t('views.server_stats.total_sessions') }}</p>
                        <p class="text-xl font-bold text-surface-900">{{ snapshot.data.server_stats.total_sessions }}</p>
                    </div>
                    <div class="bg-surface-50 p-4 rounded-xl">
                        <p class="text-xs text-surface-500 mb-1">{{ t('views.server_stats.total_members') }}</p>
                        <p class="text-xl font-bold text-surface-900">{{ snapshot.data.server_stats.total_members }}</p>
                    </div>
                    <div class="bg-surface-50 p-4 rounded-xl">
                        <p class="text-xs text-surface-500 mb-1">{{ t('views.server_stats.active_members') }}</p>
                        <p class="text-xl font-bold text-surface-900">{{ snapshot.data.server_stats.active_members }}</p>
                    </div>
                    <div class="bg-surface-50 p-4 rounded-xl">
                        <p class="text-xs text-surface-500 mb-1">{{ t('views.server_stats.engagement_score') }}</p>
                        <p class="text-xl font-bold text-surface-900">{{ Math.round(snapshot.data.server_stats.engagement_score || 0) }}</p>
                    </div>
                </div>
            </div>

            <Divider />

            <!-- Top Members -->
            <div v-if="snapshot.data.top_members && snapshot.data.top_members.length > 0" class="flex flex-col gap-3">
                <h3 class="text-lg font-semibold text-surface-900">
                    {{ t('views.server_settings.snapshots.detail.top_members') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                        v-for="member in snapshot.data.top_members.slice(0, 10)"
                        :key="member.member_id"
                        class="flex items-center justify-between bg-surface-50 p-3 rounded-xl"
                    >
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full font-bold text-sm">
                                {{ member.rank }}
                            </span>
                            <span class="font-medium text-surface-900">{{ member.email }}</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-surface-500">{{ member.total_sessions }} sessions</p>
                            <p class="text-xs text-surface-500">{{ Math.floor(member.total_duration / 60) }}min</p>
                        </div>
                    </div>
                </div>
            </div>

            <Divider />

            <!-- Top Activities -->
            <div v-if="snapshot.data.top_activities && snapshot.data.top_activities.length > 0" class="flex flex-col gap-3">
                <h3 class="text-lg font-semibold text-surface-900">
                    {{ t('views.server_settings.snapshots.detail.top_activities') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                        v-for="activity in snapshot.data.top_activities.slice(0, 10)"
                        :key="activity.activity_id"
                        class="flex items-center justify-between bg-surface-50 p-3 rounded-xl"
                    >
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded-full font-bold text-sm">
                                {{ activity.rank }}
                            </span>
                            <span class="font-medium text-surface-900">{{ activity.name }}</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-surface-500">{{ activity.total_sessions }} sessions</p>
                            <p class="text-xs text-surface-500">Score: {{ Math.round(activity.popularity_score || 0) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trends -->
            <div v-if="snapshot.data.trends" class="flex flex-col gap-3">
                <Divider />
                <h3 class="text-lg font-semibold text-surface-900">
                    {{ t('views.server_settings.snapshots.detail.trends') }}
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-surface-50 p-4 rounded-xl">
                        <p class="text-xs text-surface-500 mb-1">{{ t('views.server_settings.snapshots.compare.sessions_diff') }}</p>
                        <p :class="`text-xl font-bold ${(snapshot.data.trends.sessions_change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`">
                            {{ (snapshot.data.trends.sessions_change ?? 0) >= 0 ? '+' : '' }}{{ snapshot.data.trends.sessions_change ?? 0 }}
                        </p>
                    </div>
                    <div class="bg-surface-50 p-4 rounded-xl">
                        <p class="text-xs text-surface-500 mb-1">{{ t('views.server_settings.snapshots.compare.members_diff') }}</p>
                        <p :class="`text-xl font-bold ${(snapshot.data.trends.members_change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`">
                            {{ (snapshot.data.trends.members_change ?? 0) >= 0 ? '+' : '' }}{{ snapshot.data.trends.members_change ?? 0 }}
                        </p>
                    </div>
                    <div class="bg-surface-50 p-4 rounded-xl">
                        <p class="text-xs text-surface-500 mb-1">{{ t('views.server_settings.snapshots.compare.engagement_diff') }}</p>
                        <p :class="`text-xl font-bold ${(snapshot.data.trends.engagement_change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`">
                            {{ (snapshot.data.trends.engagement_change ?? 0) >= 0 ? '+' : '' }}{{ (snapshot.data.trends.engagement_change ?? 0).toFixed(1) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 p-6">
                <Button
                    :label="t('common.actions.close')"
                    @click="emit('update:visible', false)"
                />
            </div>
        </template>
    </AppDialog>
</template>
