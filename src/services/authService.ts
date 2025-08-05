import { supabase, auth } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  linkedin_token?: string
  linkedin_profile_id?: string
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
}

class AuthService {
  private listeners: ((state: AuthState) => void)[] = []
  private currentState: AuthState = {
    user: null,
    session: null,
    loading: true
  }

  constructor() {
    this.initialize()
  }

  private async initialize() {
    // Verificar sessão existente
    const { session } = await auth.getSession()
    
    if (session?.user) {
      await this.loadUserProfile(session.user)
    }

    this.updateState({
      session,
      loading: false
    })

    // Escutar mudanças de autenticação
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      
      if (session?.user) {
        await this.loadUserProfile(session.user)
      } else {
        this.updateState({
          user: null,
          session: null,
          loading: false
        })
      }
    })
  }

  private async loadUserProfile(user: User) {
    try {
      // Buscar dados do usuário na tabela users
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Usuário não existe na tabela, criar
        const newUser = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0]
        }

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar usuário:', createError)
          return
        }

        this.updateState({
          user: createdUser,
          session: await this.getCurrentSession(),
          loading: false
        })
      } else if (error) {
        console.error('Erro ao carregar perfil:', error)
      } else {
        this.updateState({
          user: userProfile,
          session: await this.getCurrentSession(),
          loading: false
        })
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      this.updateState({
        user: null,
        session: null,
        loading: false
      })
    }
  }

  private async getCurrentSession() {
    const { session } = await auth.getSession()
    return session
  }

  private updateState(updates: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...updates }
    this.listeners.forEach(listener => listener(this.currentState))
  }

  // Métodos públicos
  getState(): AuthState {
    return this.currentState
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    
    // Retornar função de unsubscribe
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  async signUp(email: string, password: string, name: string) {
    try {
      this.updateState({ loading: true })
      
      const { data, error } = await auth.signUp(email, password, { name })
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { data: null, error }
    } finally {
      this.updateState({ loading: false })
    }
  }

  async signIn(email: string, password: string) {
    try {
      this.updateState({ loading: true })
      
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { data: null, error }
    } finally {
      this.updateState({ loading: false })
    }
  }

  async signOut() {
    try {
      this.updateState({ loading: true })
      
      const { error } = await auth.signOut()
      
      if (error) {
        throw error
      }

      this.updateState({
        user: null,
        session: null,
        loading: false
      })

      return { error: null }
    } catch (error) {
      console.error('Erro no logout:', error)
      return { error }
    }
  }

  async updateProfile(updates: Partial<AuthUser>) {
    try {
      if (!this.currentState.user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', this.currentState.user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      this.updateState({
        user: data
      })

      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { data: null, error }
    }
  }

  async linkLinkedIn(token: string, profileId: string) {
    return this.updateProfile({
      linkedin_token: token,
      linkedin_profile_id: profileId
    })
  }

  isAuthenticated(): boolean {
    return !!this.currentState.user && !!this.currentState.session
  }

  hasLinkedInConnected(): boolean {
    return !!this.currentState.user?.linkedin_token
  }
}

// Instância singleton
export const authService = new AuthService()
export default authService