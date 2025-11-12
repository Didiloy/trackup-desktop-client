/**
 * Member IPC channels
 */
export const MEMBER_CHANNELS = {
    invite: 'member:invite',
    quit: 'member:quit',
    list: 'member:list',
    getById: 'member:getById',
    kick: 'member:kick',
    updateNickname: 'member:updateNickname'
} as const
