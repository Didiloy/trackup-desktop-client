/**
 * Activity IPC channels
 */
export const ACTIVITY_CHANNELS = {
    create: 'activity:create',
    list: 'activity:list',
    getById: 'activity:getById',
    update: 'activity:update',
    delete: 'activity:delete',
    createSession: 'activity:createSession',
    listSessions: 'activity:listSessions'
} as const
