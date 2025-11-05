import { computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { IUserServer } from '../../../../shared/contracts/interfaces/entities/user.interfaces'

export function useServerNavigation(servers: Ref<IUserServer[]>) {
  const route = useRoute()
  const router = useRouter()

  function isServerActive(serverId: string): boolean {
    return route.params.id === serverId
  }

  async function navigateToServer(serverId: string): Promise<void> {
    if (!isServerActive(serverId)) {
      await router.push(`/servers/${serverId}`)
    }
  }

  const currentServerId = computed(() => {
    return servers.value.find((s) => isServerActive(s.public_id))?.public_id
  })

  return {
    currentServerId,
    isServerActive,
    navigateToServer
  }
}
