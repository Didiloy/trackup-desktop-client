import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useEnumDefinitionCRUD } from '@/composables/enums-definition/useEnumDefinitionCRUD'
import type {
    IServer,
    IServerApiResponse
} from '@shared/contracts/interfaces/entities/server.interfaces'
import type {
    IMemberApiResponse,
    IPaginatedMembers
} from '@shared/contracts/interfaces/entities/member.interfaces'
import type {
    IEnumDefinition,
    IEnumDefinitionApiResponse
} from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

interface UseServerNavigationResult {
    navigateToServer: (serverId: string) => Promise<void>
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
        if (!force && server_store.loadFromCache(serverId)) return

        server_store.setLoading(true)
        try {
            const responses = await Promise.allSettled([
                getServerDetails(serverId),
                listMembers(serverId),
                listEnumDefinitions(serverId)
            ])

            // Stop si une seule est rejetée
            if (responses.some((r) => r.status === 'rejected')) {
                throw new Error('At least one request failed')
            }

            // Tous les résultats sont fulfilled à ce stade
            const [details, members, enums] = responses as [
                PromiseFulfilledResult<IServerApiResponse<IServer>>,
                PromiseFulfilledResult<IMemberApiResponse<IPaginatedMembers>>,
                PromiseFulfilledResult<IEnumDefinitionApiResponse<IEnumDefinition[]>>
            ]

            // Vérification globale : s'il manque data ou erreur => stop
            if ([details, members, enums].some((r) => r.value.error || !r.value.data)) {
                throw new Error('At least one request failed')
            }

            // Mise à jour du store
            server_store.setServer(details.value.data ?? null)
            server_store.setMembers(members.value.data?.data ?? null)
            server_store.setEnumsDefinition(enums.value.data ?? null)

            // Cache
            // store.setCachedServer(
            //     serverId,
            //     details.value.data,
            //     members.value.data?.data,
            //     enums.value.data
            // )
        } catch {
            server_store.resetState()
            await router.push({
                name: 'Home'
            })
            // add toast here to indicate error
            toast.add({
                severity: 'error',
                summary: t('servers.navigation.error_loading_server_title'),
                detail: t('servers.navigation.error_loading_server'),
                life: 5000
            })
        } finally {
            server_store.setLoading(false)
        }
    }

    async function navigateToServer(serverId: string): Promise<void> {
        if (server_store.getPublicId === serverId) return

        const hasCache = server_store.loadFromCache(serverId)
        if (!hasCache) server_store.resetState()

        await getServerInfos(serverId)

        await router.push({
            name: 'ServerStats',
            params: { id: serverId },
            query: { ...route.query }
        })
    }

    return { navigateToServer }
}
