import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import type {
    IServerMember,
    IInviteMemberRequest
} from '@shared/contracts/interfaces/entities/member.interfaces'

export function useServerMembers() {
    const { t } = useI18n()
    const toast = useToast()
    const server_store = useServerStore()
    const { listMembers, inviteMember, kickMember, quitServer } = useMemberCRUD()

    const members = ref<IServerMember[]>([])
    const total = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Filters
    const searchQuery = ref('')
    const sortBy = ref('joined_at')
    const sortOrder = ref<'asc' | 'desc'>('desc')

    const filteredMembers = computed(() => {
        // Client-side filtering for immediate feedback if list is small
        // But ideally we should use server-side filtering if implemented
        let result = [...members.value]

        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter(
                (m) =>
                    m.nickname.toLowerCase().includes(query) ||
                    m.user_email.toLowerCase().includes(query)
            )
        }

        return result.sort((a, b) => {
            const aValue = a[sortBy.value]
            const bValue = b[sortBy.value]

            if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
            return 0
        })
    })

    async function fetchMembers(serverId: string, force = false) {
        if (loading.value) return

        // Check cache if not forcing
        if (!force && members.value.length > 0 && server_store.getPublicId === serverId) {
            return
        }

        loading.value = true
        error.value = null

        try {
            const res = await listMembers(serverId)

            if (res.error) throw new Error(res.error)
            if (res.data) {
                members.value = res.data.data
                total.value = res.data.total
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : t('messages.error.fetch')
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: error.value,
                life: 3000
            })
        } finally {
            loading.value = false
        }
    }

    return {
        members,
        filteredMembers,
        total,
        loading,
        error,
        searchQuery,
        sortBy,
        sortOrder,
        fetchMembers
    }
}
