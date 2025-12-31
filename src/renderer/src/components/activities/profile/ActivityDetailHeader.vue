<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStore } from '@/stores/server'

const props = defineProps<{
    activity: IActivity | null
    stats: IActivityStatsDetails | null
}>()

const emit = defineEmits<{
    (e: 'edit'): void
    (e: 'delete'): void
    (e: 'createSession'): void
}>()

const { t } = useI18n()
const server_store = useServerStore()

const canDelete = computed(() => {
    if (!props.activity) {
        return false
    }
    return server_store.isOwnership === true
})

const summaryMetrics = computed(() => {
    if (!props.stats) {
        return []
    }
    return [
        {
            label: t('views.activity.card.sessions'),
            value: props.stats.total_sessions.toLocaleString()
        },
        {
            label: t('views.activity.card.duration'),
            value: `${formatMinutesToLabel(props.stats.total_duration)}`
        },
        {
            label: t('views.activity.card.unique_participants'),
            value: props.stats.unique_participants.toLocaleString()
        }
    ]
})
</script>

<template>
    <div
        class="relative rounded-3xl p-6 mb-6 overflow-hidden ring-1 ring-surface-200/40 bg-linear-to-br from-primary-500/10 via-secondary-500/5 to-surface-0"
    >
        <div
            v-if="activity?.banner"
            class="absolute inset-0 transition-opacity duration-500 rounded-2xl bg-cover bg-center bg-no-repeat"
            :style="{ backgroundImage: `url(${activity?.banner})` }"
        ></div>
        <div
            v-if="activity?.banner"
            class="absolute inset-0 bg-linear-to-r from-black/65 via-black/35 to-black/65"
        ></div>

        <div class="relative z-10 flex flex-wrap items-center gap-6">
            <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold bg-surface-50 text-primary-600 ring-1 ring-white/50 shadow-lg overflow-hidden"
            >
                <img
                    v-if="activity?.logo"
                    :src="activity.logo"
                    :alt="activity.name"
                    class="w-full h-full object-cover"
                />
                <span v-else>{{ activity?.name?.charAt(0)?.toUpperCase() }}</span>
            </div>

            <div class="flex-1 min-w-[220px]">
                <h1
                    class="text-3xl font-bold text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                >
                    {{ activity?.name || t('common.fields.none') }}
                </h1>
                <p
                    class="text-sm mt-1 max-w-2xl line-clamp-2 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                    v-tooltip.left="activity?.description"
                >
                    {{ activity?.description || t('common.fields.description') }}
                </p>
            </div>

            <div class="flex flex-wrap gap-3">
                <Button
                    icon="pi pi-plus"
                    :label="t('views.activity.create_session')"
                    size="small"
                    :pt="{
                        label: { class: 'text-surface-100' },
                        icon: { class: 'text-surface-100' }
                    }"
                    @click="emit('createSession')"
                />
                <Button
                    icon="pi pi-pencil"
                    :label="t('common.actions.edit')"
                    severity="help"
                    class="shadow"
                    :pt="{
                        label: { class: 'text-surface-100' },
                        icon: { class: 'text-surface-100' }
                    }"
                    @click="emit('edit')"
                />
                <Button
                    v-if="canDelete"
                    icon="pi pi-trash"
                    :label="t('common.actions.delete')"
                    severity="danger"
                    class="shadow"
                    :pt="{
                        label: { class: 'text-surface-100' },
                        icon: { class: 'text-surface-100' }
                    }"
                    @click="emit('delete')"
                />
            </div>
        </div>

        <div class="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div
                v-for="metric in summaryMetrics"
                :key="metric.label"
                class="rounded-2xl bg-surface-50/80 backdrop-blur ring-1 ring-white/40 p-4 shadow-inner flex flex-col"
            >
                <span class="text-xs text-surface-500">{{ metric.label }}</span>
                <span class="text-2xl font-semibold text-surface-900">{{ metric.value }}</span>
            </div>
        </div>
    </div>
</template>
