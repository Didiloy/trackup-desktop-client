const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR
const MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE

/**
 * Formats a duration in milliseconds to "HH:MM:SS" format.
 * @param ms
 */
export function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / MILLISECONDS_PER_SECOND)
    const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR)
    const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
    const seconds = totalSeconds % SECONDS_PER_MINUTE

    const pad = (n: number): string => n.toString().padStart(2, '0')

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/**
 * Converts total minutes to hours, minutes, and seconds.
 * @param totalMinutes
 */
export function convertMinutesToHMS(totalMinutes: number): {
    hours: number
    minutes: number
    seconds: number
} {
    const totalSeconds = Math.floor((totalMinutes || 0) * SECONDS_PER_MINUTE)
    const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR)
    const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
    const seconds = Math.floor(totalSeconds % SECONDS_PER_MINUTE)

    return { hours, minutes, seconds }
}

/**
 * Converts hours, minutes, and seconds to total minutes.
 * @param hours
 * @param minutes
 * @param seconds
 */
export function convertHMSToMinutes(hours: number, minutes: number, seconds: number): number {
    const totalSeconds =
        (hours || 0) * SECONDS_PER_HOUR + (minutes || 0) * SECONDS_PER_MINUTE + (seconds || 0)
    return totalSeconds / SECONDS_PER_MINUTE
}

/**
 * Formats minutes to a label like "1h 30m".
 * @param min
 */
export function formatMinutesToLabel(min: number): string {
    if (!min || Number.isNaN(min)) return '0m'

    const hours = Math.floor(min / MINUTES_PER_HOUR)
    const minutes = Math.floor(min % MINUTES_PER_HOUR)

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    return `${minutes}m`
}

/**
 * Converts milliseconds to total minutes, rounding up.
 * @param ms
 */
export function convertMsToMinutes(ms: number): number {
    if (!ms || ms < 0) return 0
    return Math.ceil(ms / MILLISECONDS_PER_MINUTE)
}
