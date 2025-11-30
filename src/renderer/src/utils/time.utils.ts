// Helper to format duration (ms) in millisecond to mm:ss or hh:mm:ss
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number): string => n.toString().padStart(2, '0')

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function convertMinutesToHMS(totalMinutes: number): {
  hours: number
  minutes: number
  seconds: number
} {
  const totalSeconds = Math.floor((totalMinutes || 0) * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  return { hours, minutes, seconds }
}

export function convertHMSToMinutes(hours: number, minutes: number, seconds: number): number {
  const totalSeconds = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0)
  return totalSeconds / 60
}

export function formatMinutesToLabel(min: number): string {
  if (!min || Number.isNaN(min)) return '0m'

  const hours = Math.floor(min / 60)
  const minutes = Math.floor(min % 60)

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

export function convertMsToMinutes(ms: number): number {
  if (!ms || ms < 0) return 0
  return Math.ceil(ms / 60000)
}
