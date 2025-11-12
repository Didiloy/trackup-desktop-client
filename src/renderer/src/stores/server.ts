import { defineStore } from 'pinia'
import { computed, ComputedRef, reactive } from 'vue'
import { IServer } from '../../../shared/contracts/interfaces/entities/server.interfaces'
import { IServerMember } from '../../../shared/contracts/interfaces/entities/member.interfaces'

export const useServerStore = defineStore('server', () => {
  // Reactive getters based on auth state

  const state = reactive({
    server: null as IServer | null,
    serverMembers: null as IServerMember[] | null,
    permissions: {
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canJoin: false
    },
    ownership: false as boolean
  })

  const hasServer: ComputedRef<boolean> = computed(() => state.server !== null)
  const hasServerMembers: ComputedRef<boolean> = computed(() => state.serverMembers !== null)

  // Keep the individual getters for data access centralization
  const getPublicId: ComputedRef<string | null> = computed(() => state.server?.public_id ?? null)
  const getServerTypePublicId: ComputedRef<string | null> = computed(
    () => state.server?.server_type_public_id ?? null
  )
  const getMembers: ComputedRef<IServerMember[] | null> = computed(
    () => state.serverMembers ?? null
  )
  const getName: ComputedRef<string | null> = computed(() => state.server?.name ?? null)
  const getDescription: ComputedRef<string | null> = computed(
    () => state.server?.description ?? null
  )
  const getLogo: ComputedRef<string | null> = computed(() => state.server?.logo ?? null)
  const getBanner: ComputedRef<string | null> = computed(() => state.server?.banner ?? null)
  const getInvitationCode: ComputedRef<string | null> = computed(
    () => state.server?.invite_code ?? null
  )
  const getInvitationCodeExpDate: ComputedRef<string | null> = computed(
    () => state.server?.invite_code_expires_at ?? null
  )

  // Keep permission getters
  const isOwnership: ComputedRef<boolean | null> = computed(() => !!state.server?.invite_code) // As only owner can see invite code, if we havve the code we are owner

  // Setter functions
  const setServer = (srv: IServer | null): void => {
    state.server = srv
  }

  const setMembers = (members: IServerMember[] | never): void => {
    state.serverMembers = members
  }

  const resetState = (): void => {
    state.server = null
    state.serverMembers = null
    state.ownership = false
  }

  return {
    hasServer,
    hasServerMembers,

    setServer,
    setMembers,

    getPublicId,
    getServerTypePublicId,
    getMembers,
    getName,
    getDescription,
    getLogo,
    getBanner,
    getInvitationCode,
    getInvitationCodeExpDate,
    isOwnership,

    resetState
  }
})
