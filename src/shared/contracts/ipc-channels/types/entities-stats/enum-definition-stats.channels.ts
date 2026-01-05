/**
 * Enum Definition Statistics IPC Channels
 */

export const ENUM_DEFINITION_STATS_CHANNELS = {
    // All enum enum-definitions
    getAllStats: 'enum-definitions-stats:getAllStats',

    // Specific enum definition details
    getStats: 'enum-definitions-stats:getStats',

    // Value distribution
    getDistribution: 'enum-definitions-stats:getDistribution',

    // Specific enum value stats
    getValueStats: 'enum-definitions-stats:getValueStats'
} as const
