import { createSharedComposable, useStorage } from '@vueuse/core'
import { Ref } from 'vue'

export interface IChrono {
    id: string
    title?: string
    startTime: number | null // Timestamp when started, null if paused/stopped
    elapsed: number // Accumulated time in ms
    isRunning: boolean
    color: string
}

export interface IUseChronos {
  chronos:  Ref<IChrono[]>
  startChrono: (title?: string) => void
  addManualChrono: (title: string | undefined, durationMinutes: number) => void
  pauseChrono: (id: string) => void
  resumeChrono: (id: string) => void
  removeChrono: (id: string) => void
}

function _useChronos() : IUseChronos {
    const chronos = useStorage<IChrono[]>('trackup-chronos', [])

    function getRandomColor(): string {
        return (
            '#' +
            Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, '0')
        )
    }

    // Start a new live chrono
    function startChrono(title?: string): void {
        chronos.value.push({
            id: crypto.randomUUID(),
            title,
            startTime: Date.now(),
            elapsed: 0,
            isRunning: true,
            color: getRandomColor()
        })
    }

    // Add a manual chrono (duration in minutes)
    function addManualChrono(title: string | undefined, durationMinutes: number): void {
        chronos.value.push({
            id: crypto.randomUUID(),
            title,
            startTime: null,
            elapsed: durationMinutes * 60 * 1000,
            isRunning: false,
            color: getRandomColor()
        })
    }

    function pauseChrono(id: string): void {
        const chrono = chronos.value.find((c) => c.id === id)
        if (chrono && chrono.isRunning && chrono.startTime) {
            chrono.elapsed += Date.now() - chrono.startTime
            chrono.startTime = null
            chrono.isRunning = false
        }
    }

    function resumeChrono(id: string): void {
        const chrono = chronos.value.find((c) => c.id === id)
        if (chrono && !chrono.isRunning) {
            chrono.startTime = Date.now()
            chrono.isRunning = true
        }
    }

    function removeChrono(id: string): void {
        const index = chronos.value.findIndex((c) => c.id === id)
        if (index !== -1) {
            chronos.value.splice(index, 1)
        }
    }

    return {
        chronos,
        startChrono,
        addManualChrono,
        pauseChrono,
        resumeChrono,
        removeChrono
    }
}

export const useChronos = createSharedComposable(_useChronos)
