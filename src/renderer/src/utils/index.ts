import { type Composer } from 'vue-i18n'
import { type ToastServiceMethods } from 'primevue'

export const maskKey = (key: string) => (key ? `${key.slice(0, 5)}******${key.slice(-5)}` : '')

export const copyKeyToClipBoard = async (
    key: string,
    toast?: ToastServiceMethods,
    i18n?: Composer
): Promise<void> => {
    if (!key) return
    try {
        if (window.api?.app?.clipboard?.writeText) {
            window.api.app.clipboard.writeText(key)
        } else {
            await navigator.clipboard.writeText(key)
        }
        if (toast) {
            toast.add({
                severity: 'success',
                summary: i18n ? i18n.t('messages.success.copyClipBoard') : '',
                life: 3000
            })
        }
    } catch (err) {
        if (toast) {
            toast.add({
                severity: 'error',
                summary: i18n ? i18n.t('messages.error.copyClipBoard') : '',
                life: 3000
            })
        }
        console.error('Failed to copy to clipboard:', err)
    }
}

export const formatDate = (isoString: string): string => {
    const date = new Date(isoString)
    const locale = navigator.languages ? navigator.languages[0] : navigator.language
    return date
        .toLocaleString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
        .replace(',', '')
}

type InitialsMode = 'firstOnly' | 'lastOnly' | 'firstLast' | 'all'

export interface IInitialsOptions {
    maxInitials?: number // Maximum number of initials to include
    mode?: InitialsMode // Which words to use for the initials
}

export const getInitials = (name: string, options?: IInitialsOptions): string => {
    if (!name) return ''

    const { maxInitials = 2, mode = 'firstLast' } = options || {}
    const words = name.trim().split(/\s+/).filter(Boolean)

    if (words.length === 0) return ''

    let wordsToUse: string[]

    switch (mode) {
        case 'firstOnly':
            wordsToUse = [words[0]]
            break
        case 'lastOnly':
            wordsToUse = [words[words.length - 1]]
            break
        case 'all':
            wordsToUse = words
            break
        case 'firstLast':
        default:
            wordsToUse = words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]]
            break
    }

    return wordsToUse
        .slice(0, maxInitials)
        .map((word) => word.charAt(0).toUpperCase())
        .join('')
}

// Apply theme based on selection or system preference
export const applyTheme = (
    themeValue: 'system' | boolean,
    isSystemDarkMode?: () => boolean
): boolean => {
    const rootElement = document.documentElement
    let isDark: boolean

    if (themeValue === 'system') {
        isDark = isSystemDarkMode ? isSystemDarkMode() : false
    } else {
        isDark = themeValue
    }

    if (isDark) {
        rootElement.classList.add('dark')
    } else {
        rootElement.classList.remove('dark')
    }

    return isDark
}

export async function asyncPool<T, R>(
    concurrency: number,
    items: readonly T[],
    task: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
    const results: Promise<R>[] = []
    const executing: Promise<void>[] = []

    for (const item of items) {
        const p = task(item)
        results.push(p)

        if (concurrency <= items.length) {
            const exec: Promise<void> = p.then(() => {
                const index = executing.indexOf(exec)
                if (index !== -1) executing.splice(index, 1)
            })

            executing.push(exec)

            if (executing.length >= concurrency) {
                await Promise.race(executing)
            }
        }
    }

    return Promise.allSettled(results)
}
