import { supabase } from '@/supabase'
import { loading, error, setStateFromSession, setError } from './authState'

/**
 * Handle PKCE (Proof Key for Code Exchange) authentication flow
 * Used for more secure OAuth flows
 */
export async function handlePKCEFlow(code: string): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      error.value = exchangeError.message
    } else {
      setStateFromSession(data.session)
    }
  } catch (e) {
    setError(e, 'Authentication failed')
  } finally {
    loading.value = false
  }
}

/**
 * Handle implicit OAuth flow with access and refresh tokens
 * Legacy flow, less secure than PKCE
 */
export async function handleImplicitFlow(accessToken: string, refreshToken: string): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
    if (sessionError) {
      error.value = sessionError.message
    } else {
      setStateFromSession(data.session)
    }
  } catch (e) {
    setError(e, 'Authentication failed')
  } finally {
    loading.value = false
  }
}

