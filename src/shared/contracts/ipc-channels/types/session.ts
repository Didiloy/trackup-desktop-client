/**
 * Session IPC channels
 */
export const SESSION_CHANNELS = {
  create: 'session:create',
  list: 'session:list',
  getById: 'session:getById',
  update: 'session:update',
  delete: 'session:delete',
  like: 'session:like',
  unlike: 'session:unlike'
} as const

