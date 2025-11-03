/**
 * Server IPC channels
 */
export const SERVER_CHANNELS = {
  create: 'server:create',
  refreshInviteCode: 'server:refreshInviteCode',
  join: 'server:join',
  getDetails: 'server:getDetails',
  update: 'server:update',
  delete: 'server:delete'
} as const
