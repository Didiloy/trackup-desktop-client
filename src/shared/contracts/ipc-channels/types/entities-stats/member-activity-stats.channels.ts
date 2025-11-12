/**
 * Member Activity Statistics IPC Channels
 */

export const MEMBER_ACTIVITY_STATS_CHANNELS = {
    // All activities for a member
    getAllActivities: 'member-activity-stats:getAllActivities',

    // Specific activity for a member
    getActivityStats: 'member-activity-stats:getActivityStats',

    // Activity progression
    getActivityProgression: 'member-activity-stats:getActivityProgression'
} as const
