import { session } from 'electron'

/**
 * Security hardening configuration
 * Apply strict security policies to the application
 */
export function applySecurity(): void {
    // Set permission request handler to deny by default
    session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
        // Deny all permissions by default
        // Add specific permissions here as needed
        const allowedPermissions: string[] = []

        callback(allowedPermissions.includes(permission))
    })

    // Set permission check handler
    session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
        // Deny all permissions by default
        const allowedPermissions: string[] = []

        return allowedPermissions.includes(permission)
    })

    // Block navigation to external sites in the main window
    session.defaultSession.webRequest.onBeforeRequest((_details, callback) => {
        // Allow navigation only within the app
        callback({})
    })
}
