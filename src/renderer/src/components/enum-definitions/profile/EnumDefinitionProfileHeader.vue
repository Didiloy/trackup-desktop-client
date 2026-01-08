<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import { enumDefGradientColorsList } from '@/components/enum-definitions/constants/constants'
import { useServerStore } from '@/stores/server'

defineProps<{
    definition: IEnumDefinition | null
    loading?: boolean
}>()

const emit = defineEmits<{
    edit: []
    delete: []
}>()

const route = useRoute()
const server_store = useServerStore()

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
        <div class="absolute top-4 right-4 z-20 flex gap-2" v-if="server_store.isOwnership">
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
            </div>
        </div>
    </div>
</template>
