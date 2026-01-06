/**
 * User Stats IPC channels
 */
export const USER_STATS_CHANNELS = {
    getStats: 'userStats:getStats',
    getProfile: 'userStats:getProfile',
    getLastSessions: 'userStats:getLastSessions',
    startAppSession: 'userStats:startAppSession',
    endAppSession: 'userStats:endAppSession'
} as const
