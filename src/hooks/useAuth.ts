import { useState, useEffect } from 'react'
import { authService, type AuthState, type AuthUser } from '../services/authService'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getState())

  useEffect(() => {
    // Inscrever-se nas mudanças de estado
    const unsubscribe = authService.subscribe(setAuthState)

    // Cleanup na desmontagem
    return unsubscribe
  }, [])

  return {
    // Estado
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    isAuthenticated: authService.isAuthenticatedSync(),
    hasLinkedInConnected: authService.hasLinkedInConnected(),

    // Métodos
    signUp: authService.signUp.bind(authService),
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    linkLinkedIn: authService.linkLinkedIn.bind(authService)
  }
}

export default useAuth