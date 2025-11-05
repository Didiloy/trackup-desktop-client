import { useUserStore } from '@/stores/user'
import type {
  IServerType,
  IServerTypeApiResponse
} from '../../../../shared/contracts/interfaces/entities/server-type.interfaces'

/**
 * Composable for Server Type entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useServerType() {
  const user_store = useUserStore()

  /**
   * Get all server types
   */
  const getAllServerTypes = async (): Promise<IServerTypeApiResponse<IServerType[]>> => {
    return window.api.serverType.getAll(user_store.getAccessToken!)
  }

  return {
    getAllServerTypes
  }
}
