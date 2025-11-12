import { ref, type Ref } from 'vue'
import type { IUserServer } from '@shared/contracts/interfaces/entities/user.interfaces'
import type { IServer } from '@shared/contracts/interfaces/entities/server.interfaces'
import { useUserCRUD } from '@/composables/users/useUserCRUD'
import { useRouter } from 'vue-router'

interface UseServerListReturn {
    servers: Ref<IUserServer[]>
    isLoading: Ref<boolean>
    error: Ref<string | null>
    fetchServers: () => Promise<void>
    handleServerCreated: (server: IServer) => Promise<void>
}

export function useServerList(): UseServerListReturn {
    const servers = ref<IUserServer[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const { getMyServers } = useUserCRUD()
    const router = useRouter()

    async function fetchServers(): Promise<void> {
        isLoading.value = true
        error.value = null

        const res = await getMyServers()
        if (res.error) {
            error.value = res.error
            servers.value = []
            isLoading.value = false
            return
        }
        servers.value = res.data ?? []
        isLoading.value = false
    }

    async function handleServerCreated(server: IServer): Promise<void> {
        await fetchServers()
        if (server?.public_id) {
            await router.push({
                name: `ServerOverview`,
                params: { id: server.public_id }
            })
        }
    }

    return {
        servers,
        isLoading,
        error,
        fetchServers,
        handleServerCreated
    }
}
