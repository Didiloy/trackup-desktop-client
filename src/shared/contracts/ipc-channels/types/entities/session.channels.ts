/**
 * Session IPC channels
 */
export const SESSION_CHANNELS = {
    list: 'session:list',
    getById: 'session:getById',
    update: 'session:update',
    updateParticipants: 'session:updateParticipants',
    delete: 'session:delete',
    like: 'session:like',
    unlike: 'session:unlike',
    addEnums: 'session:addEnums',
    updateEnumSelection: 'session:updateEnumSelection',
    getEnumSelection: 'session:getEnumSelection'
} as const
