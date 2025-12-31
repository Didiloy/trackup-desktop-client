/**
 * Enum Definition Statistics IPC Channels
 */

export const ENUM_DEFINITION_STATS_CHANNELS = {
    // All enum enum-definitions
    getAllStats: 'enums-definition-stats:getAllStats',

    // Specific enum definition details
    getStats: 'enums-definition-stats:getStats',

    // Value distribution
    getDistribution: 'enums-definition-stats:getDistribution',

    // Specific enum value stats
    getValueStats: 'enums-definition-stats:getValueStats'
} as const
