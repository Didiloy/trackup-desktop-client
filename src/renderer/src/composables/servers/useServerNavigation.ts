import { computed, type Ref, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { IUserServer } from '../../../../shared/contracts/interfaces/entities/user.interfaces'
import { useServerStore } from '@/stores/server'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'

interface UseServerNavigationResult {
  currentServerId: ComputedRef<string | undefined>
  navigateToServer: (serverId: string) => Promise<void>
}

export function useServerNavigation(servers: Ref<IUserServer[]>): UseServerNavigationResult {
  const route = useRoute()
  const router = useRouter()
  const server_store = useServerStore()
  const { getServerDetails } = useServerCRUD()
  const { listMembers } = useMemberCRUD()

  function isServerActive(serverId: string): boolean {
    return route.params.id === serverId
  }

  async function getServerInfos(server_id: string): Promise<void> {
    server_store.resetState()

    const resServerDetails = await getServerDetails(server_id)
    if (resServerDetails.error) return
    server_store.setServer(resServerDetails.data ?? null)

    const resServerMembers = await listMembers(server_id)
    if (resServerMembers.error) return
    server_store.setMembers(resServerMembers.data?.data ?? [])
  }

  async function navigateToServer(server_id: string): Promise<void> {
    if (!isServerActive(server_id)) {
      await getServerInfos(server_id)
      await router.push({
        name: `ServerOverview`,
        params: { id: server_id },
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
