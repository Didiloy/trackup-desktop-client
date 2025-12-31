/**
 * Activity Metadata Definition Statistics IPC Channels
 */

export const ACTIVITY_METADATA_DEFINITION_STATS_CHANNELS = {
    // Get all metadata enum-definitions statistics
    getAll: 'activity-metadata-definition-stats:getAll',

    // Get specific metadata definition statistics
    getById: 'activity-metadata-definition-stats:getById',

    // Get metadata value distribution
    getDistribution: 'activity-metadata-definition-stats:getDistribution',

    // Get metadata value statistics
    getValueStats: 'activity-metadata-definition-stats:getValueStats',

    // Get metadata definition timeline
    getTimeline: 'activity-metadata-definition-stats:getTimeline'
} as const
