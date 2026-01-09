import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SnapshotType } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

/**
 * Composable pour les fonctionnalités communes des snapshots
 */
export function useSnapshot() {
    const { t } = useI18n()

    // Configuration des types de snapshots
    const SNAPSHOT_TYPE_CONFIG = {
        daily: { severity: 'info' as const, icon: 'pi-calendar' },
        weekly: { severity: 'success' as const, icon: 'pi-calendar-plus' },
        monthly: { severity: 'warn' as const, icon: 'pi-calendar-times' },
        yearly: { severity: 'secondary' as const, icon: 'pi-calendar' },
        milestone: { severity: 'danger' as const, icon: 'pi-flag' },
        custom: { severity: 'secondary' as const, icon: 'pi-bookmark' }
    } as const

    // Options pour les filtres de type
    const typeFilterOptions = computed(() => [
        { label: t('common.all'), value: 'all' },
        { label: t('common.periods.daily'), value: 'daily' },
        { label: t('common.periods.weekly'), value: 'weekly' },
        { label: t('common.periods.monthly'), value: 'monthly' },
        { label: t('common.periods.yearly'), value: 'yearly' },
        { label: t('common.periods.milestone'), value: 'milestone' },
        { label: t('common.periods.custom'), value: 'custom' }
    ])

    // Options pour la création de snapshots (sans "all")
    const typeCreateOptions = computed(() => [
        { label: t('common.periods.milestone'), value: 'milestone' },
        { label: t('common.periods.custom'), value: 'custom' }
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

    return {
        SNAPSHOT_TYPE_CONFIG,
        typeFilterOptions,
        typeCreateOptions,
        getTypeLabel,
        getTypeSeverity,
        getTypeIcon
    }
}
