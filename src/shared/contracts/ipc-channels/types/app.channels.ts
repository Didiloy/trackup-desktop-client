/**
 * App ipc-channels
 */
export const APP_CHANNELS = {
    ping: 'app:ping',
    getVersion: 'app:getVersion',
    openExternal: 'app:openExternal',
    checkForUpdates: 'app:checkForUpdates',
    downloadUpdate: 'app:downloadUpdate',
    installUpdate: 'app:installUpdate',
    updateAvailable: 'app:updateAvailable',
    updateDownloaded: 'app:updateDownloaded',
    updateError: 'app:updateError',
    updateProgress: 'app:updateProgress'
} as const
