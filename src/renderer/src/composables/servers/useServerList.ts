import { ref, type Ref } from 'vue'
import type { IUserServer } from '../../../../shared/contracts/interfaces/entities/user.interfaces'
import type { IServer } from '../../../../shared/contracts/interfaces/entities/server.interfaces'
import { useUser } from '@/composables/entities'
import { useRouter } from 'vue-router'

interface UseServerListReturn {
  servers: Ref<IUserServer[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  fetchServers: () => Promise<void>
  handleServerCreated: (server: IServer) => Promise<void>
}

export function useServerList(): UseServerListReturn {
  const servers = ref<IUserServer[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const { getMyServers } = useUser()
  const router = useRouter()

  async function fetchServers(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const res = await getMyServers()
      servers.value = res.data ?? []
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to fetch servers')
      servers.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function handleServerCreated(server: IServer): Promise<void> {
    await fetchServers()
    if (server?.public_id) {
      await router.push(`/servers/${server.public_id}`)
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
