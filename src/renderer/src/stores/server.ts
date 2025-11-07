import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
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

  const hasServer = computed(() => state.server !== null)
  const hasServerMembers = computed(() => state.serverMembers !== null)

  // Keep the individual getters for data access centralization
  const getPublicId = computed(() => state.server?.public_id ?? null)
  const getServerTypePublicId = computed(() => state.server?.server_type_public_id ?? null)
  const getMembers = computed(() => state.serverMembers ?? null)
  const getName = computed(() => state.server?.name ?? null)
  const getDescription = computed(() => state.server?.description ?? null)
  const getLogo = computed(() => state.server?.logo ?? null)
  const getInvitationCode = computed(() => state.server?.invite_code ?? null)
  const getInvitationCodeExpDate = computed(() => state.server?.invite_code_expires_at ?? null)

  // Keep permission getters
  const isOwnership = computed(() => !!state.server?.invite_code) // As only owner can see invite code, if we havve the code we are owner

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
    getInvitationCode,
    getInvitationCodeExpDate,
    isOwnership,

    resetState
  }
})
