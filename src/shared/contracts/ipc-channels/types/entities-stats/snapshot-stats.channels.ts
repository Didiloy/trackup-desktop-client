/**
 * Snapshot Statistics IPC Channels
 */

export const SNAPSHOT_STATS_CHANNELS = {
  // Create snapshot
  create: 'snapshot-stats:create',

  // Get snapshots
  getAll: 'snapshot-stats:getAll',
  getById: 'snapshot-stats:getById',
  getLatest: 'snapshot-stats:getLatest',
  getSummary: 'snapshot-stats:getSummary',

  // Compare snapshots
  compare: 'snapshot-stats:compare',

  // Cleanup
  cleanup: 'snapshot-stats:cleanup'
} as const
