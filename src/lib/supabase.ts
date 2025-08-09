import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Tipos TypeScript para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          linkedin_token: string | null
          linkedin_profile_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          linkedin_token?: string | null
          linkedin_profile_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          linkedin_token?: string | null
          linkedin_profile_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          status: 'draft' | 'scheduled' | 'published' | 'failed'
          scheduled_for: string | null
          linkedin_post_id: string | null
          ai_generated: boolean
          ai_topic: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          scheduled_for?: string | null
          linkedin_post_id?: string | null
          ai_generated?: boolean
          ai_topic?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          scheduled_for?: string | null
          linkedin_post_id?: string | null
          ai_generated?: boolean
          ai_topic?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          post_id: string
          url: string
          prompt_used: string | null
          ai_model: string | null
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          url: string
          prompt_used?: string | null
          ai_model?: string | null
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          url?: string
          prompt_used?: string | null
          ai_model?: string | null
          file_size?: number | null
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          user_id: string
          frequency: 'daily' | 'weekly' | 'custom'
          schedule_times: string[]
          active: boolean
          last_run: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          frequency?: 'daily' | 'weekly' | 'custom'
          schedule_times: string[]
          active?: boolean
          last_run?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          frequency?: 'daily' | 'weekly' | 'custom'
          schedule_times?: string[]
          active?: boolean
          last_run?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          post_id: string
          likes: number
          comments: number
          shares: number
          views: number
          recorded_at: string
        }
        Insert: {
          id?: string
          post_id: string
          likes?: number
          comments?: number
          shares?: number
          views?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          likes?: number
          comments?: number
          shares?: number
          views?: number
          recorded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Funções utilitárias para autenticação
export const auth = {
  signUp: async (email: string, password: string, userData: { name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

// Funções utilitárias para posts
export const posts = {
  getAll: async (userId: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  create: async (post: Database['public']['Tables']['posts']['Insert']) => {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: Database['public']['Tables']['posts']['Update']) => {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
    return { error }
  }
}

export default supabase