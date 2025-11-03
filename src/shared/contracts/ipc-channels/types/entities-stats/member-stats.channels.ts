/**
 * Member Statistics IPC Channels
 */

export const MEMBER_STATS_CHANNELS = {
  // Leaderboard
  getLeaderboard: 'member-stats:getLeaderboard',

  // All members
  getAllStats: 'member-stats:getAllStats',

  // Single member
  getStats: 'member-stats:getStats',
  getDetails: 'member-stats:getDetails',

  // Patterns & Ranking
  getPatterns: 'member-stats:getPatterns',
  getRanking: 'member-stats:getRanking',

  // Timeline & Growth
  getTimeline: 'member-stats:getTimeline',
  getGrowthTrends: 'member-stats:getGrowthTrends'
} as const

