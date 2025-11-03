/**
 * Server Statistics IPC Channels
 */

export const SERVER_STATS_CHANNELS = {
  // Base stats
  getStats: 'server-stats:getStats',

  // Detailed stats
  getDetails: 'server-stats:getDetails',

  // Timeline
  getTimeline: 'server-stats:getTimeline',

  // Growth trends
  getGrowthTrends: 'server-stats:getGrowthTrends',

  // Comparative analysis
  getComparativeAnalysis: 'server-stats:getComparativeAnalysis'
} as const
