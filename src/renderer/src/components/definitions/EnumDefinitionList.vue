<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import { useEnumDefinitionStatsCRUD } from '@/composables/enums-definition/useEnumDefinitionStatsCRUD'
import { useServerStore } from '@/stores/server'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import type { IEnumDefinitionStats } from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'
import { useToast } from 'primevue/usetoast'
import EnumDefinitionCreateEditDialog from './EnumDefinitionCreateEditDialog.vue'
import { enumDefGradientColorsList } from '@/components/definitions/constants/constants'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const server_store = useServerStore()
const { listEnumDefinitions } = useEnumDefinitionCRUD()
const { getAllEnumDefinitionStats } = useEnumDefinitionStatsCRUD()

const definitions = ref<IEnumDefinition[]>([])
const statsMap = ref<Map<string, IEnumDefinitionStats>>(new Map())
const loading = ref(true)
const showCreateDialog = ref(false)
const definitionToEdit = ref<IEnumDefinition | null>(null)

const MAX_VALUES_PER_CHUNK = 5

async function loadDefinitions() {
    if (!server_store.getPublicId) return
    loading.value = true
    try {
        const [defsRes, statsRes] = await Promise.all([
            listEnumDefinitions(server_store.getPublicId),
            getAllEnumDefinitionStats(server_store.getPublicId, { page: 1, limit: 100 })
        ])

        if (defsRes.data) {
            definitions.value = defsRes.data
        }

        if (statsRes.data?.data) {
            const map = new Map<string, IEnumDefinitionStats>()
            statsRes.data.data.forEach((s) => {
                map.set(s.enum_definition_id, s)
            })
            statsMap.value = map
        }
    } catch (e) {
        console.error(e)
        toast.add({
            severity: 'error',
            summary: t('messages.error.fetch'),
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

function openCreateDialog() {
    definitionToEdit.value = null
    showCreateDialog.value = true
}

function navigateToProfile(def: IEnumDefinition, index: number) {
    router.push({
        name: 'ServerEnumDefinitionProfile',
        params: {
            id: server_store.getPublicId,
            definitionId: def.public_id
        },
        query: { colorIndex: index.toString() }
    })
}

onMounted(() => {
    loadDefinitions()
})

function flattenDefinitionValues(def: IEnumDefinition): string[] {
    if (!def.values?.length) return []
    const flattened: string[] = []
    def.values.forEach((valueObj) => {
        for (let i = 1; i <= MAX_VALUES_PER_CHUNK; i++) {
            const key = `value${i}` as keyof typeof valueObj
            const val = valueObj[key]
            if (typeof val === 'string' && val.trim()) {
                flattened.push(val)
            }
        }
    })
    return flattened
}

function getChoicesPreview(def: IEnumDefinition): string[] {
    return flattenDefinitionValues(def)
}

function countChoices(def: IEnumDefinition): number {
    return flattenDefinitionValues(def).length
}

function getGradient(index: number): string {
    return enumDefGradientColorsList[index % enumDefGradientColorsList.length]
}

function getStats(defId: string): IEnumDefinitionStats | undefined {
    return statsMap.value.get(defId)
}
</script>

<template>
    <div class="flex flex-col gap-6 w-full">
        <!-- Header -->
        <div class="flex justify-between items-center w-full">
            <div class="flex items-center gap-3">
                <div
                    class="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                >
                    <i class="pi pi-list text-xl"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-surface-900">
                        {{ t('views.server_enum_definitions.list_title') }}
                    </h2>
                    <p class="text-sm text-surface-500">
                        {{ definitions.length }} {{ t('common.fields.items') }}
                    </p>
                </div>
            </div>
            <Button
                :label="t('views.server_enum_definitions.add_definition')"
                icon="pi pi-plus"
                size="small"
                class="shadow-md"
                @click="openCreateDialog"
            />
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
            <div v-for="i in 3" :key="i" class="bg-surface-0 rounded-3xl overflow-hidden shadow-sm">
                <Skeleton height="80px" class="!rounded-none" />
                <div class="p-5 space-y-3">
                    <Skeleton width="70%" height="1.5rem" />
                    <Skeleton width="50%" height="1rem" />
                    <div class="flex gap-2 pt-2">
                        <Skeleton width="60px" height="28px" class="rounded-lg" />
                        <Skeleton width="60px" height="28px" class="rounded-lg" />
                        <Skeleton width="60px" height="28px" class="rounded-lg" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="definitions.length === 0"
            class="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-surface-50 to-surface-100 rounded-3xl border-2 border-dashed border-surface-200"
        >
            <div
                class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-5 shadow-lg shadow-primary-500/10"
            >
                <i class="pi pi-list text-3xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-bold text-surface-900 mb-2">
                {{ t('views.server_enum_definitions.no_definitions_title') }}
            </h3>
            <p class="text-surface-500 text-sm mb-6 max-w-sm text-center">
                {{ t('views.server_enum_definitions.no_definitions') }}
            </p>
            <Button
                :label="t('views.server_enum_definitions.add_definition')"
                icon="pi pi-plus"
                rounded
                class="shadow-lg shadow-primary-500/25"
                @click="openCreateDialog"
            />
        </div>

        <!-- Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
            <div
                v-for="(def, index) in definitions"
                :key="def.public_id"
                class="group relative bg-surface-0 rounded-3xl overflow-hidden shadow-sm ring-1 ring-surface-200/60 hover:shadow-xl hover:ring-primary-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                @click="navigateToProfile(def, index)"
            >
                <!-- Gradient Header -->
                <div
                    class="h-28 bg-gradient-to-br relative overflow-hidden flex flex-col justify-center"
                    :class="getGradient(index)"
                >
                    <!-- Pattern overlay -->
                    <div class="absolute inset-0 opacity-20">
                        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <circle cx="80" cy="20" r="30" fill="white" />
                            <circle cx="10" cy="80" r="20" fill="white" />
                        </svg>
                    </div>

                    <!-- Icon centered at top -->
                    <div
                        class="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ml-4"
                    >
                        <i class="pi pi-list text-2xl text-white"></i>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-5">
                    <!-- Title & Description -->
                    <div class="mb-4">
                        <h3
                            class="font-bold text-lg text-surface-900 mb-1 group-hover:text-primary-600 transition-colors"
                        >
                            {{ def.name }}
                        </h3>
                        <p class="text-sm text-surface-500 line-clamp-2">
                            {{ def.description || t('common.fields.no_description') }}
                        </p>
                    </div>

                    <!-- Stats Row -->
                    <div
                        v-if="getStats(def.public_id)"
                        class="flex items-center gap-4 mb-4 text-sm"
                    >
                        <div class="flex items-center gap-1.5 text-surface-600">
                            <i class="pi pi-check-square text-xs text-primary-500"></i>
                            <span class="font-medium">{{
                                getStats(def.public_id)?.total_usage
                            }}</span>
                            <span class="text-surface-400">{{
                                t('views.server_enum_definitions.total_usage')
                            }}</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-surface-600">
                            <i class="pi pi-users text-xs text-green-500"></i>
                            <span class="font-medium">{{
                                getStats(def.public_id)?.unique_users
                            }}</span>
                            <span class="text-surface-400">{{
                                t('views.server_enum_definitions.unique_users')
                            }}</span>
                        </div>
                    </div>

                    <!-- Choices Section -->
                    <div class="pt-4 border-t border-surface-100">
                        <div class="flex items-center justify-between mb-2">
                            <span
                                class="text-xs font-semibold text-surface-400 uppercase tracking-wider"
                            >
                                {{ t('common.fields.choices') }}
                            </span>
                            <span
                                class="text-xs font-bold bg-surface-100 text-surface-600 px-2 py-1 rounded-full"
                            >
                                {{ countChoices(def) }}
                            </span>
                        </div>

                        <div class="flex flex-wrap gap-1.5">
                            <span
                                v-for="(choice, idx) in getChoicesPreview(def).slice(0, 4)"
                                :key="idx"
                                class="text-xs font-medium px-2 py-1 rounded-lg bg-surface-100 text-surface-700"
                            >
                                {{ choice }}
                            </span>
                            <span
                                v-if="getChoicesPreview(def).length > 4"
                                class="text-xs font-medium px-2 py-1 rounded-lg bg-primary-100 text-primary-700"
                            >
                                +{{ getChoicesPreview(def).length - 4 }}
                            </span>
                        </div>
                    </div>

                    <!-- View Stats Link -->
                    <div class="mt-4 pt-3 border-t border-surface-100">
                        <div
                            class="flex items-center justify-end text-sm text-primary-600 font-medium group-hover:underline"
                        >
                            {{ t('views.server_enum_definitions.view_stats') }}
                            <i
                                class="pi pi-arrow-right text-xs ml-1 group-hover:translate-x-1 transition-transform"
                            ></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <EnumDefinitionCreateEditDialog
            v-model="showCreateDialog"
            :definition-to-edit="definitionToEdit"
            @created="loadDefinitions"
            @updated="loadDefinitions"
        />
    </div>
</template>
