import { useUserStore } from '@/stores/user'
import type {
  IUser,
  IUserServer,
  IUserApiResponse
} from '../../../../shared/contracts/interfaces/entities/user.interfaces'

/**
 * Composable for User entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useUser() {
  const user_store = useUserStore()

  /**
   * Get current user information
   */
  const getMe = async (): Promise<IUserApiResponse<IUser>> => {
    return window.api.user.getMe(user_store.getAccessToken!)
  }

  /**
   * Get current user's servers
   */
  const getMyServers = async (): Promise<IUserApiResponse<IUserServer[]>> => {
    return window.api.user.getMyServers(user_store.getAccessToken!)
  }

  return {
    getMe,
    getMyServers
  }
}
