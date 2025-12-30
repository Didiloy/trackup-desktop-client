/**
 * Default skill levels that should be translated
 */
const DEFAULT_SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const

/**
 * Translates skill level if it's a default level, otherwise returns the original value
 * @param skillLevel - The skill level to translate
 * @param t - The i18n translation function
 * @returns Translated skill level or original value
 */
export function translateSkillLevel(
    skillLevel: string | null | undefined,
    t: (key: string) => string
): string {
    if (!skillLevel) return '-'

    const level = skillLevel.toLowerCase()

    if (DEFAULT_SKILL_LEVELS.includes(level as (typeof DEFAULT_SKILL_LEVELS)[number])) {
        return t(`common.skill_levels.${level}`)
    }

    // Return custom level as-is
    return skillLevel
}
