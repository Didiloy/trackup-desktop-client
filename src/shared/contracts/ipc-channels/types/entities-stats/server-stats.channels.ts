/**
 * Server Statistics IPC Channels
 */

export const SERVER_STATS_CHANNELS = {
    // Base stats
    getStats: 'servers-stats:getStats',

    // Detailed stats
    getDetails: 'servers-stats:getDetails',

    // Timeline
    getTimeline: 'servers-stats:getTimeline',

    // Growth trends
    getGrowthTrends: 'servers-stats:getGrowthTrends',

    // Comparative analysis
    getComparativeAnalysis: 'servers-stats:getComparativeAnalysis'
} as const
