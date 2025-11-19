export interface ActivityCardMetrics {
    totalSessions: number
    totalDuration: number
    avgSessionDuration?: number
    totalLikes?: number
    avgLikesPerSession?: number
    uniqueParticipants?: number
    totalParticipants?: number
    avgParticipantsPerSession?: number
    popularityScore?: number
    growthPercent: number
    trendPositive: boolean
    topContributor?: string | null
    sparkline: number[]
}
