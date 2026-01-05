import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import {
    showServerLoading,
    hideServerLoading,
    startLoadingStep,
    completeLoadingStep,
    errorLoadingStep,
    completeAllLoadingSteps
} from '@/composables/servers/useServerLoading'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

interface UseServerNavigationResult {
    navigateToServer: (serverId: string, serverName?: string) => Promise<void>
}

// Small delay to show step transitions
const STEP_DELAY = 300

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useServerNavigation(): UseServerNavigationResult {
    const route = useRoute()
    const router = useRouter()
    const server_store = useServerStore()
    const toast = useToast()
    const { t } = useI18n()

    const { getServerDetails } = useServerCRUD()
    const { listMembers } = useMemberCRUD()
    const { listEnumDefinitions } = useEnumDefinitionCRUD()

    async function getServerInfos(serverId: string, force = false): Promise<void> {
        if (!force && server_store.loadFromCache(serverId)) {
            // If from cache, quickly complete all steps
            completeAllLoadingSteps()
            await delay(STEP_DELAY)
            return
        }

        server_store.setLoading(true)

        try {
            // Step 1: Server Details
            startLoadingStep('server_details')
            const detailsRes = await getServerDetails(serverId)
            if (detailsRes.error || !detailsRes.data) {
                errorLoadingStep('server_details')
                throw new Error('Failed to load server details')
            }
            completeLoadingStep('server_details')
            server_store.setServer(detailsRes.data)
            await delay(STEP_DELAY)

            // Step 2: Members
            startLoadingStep('members')
            const membersRes = await listMembers(serverId)
            if (membersRes.error || !membersRes.data) {
                errorLoadingStep('members')
                throw new Error('Failed to load members')
            }
            completeLoadingStep('members')
            server_store.setMembers(membersRes.data.data ?? null)
            await delay(STEP_DELAY)

            // Step 3: Enum Definitions
            startLoadingStep('definitions')
            const enumsRes = await listEnumDefinitions(serverId)
            if (enumsRes.error || !enumsRes.data) {
                errorLoadingStep('definitions')
                throw new Error('Failed to load enum definitions')
            }
            completeLoadingStep('definitions')
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
                summary: t('servers.navigation.error_loading_server_title'),
                detail: t('servers.navigation.error_loading_server'),
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
        if (!hasCache) server_store.resetState()

        // Show loading overlay
        showServerLoading(serverName)

        try {
            await getServerInfos(serverId)

            // Small delay to show completion animation
            await delay(300)
            hideServerLoading()

            await router.push({
                name: 'ServerStats',
                params: { id: serverId },
                query: { ...route.query }
            })
        } catch {
            // Error already handled in getServerInfos
            hideServerLoading()
        }
    }

    return { navigateToServer }
}

