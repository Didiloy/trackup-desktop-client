/**
 * Window management ipc-channels
 */
export const WINDOW_CHANNELS = {
  minimize: 'window:minimize',
  maximize: 'window:maximize',
  close: 'window:close',
  isMaximized: 'window:isMaximized'
} as const
