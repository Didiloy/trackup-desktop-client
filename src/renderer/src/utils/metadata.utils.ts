import type { ActivityMetadataType } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

/**
 * Translation key prefix for metadata types
 */
const METADATA_TYPE_I18N_PREFIX = 'views.server_activities.metadata.type_options.'

/**
 * Get the i18n translation key for a metadata type
 * @param type - The metadata type (NUMBER, STRING, BOOLEAN, DATE)
 * @returns The translation key string
 */
export function getMetadataTypeTranslationKey(type: ActivityMetadataType): string {
    return `${METADATA_TYPE_I18N_PREFIX}${type.toLowerCase()}`
}

/**
 * Get translated metadata type names from an array of types
 * @param types - Array of metadata types
 * @param t - The i18n translation function
 * @returns Comma-separated string of translated type names
 */
export function getTranslatedMetadataTypes(
    types: ActivityMetadataType[],
    t: (key: string) => string
): string {
    return types.map((type) => t(getMetadataTypeTranslationKey(type))).join(', ')
}

/**
 * Check if a metadata type is in a list of supported types
 * @param type - The metadata type to check
 * @param supportedTypes - Array of supported types
 * @returns boolean indicating if type is supported
 */
export function isMetadataTypeSupported(
    type: ActivityMetadataType | string | undefined,
    supportedTypes: ActivityMetadataType[]
): boolean {
    if (!type) return false
    return supportedTypes.includes(type as ActivityMetadataType)
}
