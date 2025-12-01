import { ref, type Ref } from 'vue'
import type { IServer } from '@shared/contracts/interfaces/entities/server.interfaces'
import { useUserCRUD } from '@/composables/users/useUserCRUD'
import { useServerNavigation } from '@/composables/servers/useServerNavigation'
import { useUserStore } from '@/stores/user'

interface UseServerListReturn {
    isLoading: Ref<boolean>
    error: Ref<string | null>
    fetchServers: () => Promise<void>
    handleServerCreated: (server: IServer) => Promise<void>
}

export function useServerList(): UseServerListReturn {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const { getMyServers } = useUserCRUD()
    const { navigateToServer } = useServerNavigation()
    const user_store = useUserStore();

    async function fetchServers(): Promise<void> {
        isLoading.value = true
        error.value = null

        const res = await getMyServers()
        if (res.error) {
            error.value = res.error
            isLoading.value = false
            return
        }
        user_store.setMyServers(res.data || [])
        isLoading.value = false
    }

    async function handleServerCreated(server: IServer): Promise<void> {
        await fetchServers()
        if (server?.public_id) {
            await navigateToServer(server.public_id)
        }
    }

    return {
        isLoading,
        error,
        fetchServers,
        handleServerCreated
    }
}
