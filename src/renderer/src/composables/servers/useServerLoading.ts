import { reactive, readonly } from 'vue'

export interface LoadingStep {
    key: string
    icon: string
    status: 'pending' | 'loading' | 'completed' | 'error'
}

interface ServerLoadingState {
    visible: boolean
    serverName: string
    steps: LoadingStep[]
}

const state = reactive<ServerLoadingState>({
    visible: false,
    serverName: '',
    steps: []
})

const defaultSteps: LoadingStep[] = [
    { key: 'server_details', icon: 'pi pi-server', status: 'pending' },
    { key: 'members', icon: 'pi pi-users', status: 'pending' },
    { key: 'enum_definitions', icon: 'pi pi-list', status: 'pending' }
]

/**
 * Shows the loading overlay and initializes steps
 */
export function showServerLoading(serverName = ''): void {
    state.serverName = serverName
    state.steps = defaultSteps.map((step) => ({ ...step, status: 'pending' as const }))
    state.visible = true
}

/**
 * Hides the loading overlay
 */
export function hideServerLoading(): void {
    state.visible = false
}

/**
 * Updates a specific step status
 */
function setStepStatus(stepKey: string, status: LoadingStep['status']): void {
    const step = state.steps.find((s) => s.key === stepKey)
    if (step) {
        step.status = status
    }
}

/**
 * Starts a step (marks it as loading)
 */
export function startLoadingStep(stepKey: string): void {
    setStepStatus(stepKey, 'loading')
}

/**
 * Completes a step successfully
 */
export function completeLoadingStep(stepKey: string): void {
    setStepStatus(stepKey, 'completed')
}

/**
 * Marks a step as error
 */
export function errorLoadingStep(stepKey: string): void {
    setStepStatus(stepKey, 'error')
}

/**
 * Completes all steps quickly (for success animation)
 */
export function completeAllLoadingSteps(): void {
    state.steps.forEach((step) => {
        step.status = 'completed'
    })
}

/**
 * Composable to access loading state
 */
export function useServerLoading() {
    return {
        state: readonly(state)
    }
}
