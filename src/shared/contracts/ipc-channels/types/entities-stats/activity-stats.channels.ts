/**
 * Activity Statistics IPC Channels
 */

export const ACTIVITY_STATS_CHANNELS = {
  // Leaderboard
  getLeaderboard: 'activity-stats:getLeaderboard',

  // All activities
  getAllStats: 'activity-stats:getAllStats',

  // Single activity
  getStats: 'activity-stats:getStats',
  getDetails: 'activity-stats:getDetails',

  // Patterns & Ranking
  getPatterns: 'activity-stats:getPatterns',
  getRanking: 'activity-stats:getRanking',

  // Timeline & Growth
  getTimeline: 'activity-stats:getTimeline',
  getGrowthTrends: 'activity-stats:getGrowthTrends'
} as const
