import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useEnumDefinitionStatsCRUD } from '@/composables/enums-definition/useEnumDefinitionStatsCRUD'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import type {
    IEnumDefinitionStats,
    IEnumValueDistribution
} from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'

export const useEnumDefinitionStatsStore = defineStore('enum-definition-stats', () => {
    const { getEnumValueStatsDistribution, getAllEnumDefinitionStats } =
        useEnumDefinitionStatsCRUD()
    const { listEnumDefinitions } = useEnumDefinitionCRUD()

    // State
    const currentDefinition = ref<IEnumDefinition | null>(null)
    const currentDefinitionStats = ref<IEnumDefinitionStats | null>(null)
    const valueDistribution = ref<IEnumValueDistribution[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Current IDs for tracking context
    const currentServerId = ref<string | null>(null)
    const currentDefinitionId = ref<string | null>(null)

    // Getters
    const hasData = computed(() => currentDefinitionStats.value !== null)
    const totalUsage = computed(() => currentDefinitionStats.value?.total_usage ?? 0)
    const totalSessions = computed(() => currentDefinitionStats.value?.total_sessions ?? 0)
    const totalDuration = computed(() => currentDefinitionStats.value?.total_duration ?? 0)
    const uniqueUsers = computed(() => currentDefinitionStats.value?.unique_users ?? 0)
    const mostUsedValue = computed(() => currentDefinitionStats.value?.most_used_value ?? null)

    // Actions
    async function loadDefinition(serverId: string, definitionId: string) {
        if (currentServerId.value === serverId && currentDefinitionId.value === definitionId) {
            return // Already loaded
        }

        isLoading.value = true
        error.value = null
        currentServerId.value = serverId
        currentDefinitionId.value = definitionId

        try {
            // Load all enum-definitions and find the one we need
            const defsRes = await listEnumDefinitions(serverId)
            if (defsRes.error || !defsRes.data) {
                error.value = defsRes.error ?? 'Failed to load enum-definitions'
                return
            }
            const foundDef = defsRes.data.find((d) => d.public_id === definitionId)
            if (!foundDef) {
                error.value = 'Definition not found'
                return
            }
            currentDefinition.value = foundDef

            // Load stats via getAllEnumDefinitionStats and find ours
            const statsRes = await getAllEnumDefinitionStats(serverId, { page: 1, limit: 100 })
            if (statsRes.data?.data) {
                const found = statsRes.data.data.find(
                    (s) => s.enum_definition_id === definitionId
                )
                if (found) {
                    currentDefinitionStats.value = found
                }
            }

            // Load value distribution
            const distRes = await getEnumValueStatsDistribution(serverId, definitionId)
            if (distRes.data && Array.isArray(distRes.data)) {
                valueDistribution.value = distRes.data
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
        } finally {
            isLoading.value = false
        }
    }

    async function refreshDistribution() {
        if (!currentServerId.value || !currentDefinitionId.value) return

        try {
            const distRes = await getEnumValueStatsDistribution(
                currentServerId.value,
                currentDefinitionId.value
            )
            if (distRes.data && Array.isArray(distRes.data)) {
                valueDistribution.value = distRes.data
            }
        } catch (e) {
            console.error('Failed to refresh distribution:', e)
        }
    }

    function reset() {
        currentDefinition.value = null
        currentDefinitionStats.value = null
        valueDistribution.value = []
        currentServerId.value = null
        currentDefinitionId.value = null
        isLoading.value = false
        error.value = null
    }

    return {
        // State
        currentDefinition,
        currentDefinitionStats,
        valueDistribution,
        isLoading,
        error,
        currentServerId,
        currentDefinitionId,
        // Getters
        hasData,
        totalUsage,
        totalSessions,
        totalDuration,
        uniqueUsers,
        mostUsedValue,
        // Actions
        loadDefinition,
        refreshDistribution,
        reset
    }
})
