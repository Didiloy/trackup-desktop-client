<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import type { IEnumDefinitionStats } from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'
import { enumDefGradientColorsList } from '@/components/definitions/constants/constants'
import { formatMinutesToLabel } from '@/utils/time.utils'

defineProps<{
    definition: IEnumDefinition | null
    stats: IEnumDefinitionStats | null
    loading?: boolean
}>()

const emit = defineEmits<{
    edit: []
    delete: []
}>()

const { t } = useI18n()
const route = useRoute()

const gradientClass = computed(() => {
    const colorIndex = parseInt(route.query.colorIndex as string) || 0
    return enumDefGradientColorsList[colorIndex % enumDefGradientColorsList.length]
})

</script>

<template>
    <div
        class="relative bg-gradient-to-br rounded-3xl p-6 text-white shadow-lg overflow-hidden"
        :class="gradientClass"
    >
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-10">
            <div
                class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"
            ></div>
            <div
                class="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"
            ></div>
        </div>

        <!-- Action buttons -->
        <div class="absolute top-4 right-4 z-20 flex gap-2">
            <Button
                icon="pi pi-pencil"
                text
                rounded
                class="w-10! h-10! bg-white/20! backdrop-blur-sm hover:bg-white/40! text-white!"
                :disabled="loading"
                @click="emit('edit')"
            />
            <Button
                icon="pi pi-trash"
                text
                rounded
                class="w-10! h-10! bg-white/20! backdrop-blur-sm hover:bg-red-500/60! text-white!"
                :disabled="loading"
                @click="emit('delete')"
            />
        </div>

        <!-- Content -->
        <div class="relative z-10">
            <!-- Loading state -->
            <div v-if="loading" class="space-y-4">
                <Skeleton width="60%" height="2rem" class="bg-white/20!" />
                <Skeleton width="40%" height="1rem" class="bg-white/20!" />
                <div class="flex gap-6 mt-6">
                    <Skeleton width="100px" height="3rem" class="bg-white/20!" />
                    <Skeleton width="100px" height="3rem" class="bg-white/20!" />
                    <Skeleton width="100px" height="3rem" class="bg-white/20!" />
                </div>
            </div>

            <div v-else-if="definition" class="space-y-4">
                <!-- Title & Description -->
                <div>
                    <div class="flex items-center gap-3">
                        <div
                            class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                        >
                            <i class="pi pi-list text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold">{{ definition.name }}</h1>
                            <p v-if="definition.description" class="text-white/70 text-sm mt-1">
                                {{ definition.description }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Stats Row -->
                <div v-if="stats" class="flex flex-wrap gap-8 mt-6 pt-6 border-t border-white/20">
                    <div class="flex flex-col">
                        <span class="text-3xl font-bold">{{ stats.total_usage }}</span>
                        <span class="text-sm text-white/70">{{
                            t('views.server_definitions.total_usage')
                        }}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-3xl font-bold">{{ stats.total_sessions }}</span>
                        <span class="text-sm text-white/70">sessions</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-3xl font-bold">{{
                            formatMinutesToLabel(stats.total_duration)
                        }}</span>
                        <span class="text-sm text-white/70">{{
                            t('views.server_definitions.profile.overview.total_duration')
                        }}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-3xl font-bold">{{ stats.unique_users }}</span>
                        <span class="text-sm text-white/70">{{
                            t('views.server_definitions.unique_users')
                        }}</span>
                    </div>

                    <!-- Most used value badge -->
                    <div v-if="stats.most_used_value" class="ml-auto flex items-center gap-2">
                        <span class="text-sm text-white/70">{{
                            t('views.server_definitions.most_used')
                        }}</span>
                        <span
                            class="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm font-medium"
                        >
                            {{ stats.most_used_value.selected_value }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
