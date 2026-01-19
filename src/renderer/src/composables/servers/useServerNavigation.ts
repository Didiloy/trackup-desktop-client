import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useServerMemberStore } from '@/stores/server-member'
import { useUserStore } from '@/stores/user'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useEnumDefinitionCRUD } from '@/composables/enum-definitions/useEnumDefinitionCRUD'
import { useServerLoading } from '@/composables/servers/useServerLoading'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

interface UseServerNavigationResult {
    navigateToServer: (serverId: string, serverName?: string) => Promise<void>
}

// Small delay to show step transitions
const STEP_DELAY = 220

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useServerNavigation(): UseServerNavigationResult {
    const route = useRoute()
    const router = useRouter()
    const server_store = useServerStore()
    const server_member_store = useServerMemberStore()
    const user_store = useUserStore()
    const toast = useToast()
    const { t } = useI18n()

    const { getServerDetails } = useServerCRUD()
    const { listMembers, getMemberByUserId } = useMemberCRUD()
    const { listEnumDefinitions } = useEnumDefinitionCRUD()
    const {
        showServerLoading,
        hideServerLoading,
        startLoadingStep,
        completeLoadingStep,
        errorLoadingStep,
        completeAllLoadingSteps
    } = useServerLoading()

    async function getServerInfos(serverId: string, force = false): Promise<void> {
        if (!force && (await server_store.loadFromCache(serverId))) {
            // If from cache, quickly complete all steps
            completeAllLoadingSteps()
            await delay(STEP_DELAY)
            return
        }

        server_store.setLoading(true)

        try {
            const [detailsRes, currentMemberRes, membersRes, enumsRes] = await Promise.all([
                getServerDetails(serverId),
                getMemberByUserId(serverId, user_store.getId!),
                listMembers(serverId),
                listEnumDefinitions(serverId)
            ])
            // Step 1: Server Details
            startLoadingStep('server_details')
            if (detailsRes.error || !detailsRes.data) {
                errorLoadingStep('server_details')
                throw new Error('Failed to load server details')
            }
            completeLoadingStep('server_details')
            await server_store.setServer(detailsRes.data)
            await delay(STEP_DELAY)

            // Step 2: Members & Current Member
            startLoadingStep('members')
            if (
                currentMemberRes.error ||
                !currentMemberRes.data ||
                membersRes.error ||
                !membersRes.data
            ) {
                errorLoadingStep('members')
                throw new Error('Failed to load members or current member')
            }
            completeLoadingStep('members')
            server_store.setMembers(membersRes.data.data ?? null)
            server_member_store.setMember(currentMemberRes.data ?? null)
            await delay(STEP_DELAY)

            // Step 3: Enum Definitions
            startLoadingStep('enum_definitions')
            if (enumsRes.error || !enumsRes.data) {
                errorLoadingStep('enum_definitions')
                throw new Error('Failed to load enum definitions')
            }
            completeLoadingStep('enum_definitions')
            server_store.setEnumsDefinition(enumsRes.data)
            await delay(STEP_DELAY)
        } catch {
            server_store.resetState()
            await delay(500) // Show error state briefly
            hideServerLoading()
            await router.push({
                name: 'Home'
            })
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: t('messages.error.fetch'),
                life: 5000
            })
            throw new Error('Navigation failed')
        } finally {
            server_store.setLoading(false)
        }
    }

    async function navigateToServer(serverId: string, serverName = ''): Promise<void> {
        if (server_store.getPublicId === serverId) return

        const hasCache = server_store.loadFromCache(serverId)
        if (!hasCache) {
            server_store.resetState()
            server_member_store.resetState()
        }

        // Show loading overlay
        showServerLoading(serverName)

        try {
            await router.push({
                name: 'ServerStats',
                params: { id: serverId },
                query: { ...route.query }
            })

            await getServerInfos(serverId)

            // Small delay to show completion animation
            await delay(300)

            hideServerLoading()
        } catch {
            // Error already handled in getServerInfos
            hideServerLoading()
        }
    }

    return { navigateToServer }
}
