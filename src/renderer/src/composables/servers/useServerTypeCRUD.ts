import { useUserStore } from '@/stores/user'
import type {
    IServerType,
    IServerTypeApiResponse
} from '@shared/contracts/interfaces/entities/server-type.interfaces'
import { ref } from 'vue'

interface UseServerTypeCRUDReturn {
    getAllServerTypes: (refresh?: boolean) => Promise<IServerTypeApiResponse<IServerType[]>>
    getServerTypeById: (
        public_id: string
    ) => Promise<IServerTypeApiResponse<IServerType | undefined>>
}

/**
 * Composable for Server Type entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useServerTypeCRUD(): UseServerTypeCRUDReturn {
    const user_store = useUserStore()
    const cache = ref<IServerType[] | null>(null)

    /**
     * Get all servers types
     */
    const getAllServerTypes = async (
        refresh = false
    ): Promise<IServerTypeApiResponse<IServerType[]>> => {
        if (cache.value && !refresh) {
            return { data: cache.value }
        }
        const res = await window.api.serverType.getAll(user_store.getAccessToken!)
        if (res.data) cache.value = res.data
        return res
    }

    /**
     * Get a server type by its public_id
     */
    const getServerTypeById = async (
        public_id: string
    ): Promise<IServerTypeApiResponse<IServerType | undefined>> => {
        if (!public_id) return { data: undefined, error: 'Missing server type id' }
        if (!cache.value) {
            const res = await getAllServerTypes(true)
            if (res.error) return { data: undefined, error: res.error }
        }
        const found = cache.value?.find((t) => t.public_id === public_id)
        return { data: found }
    }

    return {
        getAllServerTypes,
        getServerTypeById
    }
}
