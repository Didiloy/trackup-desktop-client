import { createSharedComposable } from '@vueuse/core'
import { reactive, readonly, DeepReadonly } from 'vue'

export interface ILoadingStep {
    key: string
    icon: string
    status: 'pending' | 'loading' | 'completed' | 'error'
}

interface IServerLoadingState {
    visible: boolean
    serverName: string
    steps: ILoadingStep[]
}

export interface IUseServerLoading {
    state: DeepReadonly<IServerLoadingState>
    showServerLoading: (serverName?: string) => void
    hideServerLoading: () => void
    startLoadingStep: (stepKey: string) => void
    completeLoadingStep: (stepKey: string) => void
    errorLoadingStep: (stepKey: string) => void
    completeAllLoadingSteps: () => void
}

const DEFAULT_STEPS: ILoadingStep[] = [
    { key: 'server_details', icon: 'pi pi-server', status: 'pending' },
    { key: 'members', icon: 'pi pi-users', status: 'pending' },
    { key: 'enum_definitions', icon: 'pi pi-list', status: 'pending' }
]

function _useServerLoading(): IUseServerLoading {
    const state = reactive<IServerLoadingState>({
        visible: false,
        serverName: '',
        steps: []
    })

    /**
     * Updates a specific step status
     */
    function setStepStatus(stepKey: string, status: ILoadingStep['status']): void {
        const step = state.steps.find((s) => s.key === stepKey)
        if (step) {
            step.status = status
        }
    }

    /**
     * Shows the loading overlay and initializes steps
     */
    function showServerLoading(serverName = ''): void {
        state.serverName = serverName
        state.steps = DEFAULT_STEPS.map((step) => ({ ...step, status: 'pending' as const }))
        state.visible = true
    }

    /**
     * Hides the loading overlay
     */
    function hideServerLoading(): void {
        state.visible = false
    }

    /**
     * Starts a step (marks it as loading)
     */
    function startLoadingStep(stepKey: string): void {
        setStepStatus(stepKey, 'loading')
    }

    /**
     * Completes a step successfully
     */
    function completeLoadingStep(stepKey: string): void {
        setStepStatus(stepKey, 'completed')
    }

    /**
     * Marks a step as error
     */
    function errorLoadingStep(stepKey: string): void {
        setStepStatus(stepKey, 'error')
    }

    /**
     * Completes all steps quickly (for success animation)
     */
    function completeAllLoadingSteps(): void {
        state.steps.forEach((step) => {
            step.status = 'completed'
        })
    }

    return {
        state: readonly(state),
        showServerLoading,
        hideServerLoading,
        startLoadingStep,
        completeLoadingStep,
        errorLoadingStep,
        completeAllLoadingSteps
    }
}

export const useServerLoading = createSharedComposable(_useServerLoading)
