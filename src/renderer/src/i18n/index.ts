import { createI18n } from 'vue-i18n'

// Avoid explicit any
type LocaleMessages = Record<string, unknown>

const loadedLanguages: Record<string, LocaleMessages> = {}

// Function to get all available locales from the locales directory
// This uses Vite's import.meta.glob to get all JSON files in the locales directory
const localeFiles = import.meta.glob('./locales/*.json', { eager: true })

// Extract available locales from file paths
const supportedLocales = Object.keys(localeFiles)
  .map((path) => {
    const match = path.match(/\.\/locales\/(.+)\.json$/)
    return match ? match[1] : null
  })
  .filter(Boolean) as string[]

// Function to get native language name using Intl.DisplayNames
function getLanguageName(code: string): string {
  try {
    // Get the native name of the language in its own locale
    const displayNames = new Intl.DisplayNames([code], { type: 'language' })
    return displayNames.of(code) || code
  } catch {
    // Fallback if Intl.DisplayNames is not supported or fails
    return code
  }
}

// Function to generate flag emoji from language code
function getFlagEmoji(code: string): string {
  try {
    // Convert language code to country code (generally works for 2-letter codes)
    // For common languages with non-matching country codes
    const countryCodeMap: Record<string, string> = {
      en: 'gb', // English -> Great Britain
      zh: 'cn' // Chinese -> China
      // Add more special cases as needed
    }

    const countryCode = countryCodeMap[code] || code

    // For 2-letter country codes, convert to regional indicator symbols
    if (countryCode.length === 2) {
      const codePoints = [...countryCode.toUpperCase()].map((char) => 127397 + char.charCodeAt(0))
      return String.fromCodePoint(...codePoints)
    }

    // Fallback for non-standard codes
    return '🌐'
  } catch {
    return '🌐'
  }
}

// Get language info for a locale code
function getLanguageInfo(code: string): { name: string; flag: string } {
  return {
    name: getLanguageName(code),
    flag: getFlagEmoji(code)
  }
}

// Get all available languages with their info
function getAvailableLanguages(): Array<{ code: string; name: string; flag: string }> {
  return supportedLocales.map((code) => ({
    code,
    ...getLanguageInfo(code)
  }))
}

// Détection automatique de la langue du navigateur
function getBrowserLocale(): string {
  const locale = navigator.language || 'en'
  const localePart = locale.split('-')[0] // Ex: "fr" au lieu de "fr-FR"

  // Check if the browser locale is supported, otherwise use fallback
  return supportedLocales.includes(localePart) ? localePart : 'en'
}

async function loadLanguageAsync(locale: string): Promise<LocaleMessages | null> {
  if (loadedLanguages[locale]) {
    return loadedLanguages[locale]
  }

  try {
    // Dynamically import the locale file
    const messages = await import(`./locales/${locale}.json`)
    loadedLanguages[locale] = messages.default as LocaleMessages

    // Update document language for accessibility
    document.documentElement.setAttribute('lang', locale)

    return loadedLanguages[locale]
  } catch (e) {
    console.error(`Could not load translations for locale: ${locale}`, e)
    return null
  }
}

// Pre-load current browser locale or saved preference
const currentLocale = localStorage.getItem('locale') || getBrowserLocale()

// Create i18n instance
const i18n = createI18n({
  locale: currentLocale,
  fallbackLocale: 'en',
  messages: {}, // Dynamic loading
  globalInjection: true,
  silentTranslationWarn: true,
  missingWarn: false,
  fallbackWarn: false
})

// Initialize with browser locale
loadLanguageAsync(currentLocale).then((messages) => {
  if (messages) {
    i18n.global.setLocaleMessage(currentLocale, messages)
  }
})

// Add helper to set locale globally
async function setI18nLanguage(locale: string): Promise<string | null> {
  const messages = await loadLanguageAsync(locale)
  if (messages) {
    i18n.global.setLocaleMessage(locale, messages)
    i18n.global.locale = locale
    return locale
  }
  return null
}

export { i18n, loadLanguageAsync, supportedLocales, getAvailableLanguages, setI18nLanguage }
