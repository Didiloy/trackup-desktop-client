/**
 * Enum Definition Statistics IPC Channels
 */

export const ENUM_DEFINITION_STATS_CHANNELS = {
  // All enum definitions
  getAllStats: 'enum-definition-stats:getAllStats',

  // Specific enum definition details
  getStats: 'enum-definition-stats:getStats',

  // Value distribution
  getDistribution: 'enum-definition-stats:getDistribution',

  // Specific enum value stats
  getValueStats: 'enum-definition-stats:getValueStats'
} as const
