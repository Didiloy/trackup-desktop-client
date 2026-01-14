/**
 * Member IPC channels
 */
export const MEMBER_CHANNELS = {
    invite: 'member:invite',
    quit: 'member:quit',
    list: 'member:list',
    getById: 'member:getById',
    getByUserId: 'member:getByUserId',
    kick: 'member:kick',
    updateProfile: 'member:updateProfile',
    getSessions: 'member:getSessions',
    getSessionsForActivity: 'member:getSessionsForActivity'
} as const
