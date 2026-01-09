<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ISnapshotLight } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'
import Icon from '@/components/common/icons/Icon.vue'
import Badge from 'primevue/badge'
import Button from 'primevue/button'

const props = defineProps<{
    snapshot: ISnapshotLight
}>()

const emit = defineEmits<{
    (e: 'click'): void
    (e: 'download'): void
    (e: 'delete'): void
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
        class="snapshot-card group p-6 rounded-xl bg-surface-0 border-2 border-surface-200 hover:border-primary-500 shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
        @click="emit('click')"
    >
        <!-- Background gradient -->
        <div :class="`absolute inset-0 opacity-5 ${typeConfig.bg}`"></div>
        
        <!-- Action buttons -->
        <div class="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
                icon="mdi:download"
                text
                rounded
                size="small"
                severity="info"
                class="bg-surface-0 shadow-sm hover:bg-surface-100"
                @click.stop="emit('download')"
            />
            <Button
                icon="mdi:delete"
                text
                rounded
                size="small"
                severity="danger"
                class="bg-surface-0 shadow-sm hover:bg-surface-100"
                @click.stop="emit('delete')"
            />
        </div>

        <!-- Header -->
        <div class="flex items-start gap-4 mb-4 relative z-10">
            <div :class="`flex items-center justify-center w-14 h-14 rounded-xl ${typeConfig.bg} ${typeConfig.color} shadow-sm`">
                <Icon :icon="typeConfig.icon" class="text-2xl" />
            </div>
            <div class="flex-1 min-w-0">
                <Badge
                    :value="typeLabel"
                    :severity="safeType === 'milestone' ? 'danger' : safeType === 'custom' ? 'info' : 'secondary'"
                    class="mb-2"
                />
                <h3 class="text-xl font-bold text-surface-900 mb-1 truncate">
                    {{ snapshot.title || typeLabel }}
                </h3>
                <p class="text-sm text-surface-500">
                    {{ formattedDate }}
                </p>
            </div>
        </div>

        <!-- Description -->
        <div v-if="snapshot.description" class="mb-4 relative z-10">
            <p class="text-sm text-surface-600 line-clamp-2 bg-surface-50 p-3 rounded-lg border border-surface-200">
                {{ snapshot.description }}
            </p>
        </div>

        <!-- Stats Grid -->
        <div v-if="snapshot.highlights" class="grid grid-cols-2 gap-3 relative z-10">
            <div v-if="snapshot.highlights.total_sessions !== undefined" class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center gap-2 mb-1">
                    <Icon icon="mdi:play-circle" class="text-blue-600 text-lg" />
                    <p class="text-xs font-medium text-blue-600 uppercase">
                        {{ t('views.server_settings.snapshots.card.sessions') }}
                    </p>
                </div>
                <p class="text-2xl font-bold text-blue-900">
                    {{ snapshot.highlights.total_sessions }}
                </p>
            </div>
            
            <div v-if="snapshot.highlights.total_members !== undefined" class="bg-green-50 p-4 rounded-lg border border-green-200">
                <div class="flex items-center gap-2 mb-1">
                    <Icon icon="mdi:account-group" class="text-green-600 text-lg" />
                    <p class="text-xs font-medium text-green-600 uppercase">
                        {{ t('views.server_settings.snapshots.card.members') }}
                    </p>
                </div>
                <p class="text-2xl font-bold text-green-900">
                    {{ snapshot.highlights.total_members }}
                </p>
            </div>
            
            <div v-if="snapshot.highlights.engagement_score !== undefined" class="bg-purple-50 p-4 rounded-lg border border-purple-200 col-span-2">
                <div class="flex items-center gap-2 mb-1">
                    <Icon icon="mdi:chart-line" class="text-purple-600 text-lg" />
                    <p class="text-xs font-medium text-purple-600 uppercase">
                        {{ t('views.server_settings.snapshots.card.engagement') }}
                    </p>
                </div>
                <div class="flex items-baseline gap-2">
                    <p class="text-2xl font-bold text-purple-900">
                        {{ Math.round(snapshot.highlights.engagement_score) }}
                    </p>
                    <p class="text-sm text-purple-600">/100</p>
                </div>
            </div>
        </div>

        <!-- Empty state if no highlights -->
        <div v-else class="text-center py-6 relative z-10">
            <Icon icon="mdi:chart-box-outline" class="text-4xl text-surface-300 mb-2" />
            <p class="text-sm text-surface-400">Aucune statistique disponible</p>
        </div>
    </div>
</template>

<style scoped>
.snapshot-card {
    position: relative;
}
</style>
