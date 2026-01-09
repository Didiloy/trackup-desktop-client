<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ISnapshotLight } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'
import Icon from '@/components/common/icons/Icon.vue'
import Badge from 'primevue/badge'

const props = defineProps<{
    snapshot: ISnapshotLight
}>()

const emit = defineEmits<{
    (e: 'click'): void
}>()

const { t, d } = useI18n()

const typeConfig = computed(() => {
    const configs = {
        daily: { icon: 'mdi:calendar-today', color: 'text-blue-600', bg: 'bg-blue-100' },
        weekly: { icon: 'mdi:calendar-week', color: 'text-green-600', bg: 'bg-green-100' },
        monthly: { icon: 'mdi:calendar-month', color: 'text-purple-600', bg: 'bg-purple-100' },
        yearly: { icon: 'mdi:calendar', color: 'text-orange-600', bg: 'bg-orange-100' },
        milestone: { icon: 'mdi:flag', color: 'text-red-600', bg: 'bg-red-100' },
        custom: { icon: 'mdi:cog', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
    return configs[props.snapshot.type] || configs.custom
})

const formattedDate = computed(() => {
    return d(new Date(props.snapshot.created_at), 'short')
})

const safeType = computed(() => {
    return props.snapshot.type || 'custom'
})

const typeLabel = computed(() => {
    return t(`views.server_settings.snapshots.types.${safeType.value}`)
})
</script>

<template>
    <div
        class="p-5 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 shadow-sm hover:shadow-md transition-all hover:ring-primary-500/30 cursor-pointer"
        @click="emit('click')"
    >
        <div class="flex items-start justify-between mb-4">
            <div :class="`p-3 rounded-xl ${typeConfig.bg} ${typeConfig.color}`">
                <Icon :icon="typeConfig.icon" class="text-xl" />
            </div>
            <Badge
                :value="typeLabel"
                :severity="safeType === 'milestone' ? 'danger' : 'info'"
            />
        </div>

        <div class="mb-3">
            <p class="text-sm text-surface-500 font-medium mb-1">
                {{ t('views.server_settings.snapshots.card.created_at') }}
            </p>
            <p class="text-base font-semibold text-surface-900">
                {{ formattedDate }}
            </p>
        </div>

        <div v-if="snapshot.description" class="mb-3">
            <p class="text-sm text-surface-600 line-clamp-2">
                {{ snapshot.description }}
            </p>
        </div>

        <div v-if="snapshot.highlights" class="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
            <div v-if="snapshot.highlights.total_sessions !== undefined">
                <p class="text-xs text-surface-500 mb-1">
                    {{ t('views.server_settings.snapshots.card.sessions') }}
                </p>
                <p class="text-sm font-bold text-surface-900">
                    {{ snapshot.highlights.total_sessions }}
                </p>
            </div>
            <div v-if="snapshot.highlights.total_members !== undefined">
                <p class="text-xs text-surface-500 mb-1">
                    {{ t('views.server_settings.snapshots.card.members') }}
                </p>
                <p class="text-sm font-bold text-surface-900">
                    {{ snapshot.highlights.total_members }}
                </p>
            </div>
            <div v-if="snapshot.highlights.engagement_score !== undefined">
                <p class="text-xs text-surface-500 mb-1">
                    {{ t('views.server_settings.snapshots.card.engagement') }}
                </p>
                <p class="text-sm font-bold text-surface-900">
                    {{ Math.round(snapshot.highlights.engagement_score) }}/100
                </p>
            </div>
        </div>
    </div>
</template>
