import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  IServerMember,
  IListMembersOptions
} from '../../../shared/contracts/interfaces/entities/member.interfaces'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'

export const useServerMembersStore = defineStore('serverMembers', () => {
  const serverId = ref<string | null>(null)
  const members = ref<IServerMember[]>([])
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const { listMembers } = useMemberCRUD()

  function clear(): void {
    serverId.value = null
    members.value = []
    total.value = 0
    loading.value = false
    error.value = null
  }

  async function fetch(serverId: string, options?: IListMembersOptions): Promise<void> {
    loading.value = true
    error.value = null
    const res = await listMembers(serverId, options)
    if (res.error) {
      error.value = res.error
      members.value = []
      total.value = 0
      loading.value = false
      return
    }
    members.value = res.data?.data ?? []
    total.value = res.data?.total ?? 0
    loading.value = false
  }

  return { serverId, members, total, loading, error, clear, fetch }
})
