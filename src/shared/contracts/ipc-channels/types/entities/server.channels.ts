/**
 * Server IPC channels
 */
export const SERVER_CHANNELS = {
  create: 'servers:create',
  refreshInviteCode: 'servers:refreshInviteCode',
  join: 'servers:join',
  getDetails: 'servers:getDetails',
  update: 'servers:update',
  delete: 'servers:delete'
} as const
