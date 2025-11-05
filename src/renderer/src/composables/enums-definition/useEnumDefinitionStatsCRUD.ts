import { useUserStore } from '@/stores/user'
import type {
  IEnumValueDistribution,
  IPaginatedEnumDefinitionStats,
  IPaginatedEnumValueStats,
  IEnumDefinitionPaginationParams,
  IEnumDefinitionDetailsParams,
  IEnumDefinitionStatsApiResponse
} from '../../../../shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'

interface UseEnumDefinitionStatsCRUDReturn {
  getAllEnumDefinitionStats: (
    serverId: string,
    params: IEnumDefinitionPaginationParams
  ) => Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumDefinitionStats>>
  getEnumDefinitionStats: (
    serverId: string,
    enumDefinitionId: string,
    params: IEnumDefinitionDetailsParams
  ) => Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>>
  getEnumValueDistribution: (
    serverId: string,
    enumDefinitionId: string
  ) => Promise<IEnumDefinitionStatsApiResponse<IEnumValueDistribution>>
}

/**
 * Composable for Enum Definition Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useEnumDefinitionStatsCRUD(): UseEnumDefinitionStatsCRUDReturn {
  const user_store = useUserStore()

  /**
   * Get all enum definitions statistics (paginated)
   */
  const getAllEnumDefinitionStats = async (
    serverId: string,
    params: IEnumDefinitionPaginationParams
  ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumDefinitionStats>> => {
    return window.api.enumDefinitionStats.getAllStats(serverId, params, user_store.getAccessToken!)
  }

  /**
   * Get enum definition statistics (paginated values)
   */
  const getEnumDefinitionStats = async (
    serverId: string,
    enumDefinitionId: string,
    params: IEnumDefinitionDetailsParams
  ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>> => {
    return window.api.enumDefinitionStats.getStats(
      serverId,
      enumDefinitionId,
      params,
      user_store.getAccessToken!
    )
  }

  /**
   * Get enum value distribution
   */
  const getEnumValueDistribution = async (
    serverId: string,
    enumDefinitionId: string
  ): Promise<IEnumDefinitionStatsApiResponse<IEnumValueDistribution>> => {
    return window.api.enumDefinitionStats.getDistribution(
      serverId,
      enumDefinitionId,
      user_store.getAccessToken!
    )
  }

  return {
    getAllEnumDefinitionStats,
    getEnumDefinitionStats,
    getEnumValueDistribution
  }
}
