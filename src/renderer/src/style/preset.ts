// voir https://github.com/primefaces/primeuix/blob/main/packages/themes/src/presets/aura/base/index.ts pour la liste des éléments que je peux modifier
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const TrackupPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f5f8ff',
            100: '#dce7ff',
            200: '#bcd2ff',
            300: '#95b8ff',
            400: '#6d9eff',
            500: '#4a84ff',
            600: '#3665f0',
            700: '#2d4ed8',
            800: '#2336a9',
            900: '#1a237e',
            950: '#11164a'
        },
        gradient: {
            primary: 'linear-gradient(135deg, #4a84ff 0%, #8a5cf7 100%)',
            secondary: 'linear-gradient(135deg, #8a5cf7 0%, #d46eff 100%)'
        },
        secondary: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
            950: '#3b0764'
        },
        success: {
            500: '#22c55e'
        },
        warning: {
            500: '#f59e0b'
        },
        danger: {
            500: '#ef4444'
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617'
                },
                text: {
                    color: '#0f172a',
                    muted: '#475569'
                },
                border: '#e2e8f0',
                focusRing: '#4a84ff',
                highlight: '#eef2ff',
                overlay: 'rgba(255, 255, 255, 0.8)'
            },
            dark: {
                surface: {
                    0: '#0d1117',
                    50: '#161b22',
                    100: '#1e2630',
                    200: '#242f3d',
                    300: '#2e3a49',
                    400: '#3c4b5f',
                    500: '#4b5b71',
                    600: '#5e6d82',
                    700: '#7d8ba1',
                    800: '#9ba7b8',
                    900: '#cbd5e1',
                    950: '#f8fafc'
                },
                text: {
                    color: '#e2e8f0',
                    muted: '#94a3b8'
                },
                border: '#2e3a49',
                focusRing: '#8a5cf7',
                highlight: '#1e3a8a',
                overlay: 'rgba(0, 0, 0, 0.5)'
            }
        }
    }
})
