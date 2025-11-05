import { useUserStore } from '@/stores/user'
import type {
  IEnumDefinition,
  ICreateEnumDefinitionRequest,
  IUpdateEnumDefinitionRequest,
  IEnumDefinitionApiResponse
} from '../../../../shared/contracts/interfaces/entities/enum-definition.interfaces'

interface UseEnumDefinitionCRUDReturn {
  createEnumDefinition: (
    serverId: string,
    request: ICreateEnumDefinitionRequest
  ) => Promise<IEnumDefinitionApiResponse<IEnumDefinition>>
  listEnumDefinitions: (serverId: string) => Promise<IEnumDefinitionApiResponse<IEnumDefinition[]>>
  updateEnumDefinition: (
    serverId: string,
    enumDefinitionId: string,
    request: IUpdateEnumDefinitionRequest
  ) => Promise<IEnumDefinitionApiResponse<IEnumDefinition>>
  deleteEnumDefinition: (
    serverId: string,
    enumDefinitionId: string
  ) => Promise<IEnumDefinitionApiResponse<void>>
}

/**
 * Composable for Enum Definition entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useEnumDefinitionCRUD(): UseEnumDefinitionCRUDReturn {
  const user_store = useUserStore()

  /**
   * Create a new enum definition
   */
  const createEnumDefinition = async (
    serverId: string,
    request: ICreateEnumDefinitionRequest
  ): Promise<IEnumDefinitionApiResponse<IEnumDefinition>> => {
    return window.api.enumDefinition.create(serverId, request, user_store.getAccessToken!)
  }

  /**
   * List all enum definitions in a servers
   */
  const listEnumDefinitions = async (
    serverId: string
  ): Promise<IEnumDefinitionApiResponse<IEnumDefinition[]>> => {
    return window.api.enumDefinition.list(serverId, user_store.getAccessToken!)
  }

  /**
   * Update an enum definition
   */
  const updateEnumDefinition = async (
    serverId: string,
    enumDefinitionId: string,
    request: IUpdateEnumDefinitionRequest
  ): Promise<IEnumDefinitionApiResponse<IEnumDefinition>> => {
    return window.api.enumDefinition.update(
      serverId,
      enumDefinitionId,
      request,
      user_store.getAccessToken!
    )
  }

  /**
   * Delete an enum definition
   */
  const deleteEnumDefinition = async (
    serverId: string,
    enumDefinitionId: string
  ): Promise<IEnumDefinitionApiResponse<void>> => {
    return window.api.enumDefinition.delete(serverId, enumDefinitionId, user_store.getAccessToken!)
  }

  return {
    createEnumDefinition,
    listEnumDefinitions,
    updateEnumDefinition,
    deleteEnumDefinition
  }
}
