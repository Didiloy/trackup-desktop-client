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

  async function getServerInfos(server_id: string, forceRefresh = false): Promise<void> {
    // Try to load from cache first if not forcing refresh
    if (!forceRefresh && server_store.loadFromCache(server_id)) {
      return
    }

    server_store.setLoading(true)

    try {
      // Fetch both in parallel for better performance
      const [resServerDetails, resServerMembers] = await Promise.all([
        getServerDetails(server_id),
        listMembers(server_id)
      ])

      if (!resServerDetails.error && resServerDetails.data) {
        server_store.setServer(resServerDetails.data)

        if (!resServerMembers.error && resServerMembers.data?.data) {
          server_store.setMembers(resServerMembers.data.data)
          // Cache the successful result
          server_store.setCachedServer(server_id, resServerDetails.data, resServerMembers.data.data)
        }
      }
    } finally {
      server_store.setLoading(false)
    }
  }

  async function navigateToServer(server_id: string): Promise<void> {
    if (!isServerActive(server_id)) {
      // Check if we have cached data
      const hasCachedData = server_store.loadFromCache(server_id)

      if (!hasCachedData) {
        // No cache: reset state for clean transition
        server_store.resetState()
      }

      // Navigate first (instant UI update)
      await router.push({
        name: `ServerOverview`,
        params: { id: server_id },
        query: { ...route.query }
      })

      // Load data (will skip if already cached)
      await getServerInfos(server_id)
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
