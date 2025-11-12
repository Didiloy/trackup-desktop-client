import { computed, type Ref, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { IUserServer } from '../../../../shared/contracts/interfaces/entities/user.interfaces'

interface UseServerNavigationResult {
  currentServerId: ComputedRef<string | undefined>
  navigateToServer: (serverId: string) => Promise<void>
}

export function useServerNavigation(servers: Ref<IUserServer[]>): UseServerNavigationResult {
  const route = useRoute()
  const router = useRouter()

  function isServerActive(serverId: string): boolean {
    return route.params.id === serverId
  }

  async function navigateToServer(serverId: string): Promise<void> {
    if (!isServerActive(serverId)) {
      await router.push({
        name: `ServerOverview`,
        params: { id: serverId },
        query: { ...route.query }
      })
    }
  }

  const currentServerId = computed<string | undefined>(() => {
    return servers.value.find((s) => isServerActive(s.public_id))?.public_id
  })

  return {
    currentServerId,
    navigateToServer
  }
}
