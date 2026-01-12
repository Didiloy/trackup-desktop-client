import { type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useSessionCRUD } from './useSessionCRUD'
import type {
    ISession,
    ISessionListItem
} from '@shared/contracts/interfaces/entities/session.interfaces'

interface UseSessionActionsReturn {
    toggleLike: () => Promise<void>
}

/**
 * Composable for session actions (like, delete, etc.)
 * Handles optimistic updates, debouncing, and error handling
 */
export function useSessionActions(
    session: Ref<ISession | ISessionListItem | null>
): UseSessionActionsReturn {
    const toast = useToast()
    const { t } = useI18n()
    const server_store = useServerStore()
    const { likeSession, unlikeSession } = useSessionCRUD()

    const toggleLike = useDebounceFn(async (): Promise<void> => {
        if (!session.value || !server_store.getPublicId) return

        const wasLiked = session.value.liked_by_me
        const previousCount = session.value.likes_count

        // Optimistic update
        session.value.liked_by_me = !wasLiked
        session.value.likes_count = wasLiked ? previousCount - 1 : previousCount + 1

        try {
            const res = wasLiked
                ? await unlikeSession(server_store.getPublicId, session.value.public_id)
                : await likeSession(server_store.getPublicId, session.value.public_id)

            if (res.error) {
                // Rollback on error
                session.value.liked_by_me = wasLiked
                session.value.likes_count = previousCount

                toast.add({
                    severity: 'error',
                    summary: t('messages.error.update'),
                    detail: res.error,
                    life: 2500
                })
            }
        } catch (e) {
            // Rollback on exception
            session.value.liked_by_me = wasLiked
            session.value.likes_count = previousCount

            toast.add({
                severity: 'error',
                summary: t('messages.error.update'),
                detail: e instanceof Error ? e.message : String(e),
                life: 2500
            })
        }
    }, 500)

    return {
        toggleLike
    }
}
