import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SnapshotType } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'
import { useSnapshotCRUD } from './useSnapshotCRUD'
import { useToast } from 'primevue/usetoast'
import { EPeriod } from '@shared/contracts/enums/period.enum'

/**
 * Composable pour les fonctionnalités communes des snapshots
 */
export function useSnapshot() {
    const { t } = useI18n()

    // Configuration des types de snapshots
    const SNAPSHOT_TYPE_CONFIG = {
        [EPeriod.DAILY]: { severity: 'info' as const, icon: 'pi-calendar' },
        [EPeriod.WEEKLY]: { severity: 'success' as const, icon: 'pi-calendar-plus' },
        [EPeriod.MONTHLY]: { severity: 'warn' as const, icon: 'pi-calendar-times' },
        [EPeriod.YEARLY]: { severity: 'secondary' as const, icon: 'pi-calendar' },
        [EPeriod.MILESTONE]: { severity: 'danger' as const, icon: 'pi-flag' },
        [EPeriod.CUSTOM]: { severity: 'secondary' as const, icon: 'pi-bookmark' }
    } as const

    // Options pour les filtres de type
    const typeFilterOptions = computed(() => [
        { label: t('common.misc.all'), value: 'all' },
        { label: t('common.periods.daily'), value: EPeriod.DAILY },
        { label: t('common.periods.weekly'), value: EPeriod.WEEKLY },
        { label: t('common.periods.monthly'), value: EPeriod.MONTHLY },
        { label: t('common.periods.yearly'), value: EPeriod.YEARLY },
        { label: t('common.periods.milestone'), value: EPeriod.MILESTONE },
        { label: t('common.periods.custom'), value: EPeriod.CUSTOM }
    ])

    // Options pour la création de snapshots (sans "all")
    const typeCreateOptions = computed(() => [
        { label: t('common.periods.milestone'), value: EPeriod.MILESTONE },
        { label: t('common.periods.custom'), value: EPeriod.CUSTOM }
    ])

    /**
     * Retourne le label traduit d'un type de snapshot
     */
    const getTypeLabel = (type: SnapshotType): string => {
        return t(`common.periods.${type}`)
    }

    /**
     * Retourne la sévérité (couleur) d'un type de snapshot
     */
    const getTypeSeverity = (
        type: SnapshotType
    ): 'info' | 'success' | 'warn' | 'danger' | 'secondary' => {
        return SNAPSHOT_TYPE_CONFIG[type].severity
    }

    /**
     * Retourne l'icône d'un type de snapshot
     */
    const getTypeIcon = (type: SnapshotType): string => {
        return SNAPSHOT_TYPE_CONFIG[type].icon
    }

    /* --- Nouvelles méthodes partagées --- */

    const { downloadSnapshot } = useSnapshotCRUD()
    const toast = useToast()

    /**
     * Télécharge un snapshot avec feedback toast
     */
    const downloadSnapshotWithFeedback = async (
        serverId: string,
        snapshotId: string
    ): Promise<void> => {
        try {
            await downloadSnapshot(serverId, snapshotId)
            toast.add({
                severity: 'success',
                summary: t('messages.success.title'),
                detail: t('messages.success.fetch'),
                life: 3000
            })
        } catch {
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: t('messages.error.fetch'),
                life: 3000
            })
            throw new Error('Download failed') // Re-throw to let caller know
        }
    }

    /**
     * Retourne le nom d'affichage d'un snapshot (titre ou type traduit)
     */
    const getSnapshotDisplayName = (
        snapshot: { title?: string; snapshot_type: SnapshotType } | null | undefined
    ): string => {
        if (!snapshot) return ''
        return snapshot.title || getTypeLabel(snapshot.snapshot_type)
    }

    /**
     * Formate une valeur de tendance (+/-)
     */
    const formatTrendValue = (value: number | undefined | null, isPercentage = false): string => {
        if (value === undefined || value === null) return '-'
        const sign = value >= 0 ? '+' : ''
        const formatted = isPercentage ? `${value.toFixed(1)}%` : value.toString()
        return `${sign}${formatted}`
    }

    /**
     * Retourne la sévérité pour une tendance
     */
    const getTrendSeverity = (
        value: number | undefined | null
    ): 'success' | 'danger' | 'secondary' => {
        if (value === undefined || value === null) return 'secondary'
        return value >= 0 ? 'success' : 'danger'
    }

    return {
        SNAPSHOT_TYPE_CONFIG,
        typeFilterOptions,
        typeCreateOptions,
        getTypeLabel,
        getTypeSeverity,
        getTypeIcon,
        downloadSnapshotWithFeedback,
        getSnapshotDisplayName,
        formatTrendValue,
        getTrendSeverity
    }
}
