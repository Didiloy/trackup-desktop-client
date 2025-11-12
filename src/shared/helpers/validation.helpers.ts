/**
 * Generic validation helpers for IPC handlers
 * Provides reusable validation functions across the application
 */

/**
 * Validation error result
 */
export interface ValidationError {
    error: string
}

/**
 * Validation result - either valid (undefined) or an error object
 */
export type ValidationResult = ValidationError | undefined

/**
 * Validate that a required field is provided and not empty
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @returns ValidationError if invalid, undefined if valid
 */
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { error: `${fieldName} is required` }
    }
    return undefined
}

/**
 * Validate multiple required fields at once
 * @param fields - Object mapping field values to their names
 * @returns ValidationError if any field is invalid, undefined if all are valid
 */
export function validateRequiredFields(
    fields: Record<string, { value: unknown; name: string }>
): ValidationResult {
    for (const { value, name } of Object.values(fields)) {
        const error = validateRequired(value, name)
        if (error) return error
    }
    return undefined
}

/**
 * Validate authentication token
 * @param accessToken - The access token to validate
 * @returns ValidationError if invalid, undefined if valid
 */
export function validateAuth(accessToken: string): ValidationResult {
    return validateRequired(accessToken, 'Authentication')
}

/**
 * Validate pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @returns ValidationError if invalid, undefined if valid
 */
export function validatePagination(page?: number, limit?: number): ValidationResult {
    if (page !== undefined && page < 1) {
        return { error: 'Page must be >= 1' }
    }
    if (limit !== undefined && limit < 1) {
        return { error: 'Limit must be >= 1' }
    }
    return undefined
}

/**
 * Validate a numeric value is positive
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @returns ValidationError if invalid, undefined if valid
 */
export function validatePositive(value: number | undefined, fieldName: string): ValidationResult {
    if (value !== undefined && value <= 0) {
        return { error: `${fieldName} must be greater than 0` }
    }
    return undefined
}

/**
 * Validate an array is not empty
 * @param array - The array to validate
 * @param fieldName - The name of the field for error messages
 * @returns ValidationError if invalid, undefined if valid
 */
export function validateNotEmpty<T>(array: T[] | undefined, fieldName: string): ValidationResult {
    if (!array || array.length === 0) {
        return { error: `${fieldName} must not be empty` }
    }
    return undefined
}

/**
 * Validate URL scheme (security check)
 * @param url - The URL to validate
 * @returns ValidationError if invalid, undefined if valid
 */
export function validateUrlScheme(url: string): ValidationResult {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return { error: 'Invalid URL scheme' }
    }
    return undefined
}

/**
 * Combine multiple validation results
 * Returns the first error found, or undefined if all validations pass
 * @param validations - Array of validation results
 * @returns ValidationError if any validation failed, undefined if all passed
 */
export function combineValidations(...validations: ValidationResult[]): ValidationResult {
    for (const validation of validations) {
        if (validation) return validation
    }
    return undefined
}
