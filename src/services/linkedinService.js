// Serviço para integração com LinkedIn API
// Gerencia autenticação OAuth e publicação de posts

import { createClient } from '@supabase/supabase-js'

class LinkedInService {
  constructor() {
    // Configuração do cliente Supabase
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
    
    // URLs das Edge Functions
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL
    this.authUrl = `${this.baseUrl}/functions/v1/linkedin-auth`
    this.publishUrl = `${this.baseUrl}/functions/v1/linkedin-publish`
  }

  // Método auxiliar para fazer requisições autenticadas
  async makeAuthenticatedRequest(url, body) {
    const { data: { session } } = await this.supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Iniciar processo de autenticação LinkedIn
  async startAuth(redirectUri = null) {
    try {
      const data = await this.makeAuthenticatedRequest(this.authUrl, {
        action: 'authorize',
        redirectUri
      })
      
      // A Edge Function retorna um objeto com authUrl
      return data.authUrl
    } catch (error) {
      console.error('Erro ao iniciar autenticação LinkedIn:', error)
      throw error
    }
  }

  // Completar autenticação com código de callback
  async completeAuth(code, state, redirectUri = null) {
    try {
      const data = await this.makeAuthenticatedRequest(this.authUrl, {
        action: 'callback',
        code,
        state,
        redirectUri
      })
      
      return data
    } catch (error) {
      console.error('Erro ao completar autenticação LinkedIn:', error)
      throw error
    }
  }

  // Desconectar conta LinkedIn
  async disconnect() {
    try {
      const data = await this.makeAuthenticatedRequest(this.authUrl, {
        action: 'disconnect'
      })
      
      return data
    } catch (error) {
      console.error('Erro ao desconectar LinkedIn:', error)
      throw error
    }
  }

  // Verificar status da conexão LinkedIn
  async getConnectionStatus() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await this.supabase
        .from('linkedin_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return {
        connected: !!data,
        profile: data?.profile_data || null,
        expiresAt: data?.expires_at || null
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error)
      return {
        connected: false,
        profile: null,
        expiresAt: null
      }
    }
  }

  // Publicar post no LinkedIn
  async publishPost(postId, content, imageUrl = null) {
    try {
      const data = await this.makeAuthenticatedRequest(this.publishUrl, {
        action: 'publish',
        postId,
        content,
        imageUrl
      })
      
      return data
    } catch (error) {
      console.error('Erro ao publicar post no LinkedIn:', error)
      throw error
    }
  }

  // Agendar post para publicação
  async schedulePost(postId, scheduledFor) {
    try {
      const { data, error } = await this.supabase.functions.invoke('linkedin-scheduler', {
        body: {
          action: 'schedule_post',
          postId,
          scheduledFor
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao agendar post:', error)
      throw error
    }
  }

  // Cancelar agendamento de post
  async cancelSchedule(postId) {
    try {
      const { data, error } = await this.supabase.functions.invoke('linkedin-scheduler', {
        body: {
          action: 'cancel_schedule',
          postId
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      throw error
    }
  }

  // Obter analytics de posts LinkedIn
  async getPostAnalytics(postId) {
    try {
      const { data, error } = await this.supabase
        .from('linkedin_post_analytics')
        .select('*')
        .eq('post_id', postId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || {
        impressions: 0,
        clicks: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagement_rate: 0
      }
    } catch (error) {
      console.error('Erro ao obter analytics:', error)
      return {
        impressions: 0,
        clicks: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagement_rate: 0
      }
    }
  }

  // Obter posts agendados
  async getScheduledPosts() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await this.supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .not('scheduled_for', 'is', null)
        .order('scheduled_for', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao obter posts agendados:', error)
      return []
    }
  }

  // Verificar posts pendentes (para cron job)
  async checkPendingPosts() {
    try {
      const { data, error } = await this.supabase.functions.invoke('linkedin-scheduler', {
        method: 'GET'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao verificar posts pendentes:', error)
      throw error
    }
  }

}

// Exportar instância única do serviço
export const linkedinService = new LinkedInService()
export default linkedinService